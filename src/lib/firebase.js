import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Configuration from your screenshots
const firebaseConfig = {
  apiKey: "AIzaSyCKjnyd1X6bGpPcSm7yOYiNVfMNqVlJ_yA",
  authDomain: "projenic-panel-3af0d.firebaseapp.com",
  projectId: "projenic-panel-3af0d",
  storageBucket: "projenic-panel-3af0d.firebasestorage.app",
  messagingSenderId: "641691209436",
  appId: "1:641691209436:web:56bc01b7b7b0b7831cae19",
  measurementId: "G-Z7Q060QGFM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Authentication
const auth = getAuth(app);

// Initialize Firestore (Database)
const db = getFirestore(app);

export { auth, db };