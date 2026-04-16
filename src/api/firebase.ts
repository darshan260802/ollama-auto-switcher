// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider} from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAV68wlVGZF_tQ_Lf0TDenoDOX5moZkrco",
  authDomain: "ollama-auto-switcher.firebaseapp.com",
  projectId: "ollama-auto-switcher",
  storageBucket: "ollama-auto-switcher.firebasestorage.app",
  messagingSenderId: "319780431843",
  appId: "1:319780431843:web:37eafa1c43c2277b02a2d6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const googleAuthProvider = new GoogleAuthProvider();
const auth = getAuth();

export default app;
export { googleAuthProvider, auth };