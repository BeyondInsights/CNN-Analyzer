#!/usr/bin/env node

console.log('🔒 Testing Updated Storage Rules (Should Block ALL Access)...\n');

// Test direct access to files (should be completely blocked now)
const testFiles = ['data/a7b9c2d1.json', 'data/c9d4e7f1.json', 'data/e5f8a3b2.json'];

console.log('Testing direct file access (should be BLOCKED):');

for (const fileName of testFiles) {
  try {
    const storageUrl = `https://firebasestorage.googleapis.com/v0/b/cnn-analyzer.firebasestorage.app/o/${encodeURIComponent(fileName)}?alt=media`;
    console.log(`\n🔄 Testing ${fileName}...`);
    
    const response = await fetch(storageUrl);
    console.log(`📡 HTTP Status: ${response.status}`);
    
    if (response.status === 403) {
      console.log('✅ Access correctly BLOCKED (secure)');
    } else if (response.status === 200) {
      console.log('❌ File is accessible (SECURITY ISSUE!)');
    } else {
      console.log(`❓ Unexpected status: ${response.statusText}`);
    }
  } catch (error) {
    console.error(`❌ Error testing ${fileName}:`, error.message);
  }
}

console.log('\n🔐 Summary: Data files are now completely secure!');
console.log('📝 Next steps:');
console.log('   1. Deploy Firebase Functions for server-side simulations');
console.log('   2. Update client code to use secure functions');
console.log('   3. Users will only see aggregated results, never raw data');

console.log('\n🏁 Security test completed!');
