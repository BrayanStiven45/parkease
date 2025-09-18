// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, connectAuthEmulator }  from "firebase/auth";
import { createUserWithEmailAndPassword } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

// Create mock users in development
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  try {
    connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
    
    const createMockUser = async (email: string) => {
      try {
        await createUserWithEmailAndPassword(auth, email, "password");
        console.log(`Mock user ${email} created.`);
      } catch (error: any) {
        if (error.code !== 'auth/email-already-in-use') {
          console.error(`Error creating mock user ${email}:`, error);
        }
      }
    };
    
    createMockUser('admin@parkease.com');
    createMockUser('user@parkease.com');
  } catch(e) {
    console.error('Failed to connect to auth emulator', e);
  }
}

export { app, auth };
