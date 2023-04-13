// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

// import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD20gefB6Y1fN8bMFBAnVxfLIK5ZDdDgOg",
  authDomain: "media-tags-711c8.firebaseapp.com",
  projectId: "media-tags-711c8",
  storageBucket: "media-tags-711c8.appspot.com",
  messagingSenderId: "524436082222",
  appId: "1:524436082222:web:f1f23bf4f3f4cc28bb59bf",
  measurementId: "G-5L3BG71TQS",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
// const analytics = getAnalytics(app);
export const auth = getAuth(app);


export default app;