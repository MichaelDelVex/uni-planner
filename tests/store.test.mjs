import assert from "node:assert/strict";
import test from "node:test";
import { loadBrowserModule } from "./helpers/moduleLoader.mjs";

const storePath = new URL("../core/store.js", import.meta.url);

function plain(value) {
  return JSON.parse(JSON.stringify(value));
}

function createFirestoreMocks(seed) {
  const data = structuredClone(seed);
  let nextId = 1;

  function ensureCollection(uid, collectionName) {
    data[uid] ??= {};
    data[uid][collectionName] ??= {};
    return data[uid][collectionName];
  }

  return {
    data,
    db: {},
    collection(_db, root, uid, collectionName) {
      assert.equal(root, "users");
      return { uid, collectionName };
    },
    doc(_db, root, uid, collectionName, id) {
      assert.equal(root, "users");
      return { uid, collectionName, id };
    },
    async getDocs(ref) {
      const docs = Object.entries(ensureCollection(ref.uid, ref.collectionName));
      return {
        docs: docs.map(([id, value]) => ({
          id,
          data: () => structuredClone(value)
        }))
      };
    },
    async addDoc(ref, value) {
      const id = `new-${nextId++}`;
      ensureCollection(ref.uid, ref.collectionName)[id] = structuredClone(value);
      return { id };
    },
    async updateDoc(ref, value) {
      Object.assign(ensureCollection(ref.uid, ref.collectionName)[ref.id], structuredClone(value));
    },
    async deleteDoc(ref) {
      delete ensureCollection(ref.uid, ref.collectionName)[ref.id];
    }
  };
}

test("store keeps data scoped to the current user and mirrors CRUD in memory", async () => {
  const mocks = createFirestoreMocks({
    userA: {
      subjects: {
        s1: { code: "BIO100", name: "Biology", color: "#60a5fa" }
      },
      assessments: {
        a1: { title: "Essay", subjectId: "s1", dueDate: "2026-06-01", type: "assignment", weight: 40, mark: 75 }
      }
    },
    userB: {
      subjects: {
        s2: { code: "CHEM100", name: "Chemistry", color: "#34d399" }
      },
      assessments: {}
    }
  });

  const store = await loadBrowserModule(storePath, mocks, [
    "loadData",
    "clearData",
    "getSubjects",
    "getSubjectById",
    "getAssessments",
    "getAssessmentById",
    "addSubject",
    "updateSubject",
    "addAssessment",
    "updateAssessment",
    "deleteAssessment"
  ]);

  await store.loadData("userA");
  assert.deepEqual(store.getSubjects().map(subject => subject.code), ["BIO100"]);
  assert.equal(store.getSubjectById("s1").name, "Biology");
  assert.equal(store.getAssessments()[0].title, "Essay");

  await store.addSubject({ code: "NUR1001", name: "Nursing", color: "#fbbf24" });
  assert.equal(store.getSubjects().length, 2);
  assert.equal(Object.keys(mocks.data.userB.subjects).length, 1);

  await store.updateSubject("s1", { code: "BIO101", name: "Biology Updated" });
  assert.equal(store.getSubjectById("s1").code, "BIO101");
  assert.equal(mocks.data.userA.subjects.s1.name, "Biology Updated");

  await store.addAssessment({ title: "Exam", subjectId: "s1", dueDate: "2026-06-10", type: "exam", weight: 60, mark: 0 });
  const addedAssessment = store.getAssessments().find(item => item.title === "Exam");
  assert.ok(addedAssessment.id);

  await store.updateAssessment(addedAssessment.id, { mark: 88 });
  assert.equal(store.getAssessmentById(addedAssessment.id).mark, 88);

  await store.deleteAssessment(addedAssessment.id);
  assert.equal(store.getAssessmentById(addedAssessment.id), undefined);

  store.clearData();
  assert.deepEqual(plain(store.getSubjects()), []);
  assert.deepEqual(plain(store.getAssessments()), []);
});
