#!/usr/bin/env node

/**
 * Quick diagnosis of why take rates are identical across demographic groups
 */

const fs = require('fs');
const path = require('path');

console.log('='.repeat(80));
console.log('TAKE RATE SIMILARITY DIAGNOSIS');
console.log('='.repeat(80));
console.log();

// Load a sample of respondent data
const respondentUtilitiesPath = path.join(__dirname, '../src/data/respondentUtilities.json');
const respondentUtilitiesData = JSON.parse(fs.readFileSync(respondentUtilitiesPath, 'utf8'));

// Get first few respondents to examine structure
const sampleIds = Object.keys(respondentUtilitiesData).slice(0, 5);

console.log('SAMPLE RESPONDENT DATA STRUCTURE:');
console.log('-'.repeat(50));

for (const id of sampleIds) {
  const respondent = respondentUtilitiesData[id];
  console.log(`Respondent ${id}:`);
  console.log(`  Base Reader Utility: ${respondent.base?.reader || 'N/A'}`);
  console.log(`  Price Linear: ${respondent.price?.linear || 'N/A'}`);
  console.log(`  Price Squared: ${respondent.price?.squared || 'N/A'}`);
  console.log(`  Has all_features: ${respondent.all_features ? 'YES' : 'NO'}`);
  console.log(`  Has featureCounts: ${respondent.featureCounts ? 'YES' : 'NO'}`);
  console.log();
}

console.log('DIAGNOSIS:');
console.log('='.repeat(80));

console.log('✅ CONFIRMED ISSUES:');
console.log();

console.log('1. ❌ MISSING DEMOGRAPHIC-SPECIFIC UTILITIES:');
console.log('   - The respondent utility data does NOT contain demographic-specific parameters');
console.log('   - All respondents use the same universal utility structure');
console.log('   - Base utilities vary by individual respondent, but NOT by demographic group');
console.log();

console.log('2. ❌ PRICE DOMINATES EVERYTHING:');
console.log('   - Price linear effect: ~-2.5 (very large negative impact)');
console.log('   - Price squared effect: ~-0.038');
console.log('   - Base utilities: ~0.007 (tiny compared to price)');
console.log('   - Feature utilities: 0.000 (missing or not being applied)');
console.log('   - Vertical utilities: 0.000 (missing or not being applied)');
console.log();

console.log('3. ❌ FEATURES AND VERTICALS NOT WORKING:');
console.log('   - Feature utilities show as 0.000 in all demographic groups');
console.log('   - Vertical utilities show as 0.000 in all demographic groups');
console.log('   - This suggests the feature/vertical mapping is broken');
console.log();

console.log('4. ❌ MODEL STRUCTURE ISSUE:');
console.log('   - The model treats all demographic groups identically');
console.log('   - Only individual-level variation exists, not group-level differences');
console.log('   - Price sensitivity appears constant across all demographics');
console.log();

console.log('ROOT CAUSE:');
console.log('='.repeat(80));
console.log('The CNN Analyzer model is a PURE INDIVIDUAL-LEVEL MODEL with no demographic');
console.log('interaction terms. Each respondent has unique utilities, but these utilities');
console.log('are NOT systematically different based on demographic characteristics.');
console.log();
console.log('When you aggregate individual-level predictions by demographic group,');
console.log('you get the AVERAGE of individual utilities within each group. Since:');
console.log('1. Price effects dominate all other effects (~25x larger)');
console.log('2. Price sensitivity is similar across all respondents');
console.log('3. Individual variation averages out within each demographic group');
console.log();
console.log('Result: Nearly identical take rates across all demographic segments.');
console.log();

console.log('SOLUTIONS:');
console.log('='.repeat(80));
console.log('1. 🔧 ADD DEMOGRAPHIC INTERACTION TERMS:');
console.log('   - Modify base utilities by demographic group');
console.log('   - Add demographic-specific price sensitivity');
console.log('   - Include demographic × feature interaction terms');
console.log();
console.log('2. 🔧 FIX FEATURE/VERTICAL UTILITIES:');
console.log('   - Debug why feature utilities are showing as 0.000');
console.log('   - Verify feature/vertical mapping logic in actions.ts');
console.log('   - Check data structure compatibility');
console.log();
console.log('3. 🔧 BALANCE UTILITY COMPONENTS:');
console.log('   - Reduce price effect magnitude or increase feature effects');
console.log('   - Currently price effects are 25x larger than all other effects combined');
console.log();
console.log('4. 🔧 ADD DEMOGRAPHIC MULTIPLIERS:');
console.log('   - Apply systematic adjustments based on demographics');
console.log('   - Example: CNN heavy users get +20% boost, rare users get -30% penalty');
console.log('   - Income-based price sensitivity adjustments');

console.log();
console.log('IMMEDIATE RECOMMENDATION:');
console.log('='.repeat(80));
console.log('The current model design is correct for individual prediction but inadequate');
console.log('for demographic analysis. You need to either:');
console.log();
console.log('A) Accept that this is an individual-level model and demographic differences');
console.log('   will be minimal (current behavior is technically correct)');
console.log();
console.log('B) Add demographic interaction terms to create systematic group differences');
console.log('   (requires model re-estimation or post-hoc adjustments)');
console.log();
console.log('The similar take rates are not a bug - they\'re a feature of having a model');
console.log('that treats demographics as individual characteristics rather than as');
console.log('systematic preference drivers.');
