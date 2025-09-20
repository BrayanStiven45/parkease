
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
    // In this specific environment, default credentials are not working,
    // so we avoid calling initializeApp() without credentials to prevent a crash.
    // The app will rely on the existing admin app instance if available.
    if (admin.apps.length > 0) {
      adminApp = admin.app()!;
    } else {
      console.warn("Firebase Admin SDK not initialized. GOOGLE_APPLICATION_CREDENTIALS environment variable is not set.");
      // Assign a temporary object to avoid crashes on import, though admin features will fail.
      adminApp = {} as admin.app.App;
    }
  }
} else {
  adminApp = admin.app()!;
}

export { adminApp };
