const utils = require('./src/data/respondentUtilities.json');
const profiles = require('./src/data/respondentProfile.json');

const utilIds = Object.keys(utils);
const profileIds = new Set(profiles.map(p => String(p.Respondent_ID)));

const missing = utilIds.filter(id => !profileIds.has(id));
console.log(`Total utilities: ${utilIds.length}`);
console.log(`Missing in profiles: ${missing.length}`);
if (missing.length > 0) {
  console.log('First few missing:', missing.slice(0, 5));
}

// Test the comparison
const testId = utilIds[0];
const testProfile = profiles.find(p => p.Respondent_ID == testId);
console.log(`\nTest: Can we find utility ID "${testId}" in profiles?`, !!testProfile);
console.log(`Using == comparison: ${4 == "4"}`);
console.log(`Using === comparison: ${4 === "4"}`);
