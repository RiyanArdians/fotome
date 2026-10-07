/* =========================================================
   1. SISTEM KONTROL AKSES REAL-TIME FIREBASE (SUPER ADMIN)
   ========================================================= */
if (typeof db !== 'undefined') {
  db.collection('settings').doc('wedding_event').onSnapshot(doc => {
    if (doc.exists) {
      const data = doc.data();
      let lockOverlay = document.getElementById('lock-overlay');

      // Update Teks Nama Pasangan di Halaman Depan jika ada di Firestore
      if (data.title) {
        const welcomeNames = document.querySelector('.welcome-names');
        if (welcomeNames) welcomeNames.innerText = data.title;
      }

      // JIKA STATUS EVENT NONAKTIF / OFF -> TAMPILKAN OVERLAY KUNCI
      if (data.isActive === false) {
        if (!lockOverlay) {
          lockOverlay = document.createElement('div');
          lockOverlay.id = 'lock-overlay';
          lockOverlay.innerHTML = `
            <div style="min-height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; padding: 20px; font-family: 'Plus Jakarta Sans', sans-serif; background-color: #FDFBF7; color: #3D2B2B;">
              <div style="background: #FFF; padding: 40px 25px; border-radius: 24px; box-shadow: 0 15px 35px rgba(140, 98, 98, 0.1); border: 1px solid rgba(216, 180, 180, 0.3); max-width: 400px; width: 100%;">
                <div style="font-size: 3rem; margin-bottom: 10px;">🔒</div>
                <h2 style="font-family: 'Cormorant Garamond', serif; color: #8C6262; font-size: 2rem; margin-bottom: 10px;">Photobooth Ditutup</h2>
                <p style="color: #6E5353; font-size: 0.9rem; line-height: 1.6; margin-bottom: 20px;">
                  Sesi virtual photobooth untuk acara saat ini sedang tidak aktif atau telah selesai.
                </p>
                <div style="font-family: 'Great Vibes', cursive; font-size: 1.8rem; color: #8C6262;">${data.title || 'Riyan & Amelia'}</div>
              </div>
              <p style="margin-top: 25px; font-size: 0.7rem; color: #B39B9B;">FOTOME by Riyan Ardiansyah</p>
            </div>
          `;
          lockOverlay.style.position = 'fixed';
          lockOverlay.style.top = '0';
          lockOverlay.style.left = '0';
          lockOverlay.style.width = '100%';
          lockOverlay.style.height = '100%';
          lockOverlay.style.zIndex = '999999';
          document.body.appendChild(lockOverlay);
          document.body.style.overflow = 'hidden';
        }
      } else {
        // JIKA STATUS EVENT AKTIF / ON -> HAPUS OVERLAY KUNCI
        if (lockOverlay) {
          lockOverlay.remove();
          document.body.style.overflow = 'auto';
        }
      }
    }
  }, error => {
    console.error("Firebase Sync Error:", error);
  });
}

/* =========================================================
   2. VARIABEL & KONFIGURASI UTAMA
   ========================================================= */
let targetPhotoCount = 3;
let selectedDesignStyle = 'floral'; 
let selectedBgColor = 'dusty';
let capturedPhotos = [];

let isTimerActive = true;
let isFlashActive = true;
let videoStream = null;
let currentCameraDeviceId = "";

/* =========================================================
   3. FUNGSI NAVIGASI LAYAR
   ========================================================= */
function goToStep(stepNumber) {
  const steps = ['step-welcome', 'step-template', 'step-camera', 'step-result'];
  
  steps.forEach(stepId => {
    const element = document.getElementById(stepId);
    if (element) {
      element.classList.add('hidden');
    }
  });

  let targetId = '';
  if (stepNumber === 1) targetId = 'step-welcome';
  else if (stepNumber === 2) targetId = 'step-template';
  else if (stepNumber === 3) targetId = 'step-camera';
  else if (stepNumber === 4) targetId = 'step-result';

  const targetElement = document.getElementById(targetId);
  if (targetElement) {
    targetElement.classList.remove('hidden');
  }
}

