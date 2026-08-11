// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC5broplCmaQNHGB-PT3fsqEsH_Mc2Stvg",
  authDomain: "sadnan-personal-profile.firebaseapp.com",
  projectId: "sadnan-personal-profile",
  storageBucket: "sadnan-personal-profile.firebasestorage.app",
  messagingSenderId: "363364801383",
  appId: "1:363364801383:web:93fcb97844b8774efcadc2",
  measurementId: "G-GBTFDFG5V8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
