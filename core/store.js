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

const SUBJECTS_COLLECTION = "subjects";
const ASSESSMENTS_COLLECTION = "assessments";

export async function loadData() {
  const subjectSnapshot = await getDocs(collection(db, SUBJECTS_COLLECTION));
  subjects = subjectSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  const assessmentSnapshot = await getDocs(collection(db, ASSESSMENTS_COLLECTION));
  assessments = assessmentSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
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
  const ref = await addDoc(collection(db, SUBJECTS_COLLECTION), subject);

  subjects.push({
    id: ref.id,
    ...subject
  });
}

export async function addAssessment(assessment) {
  const ref = await addDoc(collection(db, ASSESSMENTS_COLLECTION), assessment);

  assessments.push({
    id: ref.id,
    ...assessment
  });
}

export async function updateAssessment(id, updated) {
  await updateDoc(doc(db, ASSESSMENTS_COLLECTION, id), updated);

  assessments = assessments.map(a =>
    a.id === id ? { ...a, ...updated } : a
  );
}