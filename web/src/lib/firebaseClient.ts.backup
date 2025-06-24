import { initializeApp, getApps } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getFunctions, httpsCallable, connectFunctionsEmulator } from "firebase/functions";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getStorage, connectStorageEmulator } from "firebase/storage";

const clientConfig = {
  apiKey: "AIzaSyDqeHyh0P6s24gJlUQpm6GunHWs0voLEcs",
  authDomain: "cnn-analyzer.firebaseapp.com",
  projectId: "cnn-analyzer",
  storageBucket: "cnn-analyzer.firebasestorage.app",
  messagingSenderId: "245840502284",
  appId: "1:245840502284:web:b63524d5bf589370ab1829"
};

const app = !getApps().length ? initializeApp(clientConfig) : getApps()[0];

export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const functions = getFunctions(app);
export const storage = getStorage(app);


if (process.env.NODE_ENV === 'development') {
  try {
    connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
    connectFirestoreEmulator(firestore, 'localhost', 8080);
    connectFunctionsEmulator(functions, 'localhost', 5001);
    // connectStorageEmulator(storage, 'localhost', 9199);  // COMMENT THIS OU
  } catch (e) {
    // Already connected
  }
}

export const runSimulation = httpsCallable(functions, "runSimulation");
export const generateReport = httpsCallable(functions, "generateReport");

export function isUserAuthenticated(): boolean {
  return auth.currentUser !== null;
}
