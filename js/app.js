// =========================================================
// 1. SISTEM KONTROL AKSES REAL-TIME FIREBASE (BERSIH)
// =========================================================
if (typeof db !== 'undefined') {
  db.collection('settings').doc('wedding_event').onSnapshot(doc => {
    if (doc.exists) {
      const data = doc.data();
      const existingOverlay = document.getElementById('lock-overlay');

      // JIKA STATUS EVENT NONAKTIF / OFF -> TAMPILKAN OVERLAY KUNCI
      if (data.isActive === false) {
        if (!existingOverlay) {
          const lockOverlay = document.createElement('div');
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
          document.body.style.overflow = 'hidden'; // Kunci scroll
        }
      } else {
        // JIKA STATUS EVENT AKTIF / ON -> HAPUS OVERLAY SEPENUHNYA
        if (existingOverlay) {
          existingOverlay.remove();
          document.body.style.overflow = 'auto'; // Buka kembali scroll
        }
      }
    }
  }, error => {
    console.error("Firebase Sync Error:", error);
  });
}
