#!/usr/bin/env node

import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
config({ path: path.join(__dirname, '.env.local') });

console.log('🔄 Testing complete serverDataLoader flow...\n');

async function testServerDataLoader() {
  try {
    // Test our updated serverDataLoader
    console.log('📊 Testing serverDataLoader...');
    
    // Simulate the serverDataLoader logic manually
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const STORAGE_BASE_URL = `https://firebasestorage.googleapis.com/v0/b/${projectId}.firebasestorage.app/o`;

    const files = [
      { name: 'a7b9c2d1.json', encoded: 'data%2Fa7b9c2d1.json' },
      { name: 'c9d4e7f1.json', encoded: 'data%2Fc9d4e7f1.json' },
      { name: 'modelParameters.json', encoded: 'data%2FmodelParameters.json' },
      { name: 'drnRates.json', encoded: 'data%2FdrnRates.json' }
    ];

    const results = {};
    let allSuccess = true;

    for (const file of files) {
      try {
        const url = `${STORAGE_BASE_URL}/${file.encoded}?alt=media`;
        console.log(`🔄 Loading ${file.name}...`);
        
        const response = await fetch(url);
        
        if (response.ok) {
          const text = await response.text();
          const data = JSON.parse(text);
          results[file.name] = {
            success: true,
            size: text.length,
            records: Array.isArray(data) ? data.length : 'object'
          };
          console.log(`✅ ${file.name}: ${(text.length / 1024 / 1024).toFixed(2)} MB`);
        } else {
          results[file.name] = {
            success: false,
            error: `HTTP ${response.status}: ${response.statusText}`
          };
          console.log(`❌ ${file.name}: ${response.status} ${response.statusText}`);
          allSuccess = false;
        }
      } catch (error) {
        results[file.name] = {
          success: false,
          error: error.message
        };
        console.log(`❌ ${file.name}: ${error.message}`);
        allSuccess = false;
      }
    }

    console.log('\n📊 Summary:');
    console.log('═══════════════════════════════════════');
    
    if (allSuccess) {
      console.log('🎉 SUCCESS: All files loaded successfully!');
      console.log('✅ Your app is ready for deployment to Netlify');
      console.log('\n📈 Data summary:');
      for (const [filename, result] of Object.entries(results)) {
        if (result.success) {
          console.log(`  • ${filename}: ${result.records} records (${(result.size / 1024 / 1024).toFixed(2)} MB)`);
        }
      }
    } else {
      console.log('❌ ISSUE: Some files could not be loaded');
      console.log('🔧 Action needed: Update Firebase Storage rules to allow public read access');
      console.log('\n📋 Instructions:');
      console.log('1. Go to Firebase Console > Storage > Rules');
      console.log('2. Update rules to allow public read access to data/ folder');
      console.log('3. Or run: firebase deploy --only storage');
      
      console.log('\n❌ Failed files:');
      for (const [filename, result] of Object.entries(results)) {
        if (!result.success) {
          console.log(`  • ${filename}: ${result.error}`);
        }
      }
    }
    
  } catch (error) {
    console.error('💥 Critical error:', error);
  }
}

await testServerDataLoader();
console.log('\n🏁 Test completed!');
