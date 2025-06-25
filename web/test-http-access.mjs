#!/usr/bin/env node

import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
config({ path: path.join(__dirname, '.env.local') });

console.log('🌐 Testing Firebase Storage HTTP access...\n');

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const STORAGE_BASE_URL = `https://firebasestorage.googleapis.com/v0/b/${projectId}.firebasestorage.app/o`;

const testFiles = [
  'data%2Fa7b9c2d1.json',
  'data%2Fc9d4e7f1.json', 
  'data%2Fe5f8a3b2.json',
  'data%2FmodelParameters.json',
  'data%2FdrnRates.json'
];

for (const encodedFile of testFiles) {
  try {
    const url = `${STORAGE_BASE_URL}/${encodedFile}?alt=media`;
    console.log(`🔄 Testing: ${encodedFile.replace(/%2F/g, '/')}`);
    console.log(`📡 URL: ${url}`);
    
    const response = await fetch(url);
    console.log(`📊 Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const text = await response.text();
      console.log(`✅ Success! Size: ${(text.length / 1024 / 1024).toFixed(2)} MB`);
      console.log(`📖 Preview: ${text.substring(0, 100)}...`);
    } else {
      console.log(`❌ Failed to access file`);
    }
    
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
  }
  
  console.log(''); // Empty line for separation
}

console.log('🏁 Test completed!');
