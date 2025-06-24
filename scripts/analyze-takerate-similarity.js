#!/usr/bin/env node

/**
 * Script to analyze why take rates are virtually identical across demographic groups
 * This investigates the utility calculation and probability generation process
 */

const fs = require('fs');
const path = require('path');

// Load the data files
const respondentProfilePath = path.join(__dirname, '../src/data/respondentProfile.json');
const respondentUtilitiesPath = path.join(__dirname, '../src/data/respondentUtilities.json');

const respondentProfiles = JSON.parse(fs.readFileSync(respondentProfilePath, 'utf8'));
const respondentUtilitiesData = JSON.parse(fs.readFileSync(respondentUtilitiesPath, 'utf8'));

// Convert utilities data to match the format used in actions.ts
const respondentUtilities = Object.entries(respondentUtilitiesData).map(([id, util]) => ({
  ...util,
  respondentId: id,
  weight: util.weight || 1
}));

console.log('='.repeat(80));
console.log('TAKE RATE SIMILARITY ANALYSIS');
console.log('='.repeat(80));
console.log();

// Sample product for analysis (CNN Reader at $9.99)
const sampleProduct = {
  product: 'CNN Reader',
  monthlyRate: 9.99,
  readerFeatures: ['Article Comments', 'Personalized Feed'],
  streamingFeatures: [],
  verticals: ['Politics', 'Business']
};

console.log('Sample Product Configuration:');
console.log(`  Product: ${sampleProduct.product}`);
console.log(`  Price: $${sampleProduct.monthlyRate}`);
console.log(`  Reader Features: ${sampleProduct.readerFeatures.join(', ')}`);
console.log(`  Verticals: ${sampleProduct.verticals.join(', ')}`);
console.log();

// Define demographic groups to analyze
const demographicGroups = [
  { name: 'Male', filter: (profile) => profile.Gender === 'Male' },
  { name: 'Female', filter: (profile) => profile.Gender === 'Female' },
  { name: '18-34', filter: (profile) => profile.Age_18_34 === 1 },
  { name: '35-54', filter: (profile) => profile.Age_35_54 === 1 },
  { name: '55-74', filter: (profile) => profile.Age_55_74 === 1 },
  { name: 'High Income', filter: (profile) => profile.HHI_100KPlus === 1 },
  { name: 'Low Income', filter: (profile) => profile.HHI_100KPlus === 0 },
  { name: 'Digital News Sub', filter: (profile) => profile.Digital_News_Subscriber === 1 },
  { name: 'No Digital News Sub', filter: (profile) => profile.Digital_News_Subscriber === 0 },
  { name: 'Regular CNN User', filter: (profile) => profile.Regularly_Access_CNN === 1 },
  { name: 'Rare CNN User', filter: (profile) => profile.Rarely_Access_CNN === 1 }
];

console.log('UTILITY COMPONENT ANALYSIS BY DEMOGRAPHIC GROUP:');
console.log('='.repeat(80));

const results = [];

