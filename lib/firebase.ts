
import admin from 'firebase-admin';

let db: admin.firestore.Firestore;
let storage: admin.storage.Storage;
let initializationError: string | null = null;

if (!admin.apps.length) {
    const requiredEnvVars = [
        'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
        'FIREBASE_CLIENT_EMAIL',
        'FIREBASE_PRIVATE_KEY'
    ];

    const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

    if (missingEnvVars.length > 0) {
        initializationError = `Firebase Admin SDK credentials are not set. The following are missing: ${missingEnvVars.join(', ')}. Please check your hosting provider's environment variable settings.`
    } else {
        try {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
                }),
                storageBucket: `${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.appspot.com`
            });

            db = admin.firestore();
            storage = admin.storage();

        } catch (error: any) {
            initializationError = `Failed to initialize Firebase Admin SDK: ${error.message}`;
        }
    }
} else {
    db = admin.firestore();
    storage = admin.storage();
}

export { db, storage, initializationError, admin as default };
