import { db } from "./firebase.js";

import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

let subjects = [];
let assessments = [];
let currentUserId = null;

function userCollection(collectionName) {
  if (!currentUserId) {
    throw new Error("No user is logged in");
  }

  return collection(db, "users", currentUserId, collectionName);
}

function userDoc(collectionName, id) {
  if (!currentUserId) {
    throw new Error("No user is logged in");
  }

  return doc(db, "users", currentUserId, collectionName, id);
}

export async function loadData(userId) {
  currentUserId = userId;

  const subjectSnapshot = await getDocs(userCollection("subjects"));
  subjects = subjectSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  const assessmentSnapshot = await getDocs(userCollection("assessments"));
  assessments = assessmentSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

export function clearData() {
  currentUserId = null;
  subjects = [];
  assessments = [];
}

export function getSubjects() {
  return subjects;
}

export function getSubjectById(id) {
  return subjects.find(s => s.id === id);
}

export function getAssessments() {
  return assessments;
}

export async function addSubject(subject) {
  const ref = await addDoc(userCollection("subjects"), subject);

  subjects.push({
    id: ref.id,
    ...subject
  });
}

export async function addAssessment(assessment) {
  const ref = await addDoc(userCollection("assessments"), assessment);

  assessments.push({
    id: ref.id,
    ...assessment
  });
}

export async function updateAssessment(id, updated) {
  await updateDoc(userDoc("assessments", id), updated);

  assessments = assessments.map(a =>
    a.id === id ? { ...a, ...updated } : a
  );
}