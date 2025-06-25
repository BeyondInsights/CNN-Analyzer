import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

if (!getApps().length) {
  // For development/testing without service account, use minimal config
  // In production on Netlify, this should use proper service account credentials
  initializeApp({
    projectId: projectId,
    storageBucket: storageBucket,
    // Use default credentials or service account if available
    credential: process.env.FIREBASE_SERVICE_ACCOUNT_KEY 
      ? cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY))
      : undefined
  });
}

export const adminDb = getFirestore();
export const adminStorage = getStorage();
