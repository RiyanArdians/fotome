// 1. Fungsi Pilih Jumlah Foto (misal 3 atau 6 foto)
function selectPhotoCount(count) {
  targetPhotoCount = count;
  
  // Sembunyikan Screen 1, Tampilkan Screen 2 (Pilih Desain/Kamera)
  document.getElementById('screen-select-count').classList.add('hidden');
  document.getElementById('screen-select-frame').classList.remove('hidden');
}

// 2. Fungsi Mulai Kamera / Ambil Foto
function startCamera() {
  const video = document.getElementById('webcam');
  
  // Sembunyikan screen sebelumnya, tampilkan screen kamera
  document.getElementById('screen-select-frame').classList.add('hidden');
  document.getElementById('screen-camera').classList.remove('hidden');

  // Akses Kamera
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(function (stream) {
        video.srcObject = stream;
        video.play();
      })
      .catch(function (err) {
        alert("Gagal mengakses kamera: " + err.message);
      });
  } else {
    alert("Kamera tidak didukung pada browser ini.");
  }
}
