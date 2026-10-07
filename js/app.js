// Cek status event dari Firebase Firestore secara real-time
if (typeof db !== 'undefined') {
  db.collection('settings').doc('wedding_event').onSnapshot(doc => {
    if (doc.exists) {
      const data = doc.data();
      
      // Jika event OFF, kunci aplikasi
      if (data.isActive === false) {
        document.body.innerHTML = `
          <div style="text-align:center; padding: 50px 20px; font-family: sans-serif;">
            <h2 style="color: #8C6262; margin-bottom: 10px;">Photobooth Selesai</h2>
            <p style="color: #666;">Sesi virtual photobooth untuk acara ini sedang tidak aktif.</p>
          </div>
        `;
      }
    }
  });
}

let targetPhotoCount = 3;
let selectedDesignStyle = 'floral'; 
let selectedBgColor = 'dusty';
let capturedPhotos = [];

let currentSelectedDeviceId = null;
let currentStream = null;

let isTimerEnabled = true;
let isFlashEnabled = true;
let manualPhotoIndex = 0;
let isCapturingSession = false;

const lilyAsset = new Image();
lilyAsset.src = './assets/calla-lily-corner.png';

const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const countdownOverlay = document.getElementById('countdown-overlay');
const flashOverlay = document.getElementById('flash-overlay');

function resetEjectAnimation() {
  const resultImg = document.getElementById('result-img');
  if (resultImg) {
    resultImg.classList.remove('eject-active');
  }
}

function goToStep(stepNumber) {
  resetEjectAnimation();
  turnOffHardwareTorch();

  document.getElementById('step-welcome').classList.add('hidden');
  document.getElementById('step-template').classList.add('hidden');
  document.getElementById('step-camera').classList.add('hidden');
  document.getElementById('step-result').classList.add('hidden');

  if (stepNumber === 1) document.getElementById('step-welcome').classList.remove('hidden');
  if (stepNumber === 2) document.getElementById('step-template').classList.remove('hidden');
  if (stepNumber === 3) document.getElementById('step-camera').classList.remove('hidden');
  if (stepNumber === 4) document.getElementById('step-result').classList.remove('hidden');
}

function selectPhotoCount(count, element) {
  targetPhotoCount = count;
  element.parentElement.querySelectorAll('.option-card').forEach(el => el.classList.remove('active'));
  element.classList.add('active');
}

function selectDesignStyle(styleName, element) {
  selectedDesignStyle = styleName;
  document.querySelectorAll('.design-card').forEach(el => el.classList.remove('active'));
  element.classList.add('active');

  const colorWrapper = document.getElementById('color-section-wrapper');
  if (styleName === 'receipt' || styleName === 'wavy_red' || styleName === 'fotome_brand') {
    colorWrapper.classList.add('disabled');
  } else {
    colorWrapper.classList.remove('disabled');
  }
}

function selectBgColor(colorTheme, element) {
  selectedBgColor = colorTheme;
  element.parentElement.querySelectorAll('.color-card').forEach(el => el.classList.remove('active'));
  element.classList.add('active');
}

function toggleTimerMode() {
  isTimerEnabled = !isTimerEnabled;
  const label = document.getElementById('timer-toggle-text');
  label.innerText = isTimerEnabled ? "Timer: ON" : "Timer: OFF";

  updateSnapButtonUI();
}

function toggleFlashMode() {
  isFlashEnabled = !isFlashEnabled;
  const label = document.getElementById('flash-toggle-text');
  label.innerText = isFlashEnabled ? "Flash: ON" : "Flash: OFF";
}

