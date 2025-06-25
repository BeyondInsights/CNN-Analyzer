import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

if (!getApps().length) {
  initializeApp({
    projectId: projectId,
    storageBucket: `${projectId}.appspot.com`
  });
}

export const adminDb = getFirestore();
export const adminStorage = getStorage();
