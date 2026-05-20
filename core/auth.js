import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";

import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";

import { firebaseConfig } from "./firebase.js";

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export async function login() {
  await signInWithPopup(auth, provider);
}

export async function logout() {
  await signOut(auth);
}

export function observeAuth(callback) {
  onAuthStateChanged(auth, callback);
}