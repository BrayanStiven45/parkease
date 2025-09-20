import * as admin from 'firebase-admin';

// This will use the GOOGLE_APPLICATION_CREDENTIALS environment variable
// for authentication. Make sure this is set up in your deployment environment.
// For local development, you can point this to your service account key file.

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

let adminApp: admin.app.App;

if (admin.apps.length === 0) {
  adminApp = admin.initializeApp({
    projectId,
  });
} else {
  adminApp = admin.app();
}

export { adminApp };
