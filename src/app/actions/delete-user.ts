
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
  const { uidToDelete } = input;

  // Ensure the admin app is initialized before using its services
  if (!admin.apps.length) {
    console.error('Firebase Admin SDK not initialized.');
    return {
      success: false,
      message: 'Firebase Admin SDK not initialized.',
    };
  }
  
  const adminAuth = admin.auth();
  const adminDb = admin.firestore();

  try {
    // 1. Eliminar usuario en Authentication
    await adminAuth.deleteUser(uidToDelete);

    // 2. Eliminar usuario en Firestore
    await adminDb.collection('users').doc(uidToDelete).delete();

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
