import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB_77hFB7ffRxZo2Ay8o-hX9dp8ARc8CLQ",
  authDomain: "servicefinder-35c68.firebaseapp.com",
  projectId: "servicefinder-35c68",
  storageBucket: "servicefinder-35c68.firebasestorage.app",
  messagingSenderId: "243264113406",
  appId: "1:243264113406:web:1ab0c0941b0dc5eef573af",
  measurementId: "G-X144FVJCNE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Configure Google Provider
const googleProvider = new GoogleAuthProvider();

// FORCE ACCOUNT SELECTION: This forces the "Choose an Account" screen every time
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google", error);
    throw error;
  }
};

export { auth, googleProvider, signInWithGoogle };