function updateCameraAdjustments() {
  const zoomVal = parseFloat(document.getElementById('zoom-slider').value);
  const brightnessVal = parseFloat(document.getElementById('brightness-slider').value);

  document.getElementById('zoom-val').innerText = zoomVal.toFixed(1) + 'x';
  document.getElementById('brightness-val').innerText = Math.round(brightnessVal * 100) + '%';

  const isFrontCamera = video.classList.contains('mirror');
  const mirrorScale = isFrontCamera ? -1 : 1;
  video.style.transform = `scaleX(${mirrorScale}) scale(${zoomVal})`;
  video.style.filter = `brightness(${brightnessVal})`;
}

function startCameraProcess() {
  goToStep(3);
  capturedPhotos = [];
  manualPhotoIndex = 0;
  isCapturingSession = false;

  document.getElementById('zoom-slider').value = 1;
  document.getElementById('brightness-slider').value = 1;

  updateSnapButtonUI();
  openCameraStream();
}

function updateSnapButtonUI() {
  const snapLabel = document.getElementById('btn-snap-label');
  const photoCountText = document.getElementById('photo-count-text');

  if (isTimerEnabled) {
    photoCountText.innerText = `Foto 1 dari ${targetPhotoCount}`;
    snapLabel.innerText = "Mulai Foto Otomatis (3s)";
  } else {
    photoCountText.innerText = `Foto ${manualPhotoIndex + 1} dari ${targetPhotoCount}`;
    snapLabel.innerText = `Jepret Foto (${manualPhotoIndex + 1}/${targetPhotoCount})`;
  }
}

async function populateCameraDevices() {
  const cameraSelect = document.getElementById('camera-select');
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(d => d.kind === 'videoinput');

    cameraSelect.innerHTML = '';

    if (videoDevices.length === 0) {
      cameraSelect.innerHTML = '<option value="">Kamera Tidak Ditemukan</option>';
      return;
    }

    let hasAddedFront = false;
    let hasAddedBack = false;
    const filteredOptions = [];

    videoDevices.forEach((device, index) => {
      const labelLower = (device.label || '').toLowerCase();
      
      let isFront = labelLower.includes('front') || labelLower.includes('user') || labelLower.includes('depan');
      let isBack = labelLower.includes('back') || labelLower.includes('environment') || labelLower.includes('belakang');

      if (isFront) {
        if (!hasAddedFront) {
          filteredOptions.push({ id: device.deviceId, label: '📷 Kamera Depan' });
          hasAddedFront = true;
        }
      } else if (isBack) {
        if (!hasAddedBack) {
          filteredOptions.push({ id: device.deviceId, label: '📷 Kamera Belakang' });
          hasAddedBack = true;
        }
      } else {
        const customLabel = device.label ? `🔌 ${device.label}` : `🔌 Kamera Eksternal ${index + 1}`;
        filteredOptions.push({ id: device.deviceId, label: customLabel });
      }
    });

    if (filteredOptions.length === 0) {
      videoDevices.forEach((d, i) => {
        filteredOptions.push({ id: d.deviceId, label: `📷 Kamera ${i + 1}` });
      });
    }

    filteredOptions.forEach(opt => {
      const option = document.createElement('option');
      option.value = opt.id;
      option.text = opt.label;
      if (currentSelectedDeviceId && opt.id === currentSelectedDeviceId) {
        option.selected = true;
      }
      cameraSelect.appendChild(option);
    });

    if (!currentSelectedDeviceId && filteredOptions.length > 0) {
      currentSelectedDeviceId = filteredOptions[0].id;
    }
  } catch (e) {
    console.log("Error enumerateDevices:", e);
  }
}

