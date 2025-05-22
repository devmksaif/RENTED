  // Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCwGvl3CZHS-XI26ZXC1RR3kaHPaz_RbT0",
  authDomain: "rented-62d69.firebaseapp.com",
  projectId: "rented-62d69",
  storageBucket: "rented-62d69.firebasestorage.app",
  messagingSenderId: "532552277621",
  appId: "1:532552277621:web:cd42071b476da4d037223c",
  measurementId: "G-RCHFNKYSTN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

export { auth, analytics }; 