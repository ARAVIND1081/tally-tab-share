
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// Your Firebase configuration from Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyCpky9FUeXuIRP-wbBNm4SQC7xVCD0Av58",
  authDomain: "authenticator-675ca.firebaseapp.com",
  projectId: "authenticator-675ca",
  storageBucket: "authenticator-675ca.firebasestorage.app",
  messagingSenderId: "109546216436",
  appId: "1:109546216436:web:47c8b149a39173c691f7a1",
  measurementId: "G-ES315KCRK8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export default app;
