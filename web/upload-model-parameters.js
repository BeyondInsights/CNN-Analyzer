// Upload modelParameters.json to Firebase Storage
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'cnn-analyzer',
    storageBucket: 'cnn-analyzer.appspot.com'
  });
}

async function uploadModelParameters() {
  try {
    console.log('📤 Uploading modelParameters.json to Firebase Storage...');
    
    const bucket = admin.storage().bucket();
    const localFilePath = path.join(__dirname, 'src', 'data', 'modelParameters.json');
    const remoteFilePath = 'data/modelParameters.json';
    
    // Check if file exists locally
    if (!fs.existsSync(localFilePath)) {
      throw new Error(`Local file not found: ${localFilePath}`);
    }
    
    // Upload the file
    await bucket.upload(localFilePath, {
      destination: remoteFilePath,
      metadata: {
        contentType: 'application/json',
      }
    });
    
    console.log('✅ Successfully uploaded modelParameters.json to Firebase Storage');
    console.log(`📁 Location: ${remoteFilePath}`);
    
  } catch (error) {
    console.error('❌ Upload failed:', error.message);
    process.exit(1);
  }
}

uploadModelParameters();
