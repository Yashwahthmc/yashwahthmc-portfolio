import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDi8QhJzWP9zZ1ndicLw9aSaqJM91PHAF0",
  authDomain: "yashwahthmc-portfolio.firebaseapp.com",
  projectId: "yashwahthmc-portfolio",
  storageBucket: "yashwahthmc-portfolio.firebasestorage.app",
  messagingSenderId: "634555522426",
  appId: "1:634555522426:web:baccd94316eed2f6494ac3",
  measurementId: "G-RLBER140YJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics
export const analytics = getAnalytics(app);

// Firestore Database
export const db = getFirestore(app);

// Firebase Authentication
export const auth = getAuth(app);

