// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, connectAuthEmulator } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

// --- Create Mock Users for Demo ---
let mockUsersCreated = false;

const createMockUsers = async () => {
    if (mockUsersCreated) return;
    mockUsersCreated = true;

    const users = [
      { email: 'admin@parkease.com' },
      { email: 'user@parkease.com' },
    ];

    for (const user of users) {
        try {
            await createUserWithEmailAndPassword(auth, user.email, "password");
            console.log(`Mock user ${user.email} created successfully.`);
        } catch (error: any) {
            // If user already exists, we can ignore the error
            if (error.code === 'auth/email-already-in-use') {
                console.log(`Mock user ${user.email} already exists.`);
            } else {
                // For other errors, log them to diagnose issues
                console.error(`Error creating mock user ${user.email}:`, error);
            }
        }
    }
};

// Create mock users when the app loads (only in development)
if (process.env.NODE_ENV === 'development') {
    createMockUsers();
}
// --- End of Mock Users ---


export { app, auth };