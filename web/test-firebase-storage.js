// Test Firebase Storage access for obfuscated data files using client SDK
const { initializeApp } = require('firebase/app');
const { getStorage, ref, getDownloadURL, getMetadata } = require('firebase/storage');

// Firebase config from .env.local
const firebaseConfig = {
  apiKey: "AIzaSyBKV1YcM6C3V2eL7AQvhvUUEkLN-2pfmtg",
  authDomain: "cnn-analyzer.firebaseapp.com",
  projectId: "cnn-analyzer",
  storageBucket: "cnn-analyzer.firebasestorage.app",
  messagingSenderId: "1065565667493",
  appId: "1:1065565667493:web:a44b80ea4bb1173b1ba2c2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

async function testFirebaseStorageAccess() {
  console.log('🔥 Testing Firebase Storage access with client SDK...\n');
  
  // Files we need to access
  const requiredFiles = [
    'data/a7b9c2d1.json',  // Respondent Utilities (obfuscated)
    'data/c9d4e7f1.json',  // Respondent Profile (obfuscated)  
    'data/e5f8a3b2.json',  // Respondent Data (obfuscated)
    'data/modelParameters.json',
    'data/drnRates.json'
  ];

  let allFilesAccessible = true;

  for (const filePath of requiredFiles) {
    try {
      console.log(`📁 Checking: ${filePath}...`);
      
      const fileRef = ref(storage, filePath);
      
      // Try to get metadata and download URL
      const metadata = await getMetadata(fileRef);
      const downloadURL = await getDownloadURL(fileRef);
      
      const fileSize = parseInt(metadata.size);
      console.log(`✅ ACCESSIBLE: ${filePath} (${(fileSize / 1024 / 1024).toFixed(2)} MB)`);
      console.log(`   🔗 Download URL available: ${downloadURL.substring(0, 50)}...`);
      
    } catch (error) {
      console.log(`❌ ERROR accessing ${filePath}:`, error.code || error.message);
      allFilesAccessible = false;
    }
  }

  console.log('\n' + '='.repeat(50));
  
  if (allFilesAccessible) {
    console.log('🎉 SUCCESS: All required data files are accessible in Firebase Storage!');
    console.log('✅ The application will load data from Firebase Storage correctly.');
    console.log('🚀 Safe to deploy to Netlify!');
  } else {
    console.log('💥 FAILURE: Some required files are missing or inaccessible!');
    console.log('❌ DO NOT DEPLOY - data loading will fail!');
  }
  
  console.log('='.repeat(50));
  
  return allFilesAccessible;
}

// Run the test
testFirebaseStorageAccess()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('🔥 Firebase Storage test failed:', error);
    process.exit(1);
  });
