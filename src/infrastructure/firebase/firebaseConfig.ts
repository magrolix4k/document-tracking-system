'use client';

import { initializeApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyCxIwZX7UUmXligxQ4z0g8TGCcvJUZU4pU',
  authDomain: 'waitingtime-15bd1.firebaseapp.com',
  projectId: 'waitingtime-15bd1',
  storageBucket: 'waitingtime-15bd1.firebasestorage.app',
  messagingSenderId: '219534942607',
  appId: '1:219534942607:web:3fbece1a9f6880a3d4ebfa',
  measurementId: 'G-ZYX157G5WB',
};

let app: FirebaseApp | null = null;
let db: Firestore | null = null;

// Initialize Firebase on demand
function getFirebaseApp(): FirebaseApp {
  if (!app) {
    app = initializeApp(firebaseConfig);
  }
  return app;
}

function getFirebaseDb(): Firestore {
  if (!db) {
    const app = getFirebaseApp();
    db = getFirestore(app);
  }
  return db;
}

export { getFirebaseApp, getFirebaseDb };
