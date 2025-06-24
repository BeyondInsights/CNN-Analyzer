// scripts/uploadDataToStorage.js
// Run this script to upload your data files to Firebase Storage
// Usage: node scripts/uploadDataToStorage.js

const admin = require('firebase-admin');
const fs = require('fs').promises;
const path = require('path');

// Initialize Firebase Admin
// You'll need to download your service account key from Firebase Console
const serviceAccount = require('../service-account-key.json');



admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'cnn-analyzer.firebasestorage.app' // Replace with your bucket
});

const bucket = admin.storage().bucket();

async function uploadDataFiles() {
  console.log('🚀 Starting data file upload to Firebase Storage...\n');

  const dataFiles = [
    'readerFeatureDescriptions.json',
    'streamingFeatureDescriptions.json',
    'verticalDescriptions.json',
    'pricingRanges.json',
    'coreProductDescriptions.json',
    'segmentDescriptions.json'
  ];

  for (const fileName of dataFiles) {
    try {
      // Read the file from your local data directory
      const filePath = path.join(__dirname, '../web/src/data', fileName);
      const fileContent = await fs.readFile(filePath, 'utf8');
      
      // Validate JSON
      JSON.parse(fileContent);
      
      // Upload to Firebase Storage
      const destination = `data/${fileName}`;
      const file = bucket.file(destination);
      
      await file.save(fileContent, {
        metadata: {
          contentType: 'application/json',
          cacheControl: 'public, max-age=3600', // Cache for 1 hour
        }
      });
      
      // Make the file publicly readable (optional - remove if using auth)
      // await file.makePublic();
      
      console.log(`✅ Uploaded: ${fileName} → ${destination}`);
    } catch (error) {
      console.error(`❌ Failed to upload ${fileName}:`, error.message);
    }
  }
  
  console.log('\n✨ Data upload complete!');
  console.log('\n📝 Next steps:');
  console.log('1. Update your Firebase Storage rules for authentication');
  console.log('2. Test the app to ensure data loads correctly');
}

// Run the upload
uploadDataFiles().catch(console.error);

/* 
SETUP INSTRUCTIONS:
1. Install Firebase Admin: npm install firebase-admin
2. Download service account key:
   - Firebase Console → Project Settings → Service Accounts
   - Generate New Private Key → Save as service-account-key.json
3. Update the storageBucket in the script
4. Run: node scripts/uploadDataToStorage.js
*/