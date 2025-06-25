#!/usr/bin/env node

import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
config({ path: path.join(__dirname, '.env.local') });

console.log('🔑 Testing Firebase Storage Rules and Authentication...\n');
console.log('Environment Variables:');
console.log('API_KEY:', process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'MISSING');
console.log('PROJECT_ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'MISSING');
console.log('STORAGE_BUCKET:', process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'MISSING');
console.log();

// Test with direct HTTP requests (anonymous - should fail)
console.log('1️⃣ Testing anonymous access (should fail)...');
const testFiles = ['data/a7b9c2d1.json', 'data/c9d4e7f1.json', 'data/e5f8a3b2.json'];

for (const fileName of testFiles) {
  try {
    // Try direct download URL (will fail with current rules)
    const storageUrl = `https://firebasestorage.googleapis.com/v0/b/cnn-analyzer.firebasestorage.app/o/${encodeURIComponent(fileName)}?alt=media`;
    console.log(`\n🔄 Testing ${fileName}...`);
    
    const response = await fetch(storageUrl);
    console.log(`📡 HTTP Status: ${response.status}`);
    
    if (response.status === 403) {
      console.log('✅ Access correctly denied (authentication required)');
    } else if (response.status === 200) {
      console.log('⚠️  File is publicly accessible (may not be intended)');
    } else {
      console.log(`❓ Unexpected status: ${response.statusText}`);
    }
  } catch (error) {
    console.error(`❌ Error testing ${fileName}:`, error.message);
  }
}

// Test with Firebase Client SDK (authenticated)
console.log('\n\n2️⃣ Testing authenticated access with Firebase Client SDK...');
try {
  const { initializeApp } = await import('firebase/app');
  const { getAuth, signInAnonymously } = await import('firebase/auth');
  const { getStorage, ref, getDownloadURL } = await import('firebase/storage');

  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
  };

  const app = initializeApp(firebaseConfig, 'auth-test');
  const auth = getAuth(app);
  const storage = getStorage(app);
  
  console.log('🔐 Signing in anonymously...');
  const userCredential = await signInAnonymously(auth);
  console.log('✅ Authenticated user:', userCredential.user.uid);
  
  for (const fileName of testFiles) {
    try {
      console.log(`\n🔄 Testing authenticated access to ${fileName}...`);
      const fileRef = ref(storage, fileName);
      const downloadURL = await getDownloadURL(fileRef);
      console.log('✅ Download URL obtained successfully');
      
      // Try to fetch the file
      const response = await fetch(downloadURL);
      if (response.ok) {
        const text = await response.text();
        console.log(`✅ File downloaded successfully - ${(text.length / 1024 / 1024).toFixed(2)} MB`);
        console.log(`📖 Preview: ${text.substring(0, 50)}...`);
      } else {
        console.error(`❌ Download failed: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error(`❌ Error accessing ${fileName}:`, error.message);
    }
  }
  
} catch (error) {
  console.error('❌ Firebase Client SDK test failed:', error.message);
}

console.log('\n🏁 Authentication test completed!');
