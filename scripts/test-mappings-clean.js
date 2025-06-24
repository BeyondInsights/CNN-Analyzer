/**
 * Test the feature and vertical mappings to ensure they work correctly
 */

const fs = require('fs');
const path = require('path');

console.log('Starting mapping test...');

// Load the data files
const featureMappingData = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/featureMapping.json'), 'utf8'));
const verticalMappingData = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/verticalMapping.json'), 'utf8'));
const respondentUtilities = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/respondentUtilities.json'), 'utf8'));

console.log('Data files loaded successfully');

// Get sample respondent data keys
const sampleRespondent = Object.values(respondentUtilities)[0];
console.log('\n=== ACTUAL DATA KEYS IN RESPONDENT UTILITIES ===');
if (sampleRespondent.all_features?.reader) {
  console.log('Reader feature keys in data:');
  Object.keys(sampleRespondent.all_features.reader).forEach(key => {
    console.log(`  "${key}"`);
  });
}

if (sampleRespondent.all_features?.streaming) {
  console.log('\nStreaming feature keys in data:');
  Object.keys(sampleRespondent.all_features.streaming).forEach(key => {
    console.log(`  "${key}"`);
  });
}

if (sampleRespondent.all_features?.verticals) {
  console.log('\nVertical keys in data:');
  Object.keys(sampleRespondent.all_features.verticals).forEach(key => {
    console.log(`  "${key}"`);
  });
}

// Test the new mapping logic  
console.log('\n=== TESTING NEW MAPPING LOGIC ===');
const testMapping = (fullName) => {
  const dataKey = fullName
    .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special characters
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('_');
  return dataKey;
};

console.log('Testing some key mappings:');
console.log(`"Unlimited Articles on CNN.com and the CNN mobile app" -> "${testMapping('Unlimited Articles on CNN.com and the CNN mobile app')}"`);
console.log(`"Short-Form Video Unlimited access" -> "${testMapping('Short-Form Video Unlimited access')}"`);
console.log(`"Subscriber-Only Articles, Newsletters, and Podcasts" -> "${testMapping('Subscriber-Only Articles, Newsletters, and Podcasts')}"`);

console.log('\n=== MAPPING TEST RESULTS ===');

// Test reader features
console.log('Reader feature mappings:');
featureMappingData.reader.forEach(fullName => {
  const dataKey = testMapping(fullName);
  const actualExists = sampleRespondent.all_features?.reader?.[dataKey] !== undefined;
  console.log(`  "${fullName}" -> "${dataKey}" ${actualExists ? '✓' : '✗'}`);
});

console.log('\nStreaming feature mappings:');
featureMappingData.streaming.forEach(fullName => {
  const dataKey = testMapping(fullName);
  const actualExists = sampleRespondent.all_features?.streaming?.[dataKey] !== undefined;
  console.log(`  "${fullName}" -> "${dataKey}" ${actualExists ? '✓' : '✗'}`);
});

// UI feature names (from constants.ts)
const uiReaderFeatures = [
  "Unlimited articles",
  "Short-form video", 
  "Subscriber-only articles",
  "CNN Reality Check",
  "CNN Technology Insider",
  "News from local providers",
  "News from global providers",
  "CNN Live Events and Expert Q&A",
  "Al Anchor", // Note: this is a typo in constants.ts, should be "AI Anchor"
  "CNN Business & Markets Insider"
];

const uiStreamingFeatures = [
  "24/7 Live News Channel",
  "CNN You",
  "Real-time Fact Checking",
  "Curated video playlist channels",
  "Interactive video companions",
  "Exclusive" // This appears to be truncated in constants.ts
];

console.log('\n=== UI TO DATA KEY MAPPING TESTS ===');

// Create proper mappings
const createReaderMapping = () => {
  const mapping = {};
  
  // Direct mappings from featureMapping.json to data keys
  mapping["Unlimited articles"] = "Unlimited_Articles_On_Cnncom_And_The_Cnn_Mobile_App";
  mapping["Short-form video"] = "Shortform_Video_Unlimited_Access";
  mapping["Subscriber-only articles"] = "Subscriberonly_Articles_Newsletters_And_Podcasts";
  mapping["CNN Reality Check"] = "Cnn_Reality_Check";
  mapping["CNN Technology Insider"] = "Cnn_Technology_Insider_I";
  mapping["News from local providers"] = "News_From_Local_Providers";
  mapping["News from global providers"] = "News_From_Global_Providers";
  mapping["CNN Live Events and Expert Q&A"] = "Cnn_Live_Events_And_Expert";
  mapping["Al Anchor"] = "Ai_Anchor"; // Mapping typo to correct data key
  mapping["CNN Business & Markets Insider"] = "Cnn_Business_Markets_Insider_I";
  
  return mapping;
};

const createStreamingMapping = () => {
  const mapping = {};
  
  mapping["24/7 Live News Channel"] = "247_Live_News_Channel";
  mapping["CNN You"] = "Cnn_You_Streaming";
  mapping["Real-time Fact Checking"] = "Realtime_Fact_Checking";
  mapping["Curated video playlist channels"] = "Curated_Video_Playlist_Channels";
  mapping["Interactive video companions"] = "Interactive_Video_Companions";
  mapping["Exclusive"] = "Exclusive_Subscriberonly_Events";
  
  return mapping;
};

const readerMapping = createReaderMapping();
const streamingMapping = createStreamingMapping();

console.log('Reader UI name to data key mappings:');
uiReaderFeatures.forEach(uiName => {
  const dataKey = readerMapping[uiName];
  const actualExists = dataKey && sampleRespondent.all_features?.reader?.[dataKey] !== undefined;
  console.log(`  UI: "${uiName}" -> Data: "${dataKey || 'NOT FOUND'}" ${actualExists ? '✓' : '✗'}`);
});

console.log('\nStreaming UI name to data key mappings:');
uiStreamingFeatures.forEach(uiName => {
  const dataKey = streamingMapping[uiName];
  const actualExists = dataKey && sampleRespondent.all_features?.streaming?.[dataKey] !== undefined;
  console.log(`  UI: "${uiName}" -> Data: "${dataKey || 'NOT FOUND'}" ${actualExists ? '✓' : '✗'}`);
});

console.log('\n=== VERTICAL MAPPING TEST ===');
console.log('Vertical mappings:');
verticalMappingData.forEach(vertical => {
  const dataKey = vertical.Vertical_Code;
  const actualExists = sampleRespondent.all_features?.verticals?.[dataKey] !== undefined;
  console.log(`  "${vertical.Vertical_Name}" -> "${dataKey}" ${actualExists ? '✓' : '✗'}`);
});
