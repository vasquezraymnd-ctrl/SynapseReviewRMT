
import admin from 'firebase-admin';

let db: admin.firestore.Firestore;

function getDb() {
  if (!admin.apps.length) {
    const serviceAccount: admin.ServiceAccount = {
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    };

    if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
      throw new Error('Firebase Admin SDK credentials are not set in environment variables. Please check your .env.local file.');
    }

    try {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log('Firebase Admin SDK initialized.');
    } catch (error: any) {
      // A "duplicate-app" error can occur if the app is initialized multiple times,
      // which can happen in development environments with hot-reloading.
      // We can safely ignore this error, but all others should be thrown.
      if (error.code !== 'app/duplicate-app') {
         console.error('Firebase Admin SDK initialization error:', error);
         throw error;
      }
    }
  }
  
  if (!db) {
    db = admin.firestore();
  }

  return db;
}

export { getDb };