function openCameraStream() {
  if (currentStream) {
    currentStream.getTracks().forEach(track => track.stop());
  }

  const videoConstraints = {
    width: { ideal: 1080 },
    height: { ideal: 1440 }
  };

  if (currentSelectedDeviceId) {
    videoConstraints.deviceId = { exact: currentSelectedDeviceId };
  } else {
    videoConstraints.facingMode = "user";
  }

  navigator.mediaDevices.getUserMedia({ video: videoConstraints, audio: false })
  .then(async stream => { 
    currentStream = stream;
    video.srcObject = stream;

    const track = stream.getVideoTracks()[0];
    const settings = track.getSettings ? track.getSettings() : {};
    const label = (track.label || '').toLowerCase();

    if (settings.facingMode === 'user' || label.includes('front') || label.includes('user') || label.includes('depan')) {
      video.classList.add('mirror');
    } else {
      video.classList.remove('mirror');
    }

    await populateCameraDevices();
    updateCameraAdjustments();
  })
  .catch(err => {
    alert("Tidak dapat mengakses kamera. Pastikan memberikan izin kamera di browser kamu.");
    goToStep(2);
  });
}

function onCameraDeviceChange(deviceId) {
  if (!deviceId) return;
  currentSelectedDeviceId = deviceId;
  openCameraStream();
}

function turnHardwareTorch(state) {
  if (!currentStream) return;
  const track = currentStream.getVideoTracks()[0];
  if (!track) return;

  const capabilities = track.getCapabilities ? track.getCapabilities() : {};
  if (capabilities.torch) {
    track.applyConstraints({ advanced: [{ torch: state }] }).catch(e => console.log(e));
  }
}

function turnOffHardwareTorch() {
  turnHardwareTorch(false);
}

async function triggerDoubleFlashSequence() {
  flashOverlay.style.opacity = '0.4';
  turnHardwareTorch(true);
  await delay(80);

  flashOverlay.style.opacity = '0';
  turnHardwareTorch(false);
  await delay(120);

  flashOverlay.style.opacity = '1';
  turnHardwareTorch(true);
}

function stopFlashSequence() {
  flashOverlay.style.opacity = '0';
  turnHardwareTorch(false);
}

async function handleSnapButtonClick() {
  if (isTimerEnabled) {
    startAutoPhotoSequence();
  } else {
    captureManualSinglePhoto();
  }
}

async function startAutoPhotoSequence() {
  document.getElementById('btn-snap').disabled = true;
  document.getElementById('btn-snap').style.opacity = '0.5';
  capturedPhotos = [];

  for (let i = 1; i <= targetPhotoCount; i++) {
    document.getElementById('photo-count-text').innerText = `Foto ${i} dari ${targetPhotoCount}`;
    await runCountdown(3);
    
    if (isFlashEnabled) {
      await triggerDoubleFlashSequence();
      await delay(100);
    }
    
    captureSingleFrame();

    if (isFlashEnabled) {
      stopFlashSequence();
    }

    await delay(1000);
  }

  renderPhotostrip();
  goToStep(4);

  document.getElementById('btn-snap').disabled = false;
  document.getElementById('btn-snap').style.opacity = '1';
}

async function captureManualSinglePhoto() {
  if (isFlashEnabled) {
    await triggerDoubleFlashSequence();
    await delay(100);
  }

  captureSingleFrame();

  if (isFlashEnabled) {
    stopFlashSequence();
  }

  manualPhotoIndex++;

  if (manualPhotoIndex < targetPhotoCount) {
    updateSnapButtonUI();
  } else {
    renderPhotostrip();
    goToStep(4);
  }
}