for (const group of demographicGroups) {
  const groupUtilities = [];
  const groupProbabilities = [];
  const componentBreakdown = {
    baseUtility: [],
    priceLinear: [],
    priceSquared: [],
    readerFeatures: [],
    verticals: [],
    verticalCount: []
  };

  let groupCount = 0;

  for (const respondent of respondentUtilities) {
    const profile = respondentProfiles.find(p => String(p.Respondent_ID) === String(respondent.respondentId));
    if (!profile || !group.filter(profile)) continue;

    groupCount++;

    // Calculate utility components (replicating the logic from actions.ts)
    let utility = 0;
    
    // Base utility for CNN Reader
    const baseUtility = respondent.base?.reader || 0;
    utility += baseUtility;
    componentBreakdown.baseUtility.push(baseUtility);

    // Price effects
    const lnPrice = Math.log(sampleProduct.monthlyRate);
    const priceLinear = (respondent.price?.linear || -1.08) * lnPrice;
    const priceSquared = (respondent.price?.squared || -0.007) * lnPrice * lnPrice;
    utility += priceLinear;
    utility += priceSquared;
    componentBreakdown.priceLinear.push(priceLinear);
    componentBreakdown.priceSquared.push(priceSquared);

    // Reader features
    let readerFeatureUtility = 0;
    if (sampleProduct.readerFeatures && respondent.all_features?.reader) {
      for (const feature of sampleProduct.readerFeatures) {
        const featureKey = mapFeatureName(feature);
        const featureValue = respondent.all_features.reader[featureKey] || 0;
        readerFeatureUtility += featureValue;
      }
    }
    utility += readerFeatureUtility;
    componentBreakdown.readerFeatures.push(readerFeatureUtility);

    // Feature count utility
    let featureCountUtility = 0;
    if (sampleProduct.readerFeatures && respondent.featureCounts?.reader) {
      const readerFeatureCount = Math.min(sampleProduct.readerFeatures.length, 5);
      featureCountUtility = respondent.featureCounts.reader[readerFeatureCount] || 0;
    }
    utility += featureCountUtility;

    // Verticals
    let verticalUtility = 0;
    if (sampleProduct.verticals && respondent.all_features?.verticals) {
      for (const vertical of sampleProduct.verticals) {
        const verticalKey = mapVerticalName(vertical);
        const verticalValue = respondent.all_features.verticals[verticalKey] || 0;
        verticalUtility += verticalValue;
      }
    }
    utility += verticalUtility;
    componentBreakdown.verticals.push(verticalUtility);

    // Vertical count utility
    let verticalCountUtility = 0;
    if (sampleProduct.verticals && respondent.verticalCount) {
      const verticalCount = Math.min(sampleProduct.verticals.length, 3);
      verticalCountUtility = respondent.verticalCount[verticalCount] || 0;
    }
    utility += verticalCountUtility;
    componentBreakdown.verticalCount.push(verticalCountUtility);

    groupUtilities.push(utility);

    // Calculate probability (logistic for independent products)
    const probability = 1 / (1 + Math.exp(-utility));
    groupProbabilities.push(probability);
  }

  if (groupCount > 0) {
    const avgUtility = groupUtilities.reduce((a, b) => a + b, 0) / groupUtilities.length;
    const avgProbability = groupProbabilities.reduce((a, b) => a + b, 0) / groupProbabilities.length;
    
    // Calculate average components
    const avgComponents = {};
    for (const [component, values] of Object.entries(componentBreakdown)) {
      avgComponents[component] = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
    }

    // Calculate variance in utilities within the group
    const utilityVariance = groupUtilities.reduce((sum, util) => sum + Math.pow(util - avgUtility, 2), 0) / groupUtilities.length;
    const utilityStdDev = Math.sqrt(utilityVariance);

    results.push({
      group: group.name,
      count: groupCount,
      avgUtility: avgUtility,
      avgProbability: avgProbability,
      takeRate: avgProbability * 100,
      utilityStdDev: utilityStdDev,
      components: avgComponents
    });

    console.log(`${group.name} (n=${groupCount}):`);
    console.log(`  Average Utility: ${avgUtility.toFixed(4)}`);
    console.log(`  Utility Std Dev: ${utilityStdDev.toFixed(4)}`);
    console.log(`  Average Probability: ${avgProbability.toFixed(4)}`);
    console.log(`  Take Rate: ${(avgProbability * 100).toFixed(2)}%`);
    console.log(`  Component Breakdown:`);
    console.log(`    Base Utility: ${avgComponents.baseUtility.toFixed(4)}`);
    console.log(`    Price Linear: ${avgComponents.priceLinear.toFixed(4)}`);
    console.log(`    Price Squared: ${avgComponents.priceSquared.toFixed(4)}`);
    console.log(`    Reader Features: ${avgComponents.readerFeatures.toFixed(4)}`);
    console.log(`    Verticals: ${avgComponents.verticals.toFixed(4)}`);
    console.log(`    Vertical Count: ${avgComponents.verticalCount.toFixed(4)}`);
    console.log();
  }
}

console.log('SUMMARY ANALYSIS:');
console.log('='.repeat(80));

// Calculate overall statistics
const takeRates = results.map(r => r.takeRate);
const minTakeRate = Math.min(...takeRates);
const maxTakeRate = Math.max(...takeRates);
const takeRateRange = maxTakeRate - minTakeRate;
const avgTakeRate = takeRates.reduce((a, b) => a + b, 0) / takeRates.length;

console.log(`Average Take Rate Across Groups: ${avgTakeRate.toFixed(2)}%`);
console.log(`Take Rate Range: ${minTakeRate.toFixed(2)}% - ${maxTakeRate.toFixed(2)}%`);
console.log(`Take Rate Spread: ${takeRateRange.toFixed(2)} percentage points`);
console.log();

