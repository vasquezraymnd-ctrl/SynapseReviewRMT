
import admin from 'firebase-admin';

let db: admin.firestore.Firestore;
let storage: admin.storage.Storage;

function initializeFirebaseAdmin() {
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
        storageBucket: `${serviceAccount.projectId}.appspot.com`,
      });
      console.log('Firebase Admin SDK initialized.');
    } catch (error: any) {
      if (error.code !== 'app/duplicate-app') {
        console.error('Firebase Admin SDK initialization error:', error);
        throw error;
      }
    }
  }
  
  if (!db) {
    db = admin.firestore();
  }
  if (!storage) {
    storage = admin.storage();
  }
}

function getDb() {
  if (!db) {
    initializeFirebaseAdmin();
  }
  return db;
}

function getStorage() {
  if (!storage) {
    initializeFirebaseAdmin();
  }
  return storage;
}

export { getDb, getStorage };
