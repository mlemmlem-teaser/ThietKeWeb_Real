
// Firebase Configuration for Car Management System
// This file initializes Firebase services for authentication and database

// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-analytics.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js"; 
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-database.js";

// Firebase configuration object
const firebaseConfig = {
  apiKey: "AIzaSyA0xIFf7ZCzjdQVEcz4vZQ0-lYaEAsxC7k",
  authDomain: "car-management-477e4.firebaseapp.com",
  projectId: "car-management-477e4",
  storageBucket: "car-management-477e4.firebasestorage.app",
  messagingSenderId: "962890154660",
  appId: "1:962890154660:web:609d58bac8bf4298a3dc31",
  measurementId: "G-04EGN0557L"
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const analytics = getAnalytics(app);
const auth = getAuth(app);
const dbFireStore = getFirestore(app);
const dbRealTime = getDatabase(app);

// Configure Auth for local development
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.warn('Running on localhost - make sure to add your domain to Firebase Auth settings');
    console.info('Add these domains to Firebase Console -> Authentication -> Settings -> Authorized domains:');
    console.info('- localhost');
    console.info('- 127.0.0.1');
    console.info('- http://localhost:3000 (if using a dev server)');
    console.info('- http://127.0.0.1:3000 (if using a dev server)');
}

// Export Firebase services for use in other files
export { app, analytics, auth, dbFireStore, dbRealTime };