// Identify groups with highest and lowest take rates
const sortedResults = results.sort((a, b) => b.takeRate - a.takeRate);
console.log('Groups with Highest Take Rates:');
for (let i = 0; i < Math.min(3, sortedResults.length); i++) {
  console.log(`  ${i + 1}. ${sortedResults[i].group}: ${sortedResults[i].takeRate.toFixed(2)}%`);
}
console.log();

console.log('Groups with Lowest Take Rates:');
for (let i = Math.max(0, sortedResults.length - 3); i < sortedResults.length; i++) {
  console.log(`  ${sortedResults.length - i}. ${sortedResults[i].group}: ${sortedResults[i].takeRate.toFixed(2)}%`);
}
console.log();

// Analyze component variation
console.log('COMPONENT VARIATION ANALYSIS:');
console.log('='.repeat(80));

const componentNames = ['baseUtility', 'priceLinear', 'priceSquared', 'readerFeatures', 'verticals', 'verticalCount'];
for (const component of componentNames) {
  const componentValues = results.map(r => r.components[component]);
  const componentMin = Math.min(...componentValues);
  const componentMax = Math.max(...componentValues);
  const componentRange = componentMax - componentMin;
  const componentAvg = componentValues.reduce((a, b) => a + b, 0) / componentValues.length;
  
  console.log(`${component}:`);
  console.log(`  Average: ${componentAvg.toFixed(4)}`);
  console.log(`  Range: ${componentMin.toFixed(4)} to ${componentMax.toFixed(4)}`);
  console.log(`  Spread: ${componentRange.toFixed(4)}`);
  console.log(`  Coefficient of Variation: ${componentAvg !== 0 ? (Math.sqrt(componentValues.reduce((sum, val) => sum + Math.pow(val - componentAvg, 2), 0) / componentValues.length) / Math.abs(componentAvg) * 100).toFixed(2) + '%' : 'N/A'}`);
  console.log();
}

console.log('POTENTIAL ISSUES IDENTIFIED:');
console.log('='.repeat(80));

if (takeRateRange < 1.0) {
  console.log('❌ ISSUE: Take rates are too similar across groups (< 1% spread)');
  console.log('   This suggests the model may not be capturing demographic differences properly.');
}

if (results.every(r => r.utilityStdDev < 0.5)) {
  console.log('❌ ISSUE: Low within-group utility variance');
  console.log('   This suggests individual preferences may be too homogeneous.');
}

// Check if price dominates
const priceComponents = results.map(r => Math.abs(r.components.priceLinear) + Math.abs(r.components.priceSquared));
const nonPriceComponents = results.map(r => 
  Math.abs(r.components.baseUtility) + 
  Math.abs(r.components.readerFeatures) + 
  Math.abs(r.components.verticals) + 
  Math.abs(r.components.verticalCount)
);

const avgPriceEffect = priceComponents.reduce((a, b) => a + b, 0) / priceComponents.length;
const avgNonPriceEffect = nonPriceComponents.reduce((a, b) => a + b, 0) / nonPriceComponents.length;

if (avgPriceEffect > avgNonPriceEffect * 3) {
  console.log('❌ ISSUE: Price effects dominate non-price effects');
  console.log(`   Price effect magnitude: ${avgPriceEffect.toFixed(4)}`);
  console.log(`   Non-price effect magnitude: ${avgNonPriceEffect.toFixed(4)}`);
  console.log('   This can lead to similar take rates across groups if price sensitivity is similar.');
}

console.log();
console.log('RECOMMENDATIONS:');
console.log('='.repeat(80));
console.log('1. Check if demographic-specific utility parameters exist in the data');
console.log('2. Verify that base utilities vary meaningfully across respondent types');
console.log('3. Consider adding demographic interaction terms to the model');
console.log('4. Examine whether price sensitivity varies by demographic group');
console.log('5. Review if feature/vertical preferences differ across segments');

// Save detailed results
const outputPath = path.join(__dirname, '../takerate-similarity-analysis.json');
fs.writeFileSync(outputPath, JSON.stringify({
  timestamp: new Date().toISOString(),
  sampleProduct: sampleProduct,
  analysis: {
    overallStats: {
      avgTakeRate,
      takeRateRange,
      minTakeRate,
      maxTakeRate
    },
    groupResults: results,
    componentAnalysis: {
      avgPriceEffect,
      avgNonPriceEffect,
      priceToNonPriceRatio: avgNonPriceEffect > 0 ? avgPriceEffect / avgNonPriceEffect : 'N/A'
    }
  }
}, null, 2));

console.log(`\nDetailed analysis saved to: ${outputPath}`);
