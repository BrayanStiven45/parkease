// // Import the functions you need from the SDKs you need
// import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
// import { getAuth, type Auth } from "firebase/auth";

// let app: FirebaseApp;
// let auth: Auth;

// const firebaseConfig = {
//   apiKey: "AIzaSyDdfEjzf02sTM_A8kBm2wqoS57GBiM8kOk",
//   authDomain: "parkease-20584.firebaseapp.com",
//   projectId: "parkease-20584",
//   storageBucket: "parkease-20584.appspot.com",  
//   messagingSenderId: "504816111613",
//   appId: "1:504816111613:web:3b2ace97dbae8cbfe29394",
//   measurementId: "G-34ZYBD2GPR"
// };

// if (!getApps().length) {
//     app = initializeApp(firebaseConfig);
// } else {
//     app = getApp();
// }

// auth = getAuth(app);

// export { app, auth };

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";

// Config desde variables de entorno
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Evitar inicializar más de una vez
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Inicializar servicios
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Analytics solo funciona en navegador
let analytics: ReturnType<typeof getAnalytics> | undefined;
if (typeof window !== "undefined") {
  isSupported().then((yes) => {
    if (yes) {
      analytics = getAnalytics(app);
    }
  });
}

export { app, auth, db, storage, analytics };
