const { initializeApp } = require("firebase/app");
const { getFirestore, doc, deleteDoc } = require("firebase/firestore");

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAWXS24CE_gNcbfzJV8ccuURhQy0ydKvrQ",
  authDomain: "scheduledb2.firebaseapp.com",
  databaseURL: "https://scheduledb2-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "scheduledb2",
  storageBucket: "scheduledb2.firebasestorage.app",
  messagingSenderId: "660758443044",
  appId: "1:660758443044:web:274384050b7af96570d4b1",
  measurementId: "G-NXB608LZD7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Test delete function
async function testDeleteShift(shiftId) {
  try {
    const docRef = doc(db, "shifts", shiftId);
    console.log(`Attempting to delete shift with ID: ${shiftId} at path: ${docRef.path}`);
    await deleteDoc(docRef);
    console.log(`Shift with ID: ${shiftId} deleted successfully.`);
  } catch (error) {
    console.error(`Error deleting shift with ID: ${shiftId}`, error);
  }
}

// Replace with a valid shift ID from your Firestore database
testDeleteShift("REPLACE_WITH_SHIFT_ID");