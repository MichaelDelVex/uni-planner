import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

export const firebaseConfig = {
  apiKey: "AIzaSyDRNfikc4u3MkLXVOsCCytR_1qHsjhVueY",
  authDomain: "uni-planner-67431.firebaseapp.com",
  projectId: "uni-planner-67431",
  storageBucket: "uni-planner-67431.firebasestorage.app",
  messagingSenderId: "755971946364",
  appId: "1:755971946364:web:30c9b502bfdabbad01d6f9"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);