function runCountdown(seconds) {
  return new Promise(resolve => {
    countdownOverlay.classList.remove('hidden');
    let count = seconds;
    countdownOverlay.innerText = count;

    const timer = setInterval(() => {
      count--;
      if (count > 0) {
        countdownOverlay.innerText = count;
      } else {
        clearInterval(timer);
        countdownOverlay.classList.add('hidden');
        resolve();
      }
    }, 1000);
  });
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function captureSingleFrame() {
  const tempCanvas = document.createElement('canvas');
  const w = video.videoWidth || 640;
  const h = video.videoHeight || 480;
  tempCanvas.width = w;
  tempCanvas.height = h;
  const ctx = tempCanvas.getContext('2d');

  const zoomVal = parseFloat(document.getElementById('zoom-slider').value);
  const brightnessVal = parseFloat(document.getElementById('brightness-slider').value);

  ctx.save();

  let totalBrightness = brightnessVal;
  if (isFlashEnabled) {
    totalBrightness *= 1.22;
  }
  ctx.filter = `brightness(${totalBrightness}) contrast(1.05)`;

  if (video.classList.contains('mirror')) {
    ctx.translate(w, 0);
    ctx.scale(-1, 1);
  }

  const cropW = w / zoomVal;
  const cropH = h / zoomVal;
  const cropX = (w - cropW) / 2;
  const cropY = (h - cropH) / 2;

  ctx.drawImage(video, cropX, cropY, cropW, cropH, 0, 0, w, h);
  ctx.restore();

  capturedPhotos.push(tempCanvas.toDataURL('image/png'));
}

function drawWavyRect(ctx, x, y, width, height, waveCountX, waveCountY, waveDepth) {
  ctx.beginPath();
  const stepX = width / waveCountX;
  const stepY = height / waveCountY;

  ctx.moveTo(x, y);
  for (let i = 0; i < waveCountX; i++) {
    ctx.quadraticCurveTo(x + (i + 0.5) * stepX, y - waveDepth, x + (i + 1) * stepX, y);
  }
  for (let i = 0; i < waveCountY; i++) {
    ctx.quadraticCurveTo(x + width + waveDepth, y + (i + 0.5) * stepY, x + width, y + (i + 1) * stepY);
  }
  for (let i = waveCountX; i > 0; i--) {
    ctx.quadraticCurveTo(x + (i - 0.5) * stepX, y + height + waveDepth, x + (i - 1) * stepX, y + height);
  }
  for (let i = waveCountY; i > 0; i--) {
    ctx.quadraticCurveTo(x - waveDepth, y + (i - 0.5) * stepY, x, y + (i - 1) * stepY);
  }
  ctx.closePath();
}

function applyGrayscaleToImage(ctx, x, y, width, height) {
  const imgData = ctx.getImageData(x, y, width, height);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const avg = 0.3 * data[i] + 0.59 * data[i + 1] + 0.11 * data[i + 2];
    data[i]     = avg;
    data[i + 1] = avg;
    data[i + 2] = avg;
  }
  ctx.putImageData(imgData, x, y);
}

function drawMaskedImage(ctx, img, x, y, size, designStyle, index = 0) {
  ctx.save();

  if (designStyle === 'wavy_red') {
    ctx.fillStyle = "#A82B2B";
    drawWavyRect(ctx, x - 12, y - 12, size + 24, size + 24, 8, 8, 12);
    ctx.fill();

    ctx.beginPath();
    drawWavyRect(ctx, x, y, size, size, 8, 8, 10);
    ctx.clip();
  } else if (designStyle === 'engagement') {
    const photoDisplaySize = 400;
    const topPad = 22;
    const sidePadLeft = (index % 2 === 0) ? 35 : 18;
    const sidePadRight = (index % 2 === 0) ? 18 : 35;
    const bottomPad = 26;

    const customX = (600 - photoDisplaySize) / 2;
    const frameX = customX - sidePadLeft;
    const frameY = y - topPad;
    const frameW = photoDisplaySize + sidePadLeft + sidePadRight;
    const frameH = photoDisplaySize + topPad + bottomPad;

    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(frameX, frameY, frameW, frameH);

    ctx.beginPath();
    ctx.rect(customX, y, photoDisplaySize, photoDisplaySize);
    ctx.clip();

    x = customX;
    size = photoDisplaySize;
  } else if (designStyle === 'fotome_brand') {
    ctx.shadowColor = "rgba(140, 43, 56, 0.25)";
    ctx.shadowBlur = 24;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 10;

    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.roundRect(x - 10, y - 10, size + 20, size + 20, 16);
    ctx.fill();

    ctx.shadowColor = "transparent";

    ctx.beginPath();
    ctx.roundRect(x, y, size, size, 12);
    ctx.clip();
  } else {
    ctx.beginPath();
    ctx.roundRect(x, y, size, size, 6);
    ctx.clip();
  }

  const imgAspect = img.width / img.height;
  let drawW, drawH, offsetX, offsetY;

  if (imgAspect > 1) { 
    drawH = size; drawW = size * imgAspect;
    offsetX = x - (drawW - size) / 2; offsetY = y;
  } else { 
    drawW = size; drawH = size / imgAspect;
    offsetX = x; offsetY = y - (drawH - size) / 2;
  }

  ctx.drawImage(img, offsetX, offsetY, drawW, drawH);

  if (designStyle === 'receipt') {
    applyGrayscaleToImage(ctx, x, y, size, size);
  }

  ctx.restore();

  if (designStyle === 'floral') {
    ctx.save();
    ctx.strokeStyle = "rgba(0,0,0,0.18)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(x, y, size, size, 6);
    ctx.stroke();
    ctx.restore();
  } else if (designStyle === 'fotome_brand') {
    ctx.save();
    ctx.strokeStyle = "rgba(140, 43, 56, 0.35)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(x - 10, y - 10, size + 20, size + 20, 16);
    ctx.stroke();
    ctx.restore();
  }
}

