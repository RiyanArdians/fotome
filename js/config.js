// Konfigurasi Firebase
const firebaseConfig = {
  apiKey: "PASTE_API_KEY_KAMU",
  authDomain: "fotome-app.firebaseapp.com",
  projectId: "fotome-app",
  storageBucket: "fotome-app.firebasestorage.app",
  messagingSenderId: "PASTE_SENDER_ID",
  appId: "PASTE_APP_ID"
};

// Inisialisasi Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();