/* =========================================================
   4. SELEKSI STYLE & WARNA
   ========================================================= */
function selectPhotoCount(count, cardElem) {
  targetPhotoCount = count;
  const cards = cardElem.parentElement.querySelectorAll('.option-card');
  cards.forEach(c => c.classList.remove('active'));
  cardElem.classList.add('active');
}

function selectDesignStyle(styleName, cardElem) {
  selectedDesignStyle = styleName;
  const cards = cardElem.parentElement.querySelectorAll('.design-card');
  cards.forEach(c => c.classList.remove('active'));
  cardElem.classList.add('active');

  const colorSection = document.getElementById('color-section-wrapper');
  if (styleName === 'wavy_red') {
    if (colorSection) colorSection.classList.add('disabled-section');
  } else {
    if (colorSection) colorSection.classList.remove('disabled-section');
  }
}

function selectBgColor(colorName, cardElem) {
  if (selectedDesignStyle === 'wavy_red') return;
  selectedBgColor = colorName;
  const cards = cardElem.parentElement.querySelectorAll('.color-card');
  cards.forEach(c => c.classList.remove('active'));
  cardElem.classList.add('active');
}

/* =========================================================
   5. SKRIP KAMERA & PENGATURAN
   ========================================================= */
function startCameraProcess() {
  goToStep(3);
  capturedPhotos = [];
  initCameraDevices();
}

function initCameraDevices() {
  const selectCam = document.getElementById('camera-select');
  if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
    alert("Kamera tidak didukung oleh browser Anda.");
    return;
  }

  navigator.mediaDevices.enumerateDevices().then(devices => {
    const videoDevices = devices.filter(d => d.kind === 'videoinput');
    if (selectCam) {
      selectCam.innerHTML = '';
      videoDevices.forEach((device, index) => {
        const option = document.createElement('option');
        option.value = device.deviceId;
        option.text = device.label || `Kamera ${index + 1}`;
        selectCam.appendChild(option);
      });
      if (videoDevices.length > 0) {
        currentCameraDeviceId = videoDevices[0].deviceId;
        startCameraStream(currentCameraDeviceId);
      }
    }
  }).catch(err => {
    console.error("Gagal mendapatkan daftar kamera:", err);
  });
}

function onCameraDeviceChange(deviceId) {
  currentCameraDeviceId = deviceId;
  startCameraStream(deviceId);
}

function startCameraStream(deviceId) {
  if (videoStream) {
    videoStream.getTracks().forEach(track => track.stop());
  }

  const constraints = {
    video: deviceId ? { deviceId: { exact: deviceId } } : true
  };

  navigator.mediaDevices.getUserMedia(constraints)
    .then(stream => {
      videoStream = stream;
      const video = document.getElementById('video');
      if (video) {
        video.srcObject = stream;
        video.play();
      }
    })
    .catch(err => {
      console.error("Gagal mengakses kamera:", err);
      alert("Tidak dapat mengakses kamera.");
    });
}

function toggleTimerMode() {
  isTimerActive = !isTimerActive;
  const text = document.getElementById('timer-toggle-text');
  if (text) text.innerText = isTimerActive ? "Timer: ON" : "Timer: OFF";
}

function toggleFlashMode() {
  isFlashActive = !isFlashActive;
  const text = document.getElementById('flash-toggle-text');
  if (text) text.innerText = isFlashActive ? "Flash: ON" : "Flash: OFF";
}

function updateCameraAdjustments() {
  const zoomVal = document.getElementById('zoom-slider').value;
  const brightVal = document.getElementById('brightness-slider').value;
  const video = document.getElementById('video');

  document.getElementById('zoom-val').innerText = zoomVal + 'x';
  document.getElementById('brightness-val').innerText = Math.round(brightVal * 100) + '%';

  if (video) {
    video.style.transform = `scale(${zoomVal})`;
    video.style.filter = `brightness(${brightVal})`;
  }
}

