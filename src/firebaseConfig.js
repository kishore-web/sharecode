import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCjPGevamSnRjoxokOCfe3-5CYTq_xPiZs",
  authDomain: "sharecode-b5700.firebaseapp.com",
  projectId: "sharecode-b5700",
  storageBucket: "sharecode-b5700.firebasestorage.app",
  messagingSenderId: "348893059087",
  appId: "1:348893059087:web:7b2052d052a99dd2302b7a",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
