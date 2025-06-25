#!/usr/bin/env node

/**
 * Upload obfuscated data files to Firebase Storage
 * Run with: node upload-obfuscated-files.js
 */

const { initializeApp } = require('firebase-admin/app');
const { getStorage } = require('firebase-admin/storage');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin
const projectId = 'cnn-analyzer'; // Replace with your actual project ID
const app = initializeApp({
  projectId: projectId,
  storageBucket: `${projectId}.appspot.com`
});

const storage = getStorage(app);
const bucket = storage.bucket();

// File mappings: local filename -> Firebase Storage path
const filesToUpload = [
  {
    local: 'src/data/a7b9c2d1.json',
    remote: 'data/a7b9c2d1.json',
    description: 'Respondent Utilities (obfuscated)'
  },
  {
    local: 'src/data/c9d4e7f1.json', 
    remote: 'data/c9d4e7f1.json',
    description: 'Respondent Profile (obfuscated)'
  },
  {
    local: 'src/data/e5f8a3b2.json',
    remote: 'data/e5f8a3b2.json', 
    description: 'Respondent Data (obfuscated)'
  },
  {
    local: 'src/data/modelParameters.json',
    remote: 'data/modelParameters.json',
    description: 'Model Parameters'
  },
  {
    local: 'src/data/drnRates.json',
    remote: 'data/drnRates.json',
    description: 'DRN Rates'
  }
];

async function uploadFile(localPath, remotePath, description) {
  try {
    const fullLocalPath = path.join(__dirname, localPath);
    
    // Check if file exists
    if (!fs.existsSync(fullLocalPath)) {
      console.error(`❌ Local file not found: ${fullLocalPath}`);
      return false;
    }

    // Get file stats
    const stats = fs.statSync(fullLocalPath);
    const fileSizeKB = (stats.size / 1024).toFixed(1);
    
    console.log(`📁 Uploading ${description}...`);
    console.log(`   Local: ${localPath} (${fileSizeKB} KB)`);
    console.log(`   Remote: ${remotePath}`);
    
    // Upload to Firebase Storage
    const file = bucket.file(remotePath);
    await file.save(fs.readFileSync(fullLocalPath), {
      metadata: {
        contentType: 'application/json',
        metadata: {
          description: description,
          uploadedAt: new Date().toISOString(),
          originalName: path.basename(localPath)
        }
      }
    });
    
    console.log(`✅ Successfully uploaded ${description}`);
    return true;
    
  } catch (error) {
    console.error(`❌ Failed to upload ${description}:`, error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting upload of obfuscated data files to Firebase Storage...\n');
  
  let successCount = 0;
  let totalFiles = filesToUpload.length;
  
  for (const fileInfo of filesToUpload) {
    const success = await uploadFile(fileInfo.local, fileInfo.remote, fileInfo.description);
    if (success) successCount++;
    console.log(''); // Empty line between uploads
  }
  
  console.log('📊 Upload Summary:');
  console.log(`   Successful: ${successCount}/${totalFiles}`);
  console.log(`   Failed: ${totalFiles - successCount}/${totalFiles}`);
  
  if (successCount === totalFiles) {
    console.log('\n🎉 All files uploaded successfully!');
    console.log('The application should now load data from Firebase Storage without fallback errors.');
  } else {
    console.log('\n⚠️  Some uploads failed. Check the errors above.');
    console.log('The application will continue to work with local fallback files.');
  }
  
  process.exit(successCount === totalFiles ? 0 : 1);
}

// Run the upload
main().catch(console.error);