/* =========================================================
   6. PENGAMBILAN FOTO & GENERATE HASIL
   ========================================================= */
function handleSnapButtonClick() {
  const btnSnap = document.getElementById('btn-snap');
  if (btnSnap) btnSnap.disabled = true;

  if (isTimerActive) {
    let count = 3;
    const overlay = document.getElementById('countdown-overlay');
    if (overlay) {
      overlay.innerText = count;
      overlay.classList.remove('hidden');
    }

    const timer = setInterval(() => {
      count--;
      if (count > 0) {
        if (overlay) overlay.innerText = count;
      } else {
        clearInterval(timer);
        if (overlay) overlay.classList.add('hidden');
        takePhotoSnap();
      }
    }, 1000);
  } else {
    takePhotoSnap();
  }
}

function takePhotoSnap() {
  if (isFlashActive) {
    const flash = document.getElementById('flash-overlay');
    if (flash) {
      flash.classList.add('active');
      setTimeout(() => flash.classList.remove('active'), 250);
    }
  }

  const video = document.getElementById('video');
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');

  canvas.width = video.videoWidth || 640;
  canvas.height = video.videoHeight || 480;

  // Tangkap gambar dari video
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  capturedPhotos.push(canvas.toDataURL('image/png'));

  const countText = document.getElementById('photo-count-text');
  if (countText) {
    countText.innerText = `Foto ${capturedPhotos.length} dari ${targetPhotoCount}`;
  }

  if (capturedPhotos.length < targetPhotoCount) {
    setTimeout(() => {
      const btnSnap = document.getElementById('btn-snap');
      if (btnSnap) btnSnap.disabled = false;
    }, 1000);
  } else {
    // Selesai ambil foto, buat kanvas strip photobooth
    setTimeout(() => {
      renderFinalPhotostrip();
      goToStep(4);
      const btnSnap = document.getElementById('btn-snap');
      if (btnSnap) btnSnap.disabled = false;
    }, 1000);
  }
}

function renderFinalPhotostrip() {
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');

  const width = 600;
  const height = 1800;
  canvas.width = width;
  canvas.height = height;

  // Background
  let bgColor = '#8C6262';
  if (selectedBgColor === 'mocha') bgColor = '#B3927A';
  else if (selectedBgColor === 'blue') bgColor = '#83A398';
  else if (selectedBgColor === 'lavender') bgColor = '#A283A2';
  else if (selectedBgColor === 'vanilla') bgColor = '#D6C7BC';
  else if (selectedBgColor === 'dark') bgColor = '#2B1E1E';

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, width, height);

  // Gambar foto-foto yang diambil
  let loadedCount = 0;
  const photoMargin = 40;
  const photoWidth = width - (photoMargin * 2);
  const photoHeight = 380;
  let startY = 80;

  capturedPhotos.forEach((src, idx) => {
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, photoMargin, startY + (idx * (photoHeight + 30)), photoWidth, photoHeight);
      loadedCount++;
      if (loadedCount === capturedPhotos.length) {
        // Teks Bawah
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 36px "Cormorant Garamond", serif';
        ctx.textAlign = 'center';
        ctx.fillText("Riyan & Amelia", width / 2, height - 120);

        ctx.font = '20px "Plus Jakarta Sans", sans-serif';
        ctx.fillText("06 Desember 2026", width / 2, height - 80);

        const resultImg = document.getElementById('result-img');
        const downloadLink = document.getElementById('download-link');
        const dataUrl = canvas.toDataURL('image/png');

        if (resultImg) resultImg.src = dataUrl;
        if (downloadLink) downloadLink.href = dataUrl;
      }
    };
    img.src = src;
  });
}
