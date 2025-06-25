#!/usr/bin/env node

import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
config({ path: path.join(__dirname, '.env.local') });

console.log('🧪 Testing updated serverDataLoader...\n');

try {
  // Import our updated serverDataLoader
  const { loadServerData } = await import('./src/lib/serverDataLoader.ts');
  
  console.log('📊 Loading data using serverDataLoader...');
  const data = await loadServerData();
  
  console.log('✅ Successfully loaded data!');
  console.log('📈 Respondent utilities:', Array.isArray(data.respondentUtilities) ? data.respondentUtilities.length : 'N/A');
  console.log('👥 Demographics:', Array.isArray(data.demographics) ? data.demographics.length : 'N/A');
  console.log('⚙️ Model parameters:', data.modelParameters ? 'Loaded' : 'Missing');
  console.log('💰 DRN rates:', data.drnRates ? 'Loaded' : 'Missing');
  
} catch (error) {
  console.error('❌ serverDataLoader test failed:', error.message);
  console.error('📋 Full error:', error);
}

console.log('\n🏁 Test completed!');
