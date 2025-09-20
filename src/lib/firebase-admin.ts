
import * as admin from 'firebase-admin';

// This will use the GOOGLE_APPLICATION_CREDENTIALS environment variable
// for authentication. Make sure this is set up in your deployment environment.
// For local development, you can point this to your service account key file.

let adminApp: admin.app.App;

if (admin.apps.length === 0) {
  const serviceAccount = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  
  if (serviceAccount) {
    adminApp = admin.initializeApp({
      credential: admin.credential.cert(JSON.parse(serviceAccount)),
    });
  } else {
    // Fallback for environments where default credentials might be available
    adminApp = admin.initializeApp();
  }
} else {
  adminApp = admin.app();
}

export { adminApp };
