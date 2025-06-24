// web/src/lib/firebaseAdmin.ts - SECURE VERSION
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

if (typeof window !== 'undefined') {
  throw new Error('Firebase Admin SDK cannot be used in the browser');
}

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID!,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
      privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
    })
  });
}

export const adminAuth = getAuth();
export const adminDb = getFirestore();