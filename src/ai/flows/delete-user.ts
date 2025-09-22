
'use server';
/**
 * @fileOverview Securely deletes a user from Firebase Authentication and Firestore.
 */

import { z } from 'zod';
import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// =======================
// 🔹 Validate Environment Variables
// =======================
const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } = process.env;

if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY) {
  throw new Error('❌ Missing Firebase Admin SDK credentials in environment variables.');
}

// =======================
// 🔹 Initialize Firebase Admin
// =======================
if (!getApps().length) {
  try {
    initializeApp({
      credential: cert({
        projectId: FIREBASE_PROJECT_ID,
        clientEmail: FIREBASE_CLIENT_EMAIL,
        privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    });
  } catch (error: any) {
    console.error('❌ Firebase Admin Initialization Error:', error);
    throw new Error(`Failed to initialize Firebase Admin: ${error.message}`);
  }
}

const db = getFirestore();
const auth = getAuth();

// =======================
// 🔹 Zod Schemas
// =======================
const DeleteUserInputSchema = z.object({
  uid: z.string().describe('The UID of the user to delete.'),
});
export type DeleteUserInput = z.infer<typeof DeleteUserInputSchema>;

const DeleteUserOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});
export type DeleteUserOutput = z.infer<typeof DeleteUserOutputSchema>;

// =======================
// 🔹 Server Action
// =======================
export async function deleteUser(input: DeleteUserInput): Promise<DeleteUserOutput> {
  const { uid } = DeleteUserInputSchema.parse(input);

  try {
    // 1️⃣ Delete from Firebase Auth
    await auth.deleteUser(uid);

    // 2️⃣ Delete from Firestore
    await db.collection('users').doc(uid).delete();

    return {
      success: true,
      message: `✅ Successfully deleted user ${uid} from Authentication and Firestore.`,
    };
  } catch (error: any) {
    console.error(`❌ Failed to delete user ${uid}:`, error);
    throw new Error(`Failed to delete user: ${error.message}`);
  }
}
