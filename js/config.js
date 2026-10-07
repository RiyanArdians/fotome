// Konfigurasi Firebase dari Console Google
const firebaseConfig = {
  apiKey: "PASTE_API_KEY_DARI_STEP_1",
  authDomain: "fotome-app.firebaseapp.com",
  projectId: "fotome-app",
  storageBucket: "fotome-app.appspot.com",
  messagingSenderId: "PASTE_SENDER_ID",
  appId: "PASTE_APP_ID"
};

// Inisialisasi Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();
