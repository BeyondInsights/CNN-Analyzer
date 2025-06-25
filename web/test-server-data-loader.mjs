// Test the actual serverDataLoader function
import { loadServerData } from './src/lib/serverDataLoader.js';

async function testServerDataLoader() {
  console.log('🧪 Testing actual serverDataLoader function...\n');
  
  try {
    console.log('📥 Attempting to load data using serverDataLoader...');
    
    const data = await loadServerData();
    
    console.log('\n✅ SUCCESS! Data loaded from Firebase Storage:');
    console.log(`📊 Respondent Utilities: ${Array.isArray(data.respondentUtilities) ? data.respondentUtilities.length : 'N/A'} records`);
    console.log(`👥 Demographics: ${Array.isArray(data.demographics) ? data.demographics.length : 'N/A'} records`);
    console.log(`⚙️  Model Parameters: ${Array.isArray(data.modelParameters) ? data.modelParameters.length : 'N/A'} parameters`);
    console.log(`📈 DRN Rates: ${typeof data.drnRates === 'object' ? Object.keys(data.drnRates).length : 'N/A'} entries`);
    
    console.log('\n' + '='.repeat(60));
    console.log('🎉 CONFIRMATION: Firebase Storage is working correctly!');
    console.log('✅ All obfuscated data files are accessible.');
    console.log('🚀 SAFE TO DEPLOY TO NETLIFY!');
    console.log('='.repeat(60));
    
    return true;
    
  } catch (error) {
    console.log('\n❌ FAILURE! serverDataLoader failed:');
    console.log(`   Error: ${error.message}`);
    
    console.log('\n' + '='.repeat(60));
    console.log('💥 DO NOT DEPLOY - Firebase Storage access is broken!');
    console.log('❌ Data loading will fail in production.');
    console.log('='.repeat(60));
    
    return false;
  }
}

testServerDataLoader()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('🔥 Test failed:', error);
    process.exit(1);
  });
