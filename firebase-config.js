import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBAK95zAZkX4bj45xnqXS9LMTPjQjcDOBo",
  authDomain: "silent-synthask.firebaseapp.com",
  projectId: "silent-synthask",
  storageBucket: "silent-synthask.firebasestorage.app",
  messagingSenderId: "273937385011",
  appId: "1:273937385011:web:a1e463da178a3b42278546"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
