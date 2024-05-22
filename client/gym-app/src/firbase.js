// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCgbgdXK_zkU2yHmrA2QZOyI6xPClSc5es",
  authDomain: "gym-app-43f4f.firebaseapp.com",
  projectId: "gym-app-43f4f",
  storageBucket: "gym-app-43f4f.appspot.com",
  messagingSenderId: "312819772068",
  appId: "1:312819772068:web:89700731e26a5e17f31431"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: "select_account" });

export const signInWithGoogle = () => signInWithPopup(auth, provider);
export { auth };