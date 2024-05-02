import { initializeApp } from "firebase/app";
import { getFirestore } from "@firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyC2P09XihsRVwJ5DT1Re2WPnViLrETqW6Y",
  authDomain: "belajarcrud-220f7.firebaseapp.com",
  projectId: "belajarcrud-220f7",
  storageBucket: "belajarcrud-220f7.appspot.com",
  messagingSenderId: "20264522668",
  appId: "1:20264522668:web:1566173bacc2e618fea009",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const dbImage = getStorage(app);
