// Fungsi untuk berpindah antar layar
function nextScreen(targetScreenId) {
  // Sembunyikan semua layar yang memiliki class 'screen'
  const screens = document.querySelectorAll('.screen');
  screens.forEach(screen => {
    screen.classList.add('hidden');
  });

  // Tampilkan layar tujuan
  const targetScreen = document.getElementById(targetScreenId);
  if (targetScreen) {
    targetScreen.classList.remove('hidden');
  } else {
    console.error("Layar tidak ditemukan:", targetScreenId);
  }
}
