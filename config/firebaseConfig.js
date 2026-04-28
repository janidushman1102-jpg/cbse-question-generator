import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCCtiBSoT3J2I5WyZpZF040q7TqvbuiGFY",
  authDomain: "cbse-question-generator.firebaseapp.com",
  projectId: "cbse-question-generator",
  storageBucket: "cbse-question-generator.firebasestorage.app",
  messagingSenderId: "685043625043",
  appId: "1:685043625043:web:47fa2c21defd1507fe2aa6"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
