import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Keeping this file synced with src/lib/firebase.js
const firebaseConfig = {
  apiKey: "AIzaSyCKjnyd1X6bGpPcSm7y0YiNVFMNqV1J_yA",
  authDomain: "projenic-panel-3af0d.firebaseapp.com",
  projectId: "projenic-panel-3af0d",
  storageBucket: "projenic-panel-3af0d.firebasestorage.app",
  messagingSenderId: "641691209436",
  appId: "1:641691209436:web:56bc01fb7b7b0b7831cae19"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage, firebaseConfig };
export default app;