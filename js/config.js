<script type="module">
  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-analytics.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyAp23rOVsuRc1ebd-E6I6AgR10NrsX47cU",
    authDomain: "fotome-app.firebaseapp.com",
    projectId: "fotome-app",
    storageBucket: "fotome-app.firebasestorage.app",
    messagingSenderId: "710818320863",
    appId: "1:710818320863:web:678aaf387af77fd6abf46a",
    measurementId: "G-JE384BFZ31"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
</script>
