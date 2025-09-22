
'use server';
/**
 * @fileOverview A flow for securely deleting a user from Firebase Authentication and Firestore.
 *
 * - deleteUser - A function that handles the user deletion process.
 * - DeleteUserInput - The input type for the deleteUser function.
 * - DeleteUserOutput - The return type for the deleteUser function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Validate environment variables
const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } = process.env;

if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY) {
  throw new Error(
    'Missing required Firebase Admin SDK credentials in environment variables.'
  );
}

// Initialize Firebase Admin SDK only once
if (!getApps().length) {
  try {
    initializeApp({
      credential: cert({
        projectId: FIREBASE_PROJECT_ID,
        clientEmail: FIREBASE_CLIENT_EMAIL,
        // Replace escaped newlines from environment variable
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  } catch (error: any) {
    console.error('Firebase Admin Initialization Error:', error);
    // Throw a more specific error to help with debugging
    throw new Error(`Failed to initialize Firebase Admin: ${error.message}`);
  }
}


const db = getFirestore();
const auth = getAuth();

const DeleteUserInputSchema = z.object({
  uid: z.string().describe('The UID of the user to delete.'),
});
export type DeleteUserInput = z.infer<typeof DeleteUserInputSchema>;

const DeleteUserOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});
export type DeleteUserOutput = z.infer<typeof DeleteUserOutputSchema>;

export async function deleteUser(input: DeleteUserInput): Promise<DeleteUserOutput> {
  return deleteUserFlow(input);
}

const deleteUserFlow = ai.defineFlow(
  {
    name: 'deleteUserFlow',
    inputSchema: DeleteUserInputSchema,
    outputSchema: DeleteUserOutputSchema,
  },
  async (input) => {
    const { uid } = input;

    try {
      // 1. Delete user from Firebase Authentication
      await auth.deleteUser(uid);

      // 2. Delete user data from Firestore
      const userDocRef = db.collection('users').doc(uid);
      await userDocRef.delete();
      
      return {
        success: true,
        message: `Successfully deleted user ${uid} from Authentication and Firestore.`,
      };
    } catch (error: any) {
      console.error(`Failed to delete user ${uid}:`, error);
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  }
);
