// Fungsi untuk berpindah antar langkah/layar photobooth
function goToStep(stepNumber) {
  // Sembunyikan semua step halaman
  const steps = ['step-welcome', 'step-template', 'step-camera', 'step-result'];
  
  steps.forEach(stepId => {
    const element = document.getElementById(stepId);
    if (element) {
      element.classList.add('hidden');
    }
  });

  // Tampilkan step halaman tujuan
  let targetId = '';
  if (stepNumber === 1) targetId = 'step-welcome';
  else if (stepNumber === 2) targetId = 'step-template';
  else if (stepNumber === 3) targetId = 'step-camera';
  else if (stepNumber === 4) targetId = 'step-result';

  const targetElement = document.getElementById(targetId);
  if (targetElement) {
    targetElement.classList.remove('hidden');
  } else {
    console.error("Halaman tidak ditemukan:", targetId);
  }
}
