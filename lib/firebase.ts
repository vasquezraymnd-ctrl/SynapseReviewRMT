
import admin from 'firebase-admin';

// Check if the app is already initialized to prevent errors
if (!admin.apps.length) {
  const serviceAccount: admin.ServiceAccount = {
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    // Use environment variable for private key, ensuring it's correctly formatted
    privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
  };

  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('Firebase Admin SDK initialized.');
  } catch (error) {
    console.error('Firebase Admin SDK initialization error:', error);
  }
}

// Export the firestore database instance
const db = admin.firestore();

export { db };
