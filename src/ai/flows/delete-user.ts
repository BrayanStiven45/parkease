
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
import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();
const auth = admin.auth();

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

      // Note: This does not delete subcollections like parkingRecords. 
      // For a full cleanup, a more complex recursive delete function would be needed,
      // but for this app's purpose, deleting the user document is sufficient.

      return {
        success: true,
        message: `Successfully deleted user ${uid} from Authentication and Firestore.`,
      };
    } catch (error: any) {
      console.error(`Failed to delete user ${uid}:`, error);
      // Throw an error to be caught by the client-side caller
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  }
);