function drawCallaLilyOuterCorner(ctx, x, y, width, height, flipX = false, flipY = false) {
  ctx.save();
  ctx.translate(x, y);
  if (flipX) ctx.scale(-1, 1);
  if (flipY) ctx.scale(1, -1);

  if (lilyAsset.complete && lilyAsset.naturalWidth !== 0) {
    ctx.drawImage(lilyAsset, 0, 0, width, height);
  } else {
    ctx.strokeStyle = "#C5A059"; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(200, 200); ctx.stroke();

    ctx.fillStyle = "#3F5E4D";
    ctx.beginPath(); ctx.ellipse(80, 80, 100, 55, Math.PI / 4, 0, 2 * Math.PI); ctx.fill();

    ctx.fillStyle = "#FFFFFF"; ctx.strokeStyle = "#D2C9BD"; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.ellipse(50, 50, 50, 75, Math.PI / 6, 0, 2 * Math.PI); ctx.fill(); ctx.stroke();
    
    ctx.fillStyle = "#D4AF37";
    ctx.beginPath(); ctx.ellipse(50, 50, 9, 32, 0, 0, 2 * Math.PI); ctx.fill();
  }

  ctx.restore();
}

function drawDummyBarcode(ctx, centerX, centerY, width, height) {
  ctx.save();
  ctx.fillStyle = "#111111";
  const startX = centerX - width / 2;
  let currX = startX;

  while (currX < startX + width) {
    const barW = Math.floor(Math.random() * 4) + 2;
    const spaceW = Math.floor(Math.random() * 3) + 2;
    ctx.fillRect(currX, centerY - height / 2, barW, height);
    currX += barW + spaceW;
  }
  ctx.restore();
}

function drawChatHeaderBar(ctx, width, textColor) {
  ctx.save();
  ctx.fillStyle = "#8C2B38";
  ctx.font = "italic 700 42px 'Playfair Display', serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("Catch The Moment", width / 2, 58);
  ctx.restore();
}

