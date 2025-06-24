#!/usr/bin/env node

/**
 * Script to count demographic groups using the same approach as the reports
 * Based on the demographic segments defined in constants.ts and actions.ts
 */

const fs = require('fs');
const path = require('path');

// Load the data files
const respondentProfilePath = path.join(__dirname, '../src/data/respondentProfile.json');
const respondentUtilitiesPath = path.join(__dirname, '../src/data/respondentUtilities.json');

if (!fs.existsSync(respondentProfilePath)) {
  console.error('Error: respondentProfile.json not found at', respondentProfilePath);
  process.exit(1);
}

if (!fs.existsSync(respondentUtilitiesPath)) {
  console.error('Error: respondentUtilities.json not found at', respondentUtilitiesPath);
  process.exit(1);
}

const respondentProfiles = JSON.parse(fs.readFileSync(respondentProfilePath, 'utf8'));
const respondentUtilitiesData = JSON.parse(fs.readFileSync(respondentUtilitiesPath, 'utf8'));

// Convert utilities data to match the format used in actions.ts
const respondentUtilities = Object.entries(respondentUtilitiesData).map(([id, util]) => ({
  ...util,
  respondentId: id,
  weight: util.weight || 1
}));

// Demographic segments as defined in constants.ts
const DEMOGRAPHIC_SEGMENTS = [
  { group: 'Male' },
  { group: 'Female' },
  { group: '18-34' },
  { group: '35-54' },
  { group: '55-74' },
  { group: 'Have Linear TV' },
  { group: 'No Linear TV' },
  { group: 'Digital News Subscriber' },
  { group: 'Not Digital News Subscriber' },
  { group: 'Watched Linear TV Network P30D' },
  { group: 'Accessed CNN.com P30D' },
  { group: 'Regularly Access CNN' },
  { group: 'Occasionally Access CNN' },
  { group: 'Rarely Access CNN' },
  { group: 'Never Access CNN' }
];

console.log('='.repeat(60));
console.log('DEMOGRAPHIC GROUP COUNTS');
console.log('='.repeat(60));
console.log();

const results = [];
let totalSampleCount = 0;
let totalWeightedCount = 0;

// Process each demographic segment
for (const segment of DEMOGRAPHIC_SEGMENTS) {
  let count = 0;
  let weightedCount = 0;
  const respondentProcessedForCount = new Set();

  for (const resp of respondentUtilities) {
    const profile = respondentProfiles.find(p => String(p.Respondent_ID) === String(resp.respondentId));
    if (!profile) continue;

    let belongsToSegment = false;
    
    // Use the same logic as in actions.ts
    switch (segment.group) {
      case 'Male': 
        belongsToSegment = profile.Gender === 'Male'; 
        break;
      case 'Female': 
        belongsToSegment = profile.Gender === 'Female'; 
        break;
      case '18-34': 
        belongsToSegment = profile.Age_18_34 === 1; 
        break;
      case '35-54': 
        belongsToSegment = profile.Age_35_54 === 1; 
        break;
      case '55-74': 
        belongsToSegment = profile.Age_55_74 === 1; 
        break;
      case 'Have Linear TV': 
        belongsToSegment = profile.Have_Linear_TV === 1; 
        break;
      case 'No Linear TV': 
        belongsToSegment = profile.Have_Linear_TV === 0; 
        break;
      case 'Digital News Subscriber': 
        belongsToSegment = profile.Digital_News_Subscriber === 1; 
        break;
      case 'Not Digital News Subscriber': 
        belongsToSegment = profile.Digital_News_Subscriber === 0; 
        break;
      case 'Watched Linear TV Network P30D': 
        belongsToSegment = profile.Watched_TV_30D === 1; 
        break;
      case 'Accessed CNN.com P30D': 
        belongsToSegment = profile.Accessed_CNN_30D === 1; 
        break;
      case 'Regularly Access CNN': 
        belongsToSegment = profile.Regularly_Access_CNN === 1; 
        break;
      case 'Occasionally Access CNN': 
        belongsToSegment = profile.Occasionally_Access_CNN === 1; 
        break;
      case 'Rarely Access CNN': 
        belongsToSegment = profile.Rarely_Access_CNN === 1; 
        break;
      case 'Never Access CNN': 
        belongsToSegment = profile.Regularly_Access_CNN === 0 && 
                          profile.Occasionally_Access_CNN === 0 && 
                          profile.Rarely_Access_CNN === 0; 
        break;
    }

    if (belongsToSegment) {
      if (!respondentProcessedForCount.has(resp.respondentId)) {
        count++;
        respondentProcessedForCount.add(resp.respondentId);
      }
      weightedCount += resp.weight || 1;
    }
  }

  if (count > 0) {
    const result = {
      segmentName: segment.group,
      count: count,
      weightedCount: Math.round(weightedCount),
      percentage: ((count / respondentUtilities.length) * 100).toFixed(1)
    };
    results.push(result);
  }
}

// Calculate totals for verification
for (const resp of respondentUtilities) {
  totalSampleCount++;
  totalWeightedCount += resp.weight || 1;
}

// Display results grouped by category
const categories = {
  'Gender': ['Male', 'Female'],
  'Age Groups': ['18-34', '35-54', '55-74'],
  'Linear TV': ['Have Linear TV', 'No Linear TV'],
  'Digital News Subscription': ['Digital News Subscriber', 'Not Digital News Subscriber'],
  'TV/CNN Engagement': ['Watched Linear TV Network P30D', 'Accessed CNN.com P30D'],
  'CNN Access Frequency': ['Regularly Access CNN', 'Occasionally Access CNN', 'Rarely Access CNN', 'Never Access CNN']
};

for (const [category, segments] of Object.entries(categories)) {
  console.log(`${category.toUpperCase()}:`);
  console.log('-'.repeat(category.length + 1));
  
  let categoryTotal = 0;
  let categoryWeightedTotal = 0;
  
  for (const segmentName of segments) {
    const result = results.find(r => r.segmentName === segmentName);
    if (result) {
      console.log(`  ${result.segmentName.padEnd(30)} ${result.count.toString().padStart(5)} (${result.percentage}%)  Weighted: ${result.weightedCount.toLocaleString()}`);
      categoryTotal += result.count;
      categoryWeightedTotal += result.weightedCount;
    } else {
      console.log(`  ${segmentName.padEnd(30)}     0 (0.0%)  Weighted: 0`);
    }
  }
  
  console.log(`  ${'SUBTOTAL'.padEnd(30)} ${categoryTotal.toString().padStart(5)}           Weighted: ${categoryWeightedTotal.toLocaleString()}`);
  console.log();
}

// Summary
console.log('='.repeat(60));
console.log('SUMMARY:');
console.log(`Total Sample Size: ${totalSampleCount.toLocaleString()}`);
console.log(`Total Weighted Count: ${Math.round(totalWeightedCount).toLocaleString()}`);
console.log(`Number of Demographic Segments: ${results.length}`);
console.log('='.repeat(60));

// Save results to JSON file
const outputPath = path.join(__dirname, '../demographic-counts.json');
const outputData = {
  timestamp: new Date().toISOString(),
  totalSampleSize: totalSampleCount,
  totalWeightedCount: Math.round(totalWeightedCount),
  segments: results,
  categories: categories
};

fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2));
console.log(`\nResults saved to: ${outputPath}`);
