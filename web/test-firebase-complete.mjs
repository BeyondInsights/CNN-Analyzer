#!/usr/bin/env node

import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
config({ path: path.join(__dirname, '.env.local') });

console.log('🔍 Testing Firebase Storage Access...\n');
console.log('Environment Variables:');
console.log('PROJECT_ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
console.log('STORAGE_BUCKET:', process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET);
console.log('API_KEY:', process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 'Set' : 'Missing');
console.log();

// Test with Firebase Admin SDK (server-side)
console.log('📝 Testing Firebase Admin SDK (server-side approach)...');
try {
  const { initializeApp, getApps } = await import('firebase-admin/app');
  const { getStorage } = await import('firebase-admin/storage');

  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  
  if (!getApps().length) {
    initializeApp({
      projectId: projectId,
      storageBucket: storageBucket
    });
  }

  const adminStorage = getStorage();
  const bucket = adminStorage.bucket();
  
  console.log('✅ Admin SDK initialized successfully');
  console.log('🪣 Bucket name:', bucket.name);
  
  // Test downloading a file
  const testFiles = ['data/a7b9c2d1.json', 'data/c9d4e7f1.json', 'data/e5f8a3b2.json', 'data/modelParameters.json'];
  
  for (const fileName of testFiles) {
    try {
      console.log(`\n🔄 Testing download of ${fileName}...`);
      const file = bucket.file(fileName);
      
      // Check if file exists
      const [exists] = await file.exists();
      console.log(`📁 File ${fileName} exists:`, exists);
      
      if (exists) {
        // Try to get metadata
        const [metadata] = await file.getMetadata();
        console.log(`📊 File size: ${(metadata.size / 1024 / 1024).toFixed(2)} MB`);
        
        // Try to download just the first 100 bytes to test access
        const [buffer] = await file.download({ start: 0, end: 99 });
        console.log(`✅ Successfully read first 100 bytes of ${fileName}`);
        console.log(`📖 Preview: ${buffer.toString('utf8').substring(0, 50)}...`);
      }
    } catch (error) {
      console.error(`❌ Error accessing ${fileName}:`, error.message);
    }
  }
  
} catch (error) {
  console.error('❌ Firebase Admin SDK test failed:', error.message);
}

// Test with Firebase Client SDK (web approach)
console.log('\n\n📱 Testing Firebase Client SDK (web approach)...');
try {
  const { initializeApp } = await import('firebase/app');
  const { getStorage, ref, getDownloadURL } = await import('firebase/storage');

  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
  };

  const app = initializeApp(firebaseConfig, 'client-test');
  const storage = getStorage(app);
  
  console.log('✅ Client SDK initialized successfully');
  
  const testFiles = ['data/a7b9c2d1.json', 'data/c9d4e7f1.json', 'data/e5f8a3b2.json'];
  
  for (const fileName of testFiles) {
    try {
      console.log(`\n🔄 Getting download URL for ${fileName}...`);
      const fileRef = ref(storage, fileName);
      const downloadURL = await getDownloadURL(fileRef);
      console.log(`✅ Download URL obtained for ${fileName}`);
      console.log(`🔗 URL: ${downloadURL.substring(0, 100)}...`);
      
      // Try to fetch the file
      const response = await fetch(downloadURL);
      if (response.ok) {
        const text = await response.text();
        console.log(`📖 File size: ${(text.length / 1024 / 1024).toFixed(2)} MB`);
        console.log(`📖 Preview: ${text.substring(0, 50)}...`);
      } else {
        console.error(`❌ HTTP error ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error(`❌ Error accessing ${fileName}:`, error.message);
    }
  }
  
} catch (error) {
  console.error('❌ Firebase Client SDK test failed:', error.message);
}

console.log('\n🏁 Test completed!');