function drawChatMenuBox(ctx, x, y, width, height) {
  ctx.save();
  ctx.fillStyle = "rgba(255, 255, 255, 0.92)";
  ctx.strokeStyle = "rgba(0, 0, 0, 0.06)";
  ctx.lineWidth = 1;

  ctx.beginPath();
  ctx.roundRect(x, y, width, height, 16);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#111111";
  ctx.font = "500 16px 'Plus Jakarta Sans', sans-serif";
  ctx.textAlign = "left";

  const items = [
    { text: "Reply", icon: "↩" },
    { text: "Save", icon: "↓" },
    { text: "Forward", icon: "➢" }
  ];

  items.forEach((item, idx) => {
    const itemY = y + 26 + idx * 36;
    ctx.fillText(item.text, x + 20, itemY);
    ctx.textAlign = "right";
    ctx.fillText(item.icon, x + width - 20, itemY);
    ctx.textAlign = "left";

    ctx.strokeStyle = "rgba(0, 0, 0, 0.05)";
    ctx.beginPath();
    ctx.moveTo(x + 15, itemY + 12);
    ctx.lineTo(x + width - 15, itemY + 12);
    ctx.stroke();
  });

  ctx.fillStyle = "#D93838";
  ctx.fillText("Unsend", x + 20, y + 134);
  ctx.textAlign = "right";
  ctx.fillText("⊘", x + width - 20, y + 134);

  ctx.restore();
}

