// Import the functions you need from the SDKs you need
import { Analytics, getAnalytics, isSupported } from "firebase/analytics";
import { FirebaseApp, initializeApp } from "firebase/app";
import { Firestore, getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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

// Initialize Firebase with error handling
let app: FirebaseApp | undefined;
let db: Firestore | undefined;
let analytics: Analytics | undefined;

try {
  console.log("Initializing Firebase...");
  app = initializeApp(firebaseConfig);
  
  try {
    console.log("Initializing Firestore...");
    db = getFirestore(app);
  } catch (dbError) {
    console.error("Error initializing Firestore:", dbError);
  }
  
  // Skip auth initialization for now since we're not using auth features
  // This avoids the React Native AsyncStorage issues
  
  // Only initialize analytics if it's supported in the environment
  try {
    isSupported().then(supported => {
      if (supported && app) {
        analytics = getAnalytics(app);
      } else {
        console.log("Analytics is not supported in this environment");
      }
    });
  } catch (analyticsError) {
    console.error("Error with analytics:", analyticsError);
  }
  
  console.log("Firebase initialized successfully");
} catch (error) {
  console.error("Error initializing Firebase:", error);
}

// Export a dummy auth object to avoid breaking code that expects it
const dummyAuth = {
  currentUser: null
};

export { analytics, app, dummyAuth as auth, db };

