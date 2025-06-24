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

// UI feature names (simplified)
const uiReaderFeatures = [
  "Unlimited articles",
  "Short-form video", 
  "Subscriber-only articles",
  "CNN Reality Check",
  "CNN Technology Insider"
];

const uiStreamingFeatures = [
  "24/7 Live News Channel",
  "CNN You",
  "Real-time Fact Checking"
];

console.log('\n=== MAPPING TEST RESULTS ===');

// Test reader features
console.log('Reader feature mappings:');
featureMappingData.reader.forEach(fullName => {
  const dataKey = testMapping(fullName);
  const actualExists = sampleRespondent.all_features?.reader?.[dataKey] !== undefined;
  console.log(`  "${fullName}" -> "${dataKey}" ${actualExists ? '✓' : '✗'}`);
});

console.log('\nTesting UI names to data keys:');
uiReaderFeatures.forEach(uiName => {
  // Try to find matching full name
  let matchedDataKey = null;
  for (const fullName of featureMappingData.reader) {
    if (fullName.toLowerCase().includes(uiName.toLowerCase()) || 
        uiName.toLowerCase().includes(fullName.toLowerCase().split(' ')[0])) {
      matchedDataKey = testMapping(fullName);
      break;
    }
  }
  const actualExists = matchedDataKey && sampleRespondent.all_features?.reader?.[matchedDataKey] !== undefined;
  console.log(`  UI: "${uiName}" -> Data: "${matchedDataKey || 'NOT FOUND'}" ${actualExists ? '✓' : '✗'}`);
});

// Create the mapping functions (simplified version of what's in mappings.ts)
const createFeatureMapping = () => {
  const readerMapping = {};
  const streamingMapping = {};
  
  featureMappingData.reader.forEach((fullName) => {
    // Create key to match the actual data format (CamelCase with underscores)
    const dataKey = fullName
      .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special characters
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('_');
    
    // Map both full name and common UI variations to the data key
    readerMapping[fullName] = dataKey;
    
    // Add simplified versions that might be used in UI
    if (fullName.includes('Unlimited Articles')) {
      readerMapping['Unlimited articles'] = dataKey;
    }
    if (fullName.includes('Short-Form Video')) {
      readerMapping['Short-form video'] = dataKey;
    }
    if (fullName.includes('Subscriber-Only Articles')) {
      readerMapping['Subscriber-only articles, newsletters, and podcasts'] = dataKey;
      readerMapping['Subscriber-only articles'] = dataKey;
    }
    if (fullName.includes('CNN Technology Insider I')) {
      readerMapping['CNN Technology Insider'] = dataKey;
    }
    if (fullName.includes('CNN Business & Markets Insider I')) {
      readerMapping['CNN Business & Markets Insider'] = dataKey;
    }
    if (fullName.includes('CNN Live Events and Expert')) {
      readerMapping['CNN Live Events and Expert Q&A'] = dataKey;
    }
    if (fullName.includes('AI Anchor')) {
      readerMapping['Al Anchor'] = dataKey; // Handle typo in constants.ts
    }
    if (fullName.includes('News from Local Providers')) {
      readerMapping['News from local providers'] = dataKey;
    }
    if (fullName.includes('News from Global Providers')) {
      readerMapping['News from global providers'] = dataKey;
    }
  });
  
  featureMappingData.streaming.forEach((fullName) => {
    const dataKey = fullName
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('_');
    
    streamingMapping[fullName] = dataKey;
    
    // Add simplified versions
    if (fullName.includes('Curated Video Playlist')) {
      streamingMapping['Curated video playlist channels'] = dataKey;
    }
    if (fullName.includes('Real-Time Fact Checking')) {
      streamingMapping['Real-time Fact Checking'] = dataKey;
    }
    if (fullName.includes('Interactive Video Companions')) {
      streamingMapping['Interactive video companions'] = dataKey;
    }
    if (fullName.includes('CNN You Streaming')) {
      streamingMapping['CNN You'] = dataKey; // Map UI "CNN You" to "CNN You Streaming" data key
    }
    if (fullName.includes('Exclusive, Subscriber-Only Events')) {
      streamingMapping['Exclusive, Subscriber-Only Events'] = dataKey;
      streamingMapping['Exclusive'] = dataKey; // Handle truncated UI name
    }
  });
  
  return { reader: readerMapping, streaming: streamingMapping };
};

const createVerticalMapping = () => {
  const verticalMapping = {};
  verticalMappingData.forEach((vertical) => {
    verticalMapping[vertical.Vertical_Name] = vertical.Vertical_Code;
  });
  return verticalMapping;
};

const featureMapping = createFeatureMapping();
const verticalMapping = createVerticalMapping();

// Test reader feature mappings
console.log('Reader feature mapping tests:');
uiReaderFeatures.forEach(uiName => {
  const dataKey = featureMapping.reader[uiName];
  console.log(`  "${uiName}" -> "${dataKey || 'NOT FOUND'}"`);
});

console.log('\nStreaming feature mapping tests:');
uiStreamingFeatures.forEach(uiName => {
  const dataKey = featureMapping.streaming[uiName];
  console.log(`  "${uiName}" -> "${dataKey || 'NOT FOUND'}"`);
});

console.log('\nVertical mapping tests:');
uiVerticalFeatures.forEach(uiName => {
  const dataKey = verticalMapping[uiName];
  console.log(`  "${uiName}" -> "${dataKey || 'NOT FOUND'}"`);
});

// Check what keys actually exist in respondent data
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