function renderPhotostrip() {
  const stripWidth = 600;
  const photoBoxSize = 420;
  
  let headerHeight = 100;
  let footerHeight = 220;

  if (selectedDesignStyle === 'receipt') { headerHeight = 260; footerHeight = 310; }
  else if (selectedDesignStyle === 'wavy_red') { headerHeight = 150; footerHeight = 250; }
  else if (selectedDesignStyle === 'fotome_brand') { headerHeight = 110; footerHeight = 260; }
  else if (selectedDesignStyle === 'engagement') { headerHeight = 110; footerHeight = 300; }

  const gapY = selectedDesignStyle === 'wavy_red' ? 60 : (selectedDesignStyle === 'engagement' ? 55 : 45);
  const totalPhotoHeight = targetPhotoCount * (photoBoxSize + gapY);
  const stripHeight = headerHeight + totalPhotoHeight + footerHeight;

  canvas.width = stripWidth;
  canvas.height = stripHeight;
  const ctx = canvas.getContext('2d');

  let cardInnerColor = "#F9F1F1";
  let textColor = "#8C6262";
  let badgeBgColor = "#FFFFFF";

  if (selectedBgColor === 'mocha') { cardInnerColor = "#B3927A"; textColor = "#FFFFFF"; badgeBgColor = "#FFFFFF"; }
  else if (selectedBgColor === 'blue') { cardInnerColor = "#83A398"; textColor = "#FFFFFF"; badgeBgColor = "#FFFFFF"; }
  else if (selectedBgColor === 'lavender') { cardInnerColor = "#A283A2"; textColor = "#FFFFFF"; badgeBgColor = "#FFFFFF"; }
  else if (selectedBgColor === 'vanilla') { cardInnerColor = "#D6C7BC"; textColor = "#3D2B2B"; badgeBgColor = "#FFFFFF"; }
  else if (selectedBgColor === 'dark') { cardInnerColor = "#2B1E1E"; textColor = "#D8B4B4"; badgeBgColor = "#FFFFFF"; }
  else if (selectedBgColor === 'dusty') { cardInnerColor = "#8C6262"; textColor = "#FFFFFF"; badgeBgColor = "#FFFFFF"; }

  if (selectedDesignStyle === 'wavy_red') { cardInnerColor = "#FAF6EE"; textColor = "#A82B2B"; }
  else if (selectedDesignStyle === 'receipt') { cardInnerColor = "#F5F4F0"; textColor = "#111111"; }
  else if (selectedDesignStyle === 'fotome_brand') { cardInnerColor = "#FAFAFA"; textColor = "#111111"; }

  ctx.fillStyle = cardInnerColor;
  ctx.fillRect(0, 0, stripWidth, stripHeight);

  if (selectedDesignStyle === 'floral') {
    drawCallaLilyOuterCorner(ctx, 0, 0, 420, 320, false, false);
    drawCallaLilyOuterCorner(ctx, stripWidth, stripHeight, 440, 340, true, true);
  } else if (selectedDesignStyle === 'receipt') {
    ctx.fillStyle = textColor;
    ctx.textAlign = "center";
    ctx.font = "bold 38px 'Courier Prime', monospace";
    ctx.fillText("RIYAN & AMELIA", stripWidth / 2, 70);

    ctx.font = "bold 18px 'Courier Prime', monospace";
    ctx.fillText("TRACK ORDER / WEDDING VIBES", stripWidth / 2, 105);
    ctx.font = "16px 'Courier Prime', monospace";
    ctx.fillText("DEC 06, 2026 • 10:00 AM", stripWidth / 2, 130);

    ctx.strokeStyle = "#111111";
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.moveTo(50, 150); ctx.lineTo(stripWidth - 50, 150);
    ctx.stroke();

    ctx.textAlign = "left";
    ctx.font = "16px 'Courier Prime', monospace";
    ctx.fillText("LADY LOVE - THE SACRED SOUL", 60, 180);
    ctx.fillText("FOREVER & ALWAYS - WAVE TO EARTH", 60, 205);
    ctx.fillText("TOTAL HAPPINESS", 60, 230);

    ctx.textAlign = "right";
    ctx.font = "16px 'Courier Prime', monospace";
    ctx.fillText("03:31", stripWidth - 60, 180);
    ctx.fillText("04:00", stripWidth - 60, 205);

    ctx.font = "bold 32px 'Courier Prime', monospace";
    ctx.textBaseline = "middle";
    ctx.fillText("∞", stripWidth - 60, 228);
    ctx.textBaseline = "alphabetic";

    ctx.beginPath();
    ctx.moveTo(50, 245); ctx.lineTo(stripWidth - 50, 245);
    ctx.stroke();
    ctx.setLineDash([]);
  } else if (selectedDesignStyle === 'wavy_red') {
    ctx.fillStyle = "#A82B2B";
    ctx.textAlign = "center";
    ctx.font = "46px 'Great Vibes', cursive";
    ctx.fillText("The Wedding of", stripWidth / 2, 70);

    ctx.font = "18px 'Cormorant Garamond', serif";
    ctx.fillText("— ♡ —", stripWidth / 2, 105);
  } else if (selectedDesignStyle === 'fotome_brand') {
    drawChatHeaderBar(ctx, stripWidth, textColor);
  } else if (selectedDesignStyle === 'engagement') {
    ctx.fillStyle = textColor;
    ctx.textAlign = "center";
    ctx.font = "bold 32px 'Plus Jakarta Sans', sans-serif";
    ctx.letterSpacing = "18px";
    ctx.fillText("F O T O M E", stripWidth / 2, 60);
  }

  const startY = headerHeight;

  let loadedCount = 0;
  capturedPhotos.forEach((photoSrc, index) => {
    const img = new Image();
    img.onload = () => {
      const photoY = startY + index * (photoBoxSize + gapY);

      drawMaskedImage(ctx, img, (stripWidth - photoBoxSize) / 2, photoY, photoBoxSize, selectedDesignStyle, index);

      loadedCount++;
      if (loadedCount === targetPhotoCount) {
        const footerY = startY + targetPhotoCount * (photoBoxSize + gapY) + 20;

        if (selectedDesignStyle === 'floral') {
          ctx.fillStyle = textColor;
          ctx.font = "bold 42px 'Cormorant Garamond', serif";
          ctx.textAlign = "left";
          ctx.fillText("RIYAN & AMELIA", 60, footerY + 30);

          ctx.font = "600 20px 'Plus Jakarta Sans', sans-serif";
          ctx.fillText("06 Desember 2026", 60, footerY + 65);

          ctx.font = "500 12px 'Plus Jakarta Sans', sans-serif";
          ctx.fillText("FOTOME by Riyan Ardiansyah", 60, footerY + 105);

        } else if (selectedDesignStyle === 'receipt') {
          ctx.fillStyle = "#111111";
          ctx.textAlign = "center";
          ctx.font = "italic 16px 'Courier Prime', monospace";
          ctx.fillText("Crafted for the moment made for what matters most.", stripWidth / 2, footerY + 40);
          ctx.fillText("Every detail designed to capture timeless love.", stripWidth / 2, 65 + footerY);

          ctx.font = "bold 16px 'Courier Prime', monospace";
          ctx.fillText("ALL RIGHTS RESERVED • 2026", stripWidth / 2, footerY + 110);

          drawDummyBarcode(ctx, stripWidth / 2, footerY + 160, 280, 50);

          ctx.font = "14px 'Courier Prime', monospace";
          ctx.fillText("THE ART OF THE MOMENT", stripWidth / 2, footerY + 225);

          ctx.save();
          ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
          ctx.font = "500 12px 'Plus Jakarta Sans', sans-serif";
          ctx.textAlign = "center";
          ctx.fillText("FOTOME by Riyan Ardiansyah", stripWidth / 2, footerY + 255);
          ctx.restore();

        } else if (selectedDesignStyle === 'wavy_red') {
          ctx.fillStyle = "#A82B2B";
          ctx.font = "700 58px 'Great Vibes', cursive";
          ctx.textAlign = "center";
          ctx.fillText("Riyan & Amelia", stripWidth / 2, footerY + 50);

          ctx.font = "600 22px 'Cormorant Garamond', serif";
          ctx.fillText("— 06 Desember 2026 —", stripWidth / 2, footerY + 95);

          ctx.save();
          ctx.fillStyle = "rgba(168, 43, 43, 0.55)";
          ctx.font = "500 12px 'Plus Jakarta Sans', sans-serif";
          ctx.textAlign = "center";
          ctx.fillText("FOTOME by Riyan Ardiansyah", stripWidth / 2, footerY + 150);
          ctx.restore();

        } else if (selectedDesignStyle === 'fotome_brand') {
          ctx.fillStyle = "#8C2B38";
          ctx.textAlign = "left";
          
          ctx.font = "italic 700 56px 'Playfair Display', serif";
          ctx.fillText("FOTOME", 60, footerY + 65);

          ctx.font = "600 22px 'Plus Jakarta Sans', sans-serif";
          ctx.fillStyle = "#333333";
          ctx.fillText("by Riyan Ardiansyah", 60, footerY + 105);

          drawChatMenuBox(ctx, 310, footerY + 15, 230, 160);

        } else if (selectedDesignStyle === 'engagement') {
          ctx.save();
          ctx.fillStyle = textColor;
          ctx.textAlign = "center";
          
          ctx.letterSpacing = "0px";
          ctx.font = "italic 700 60px 'Bodoni Moda', serif";
          ctx.fillText("Vira & Wahyu", stripWidth / 2, footerY + 60);

          ctx.font = "600 22px 'Plus Jakarta Sans', sans-serif";
          ctx.letterSpacing = "3px";
          ctx.fillText("THE ENGAGEMENT DAY", stripWidth / 2, footerY + 105);

          ctx.font = "500 18px 'Plus Jakarta Sans', sans-serif";
          ctx.letterSpacing = "2px";
          ctx.fillText("04 OKTOBER 2026", stripWidth / 2, footerY + 138);

          ctx.font = "500 10.5px 'Plus Jakarta Sans', sans-serif";
          ctx.letterSpacing = "1.5px";
          ctx.globalAlpha = 0.75;
          ctx.fillText("FOTOME by Riyan Ardiansyah", stripWidth / 2, footerY + 182);

          ctx.restore();
        }

        const dataUrl = canvas.toDataURL('image/png');
        const resultImg = document.getElementById('result-img');
        
        resultImg.classList.remove('eject-active');
        resultImg.src = dataUrl;
        document.getElementById('download-link').href = dataUrl;

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            resultImg.classList.add('eject-active');
          });
        });
      }
    };
    img.src = photoSrc;
  });
}
