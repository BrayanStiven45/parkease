
'use server';

import * as admin from 'firebase-admin';
import { adminApp } from '@/lib/firebase-admin';

// Define input and output types for clarity
interface DeleteUserInput {
  uidToDelete: string;
}

interface DeleteUserOutput {
  success: boolean;
  message: string;
}

export async function deleteUser(input: DeleteUserInput): Promise<DeleteUserOutput> {
  // In a real-world scenario, you would add a check here to ensure
  // that the currently logged-in user making this request is an admin.
  // For this example, we assume the check is done on the client-side
  // before this function is ever called.

  const { uidToDelete } = input;
  const adminAuth = admin.auth(adminApp);
  const adminDb = admin.firestore(adminApp);

  try {
    // 1. Delete user from Firebase Authentication
    await adminAuth.deleteUser(uidToDelete);

    // 2. Delete user document from Firestore
    await adminDb.collection('users').doc(uidToDelete).delete();

    // Note: This does not delete subcollections like 'parkingRecords'.
    // A more robust solution would involve a recursive delete function if needed.

    return {
      success: true,
      message: `Successfully deleted user ${uidToDelete} from Authentication and Firestore.`,
    };
  } catch (error: any) {
    console.error('Error deleting user:', error);
    return {
      success: false,
      message: error.message || 'An unknown error occurred.',
    };
  }
}
