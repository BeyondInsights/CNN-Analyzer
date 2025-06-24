import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

if (!getApps().length) {
  initializeApp({
    projectId: projectId,
  });
}

export const adminDb = getFirestore();
