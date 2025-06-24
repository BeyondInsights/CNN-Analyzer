/**
 * Simple test to verify the mapping functions work correctly
 */

// Feature name mapping from UI to data keys
const mapFeatureName = (uiName) => {
  const featureMap = {
    // Reader features
    "Unlimited articles": "Unlimited_Articles_on_CNNcom_and_the_CNN_mobile_app",
    "Short-form video": "ShortForm_Video_Unlimited_access",
    "Subscriber-only articles": "SubscriberOnly_Articles_Newsletters_and_Podcasts",
    "CNN Reality Check": "CNN_Reality_Check",
    "Podcast Club": "Podcast_Club",
    "News from local providers": "News_from_Local_Providers",
    "CNN You": "CNN_You",
    "CNN Technology Insider": "CNN_Technology_Insider_I",
    "Bonus Subscription": "Bonus_Subscription",
    "News from global providers": "News_from_Global_Providers",
    "CNN Live Events and Expert Q&A": "CNN_Live_Events_and_Expert",
    "Ask CNN": "Ask_CNN",
    "Al Anchor": "AI_Anchor",
    "CNN Business & Markets Insider": "CNN_Business_Markets_Insider_I",
    "CNN Archive": "CNN_Archive",
    // Streaming features
    "24/7 Live News Channel": "247_Live_News_Channel",
    "Catch Up Channel": "Catch_Up_Channel",
    "CNN Library On-Demand": "CNN_Library_OnDemand",
    "Curated video playlist channels": "Curated_Video_Playlist_Channels",
    "Multiview": "Multiview",
    "Personalized Daily Video Briefings": "Personalized_Daily_Video_Briefings",
    "Real-time Fact Checking": "RealTime_Fact_Checking",
    "Live Q&A with CNN Experts": "Live_QA_with_CNN_Experts",
    "Live Global Feeds": "Live_Global_Feeds",
    "Customized Local News": "Customized_Local_News",
    "Original Short-Form CNN Series": "Original_ShortForm_CNN_Series",
    "Live Text Commentary from CNN Experts": "Live_Text_Commentary_from_CNN_Experts",
    "Interactive video companions": "Interactive_Video_Companions",
    "Real-Time News Ticker": "RealTime_News_Ticker",
    "Exclusive": "Exclusive_SubscriberOnly_Events"
  };
  return featureMap[uiName] || uiName.replace(/ /g, '_');
};

const mapVerticalName = (uiName) => {
  const verticalMap = {
    "CNN Entertainment Tracker": "D1_4",
    "CNN Meditation & Mindfulness": "D1_2",
    "CNN Personal Finance": "B2",
    "CNN Fitness": "D1_3",
    "CNN Expert Buying Guide": "B1",
    "CNN Weather & Natural Phenomena": "D2_4",
    "CNN Longevity": "D1_1",
    "CNN Beauty": "D2_3",
    "CNN Travel": "D2_1",
    "CNN Home": "D2_2"
  };
  return verticalMap[uiName] || uiName;
};

// Load actual data to verify mappings
const fs = require('fs');
const path = require('path');

const respondentUtilities = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/respondentUtilities.json'), 'utf8'));
const sampleRespondent = Object.values(respondentUtilities)[0];

console.log('=== TESTING MAPPING FUNCTIONS ===');

// Test reader features
const testReaderFeatures = [
  "Unlimited articles",
  "Short-form video", 
  "Subscriber-only articles",
  "CNN Reality Check",
  "CNN Technology Insider",
  "Al Anchor"
];

console.log('\nReader Feature Mapping Tests:');
testReaderFeatures.forEach(uiName => {
  const dataKey = mapFeatureName(uiName);
  const exists = sampleRespondent.all_features?.reader?.[dataKey] !== undefined;
  console.log(`  "${uiName}" -> "${dataKey}" ${exists ? '✓' : '✗'}`);
});

// Test streaming features
const testStreamingFeatures = [
  "24/7 Live News Channel",
  "CNN You",
  "Real-time Fact Checking",
  "Curated video playlist channels"
];

console.log('\nStreaming Feature Mapping Tests:');
testStreamingFeatures.forEach(uiName => {
  const dataKey = mapFeatureName(uiName);
  const exists = sampleRespondent.all_features?.streaming?.[dataKey] !== undefined;
  console.log(`  "${uiName}" -> "${dataKey}" ${exists ? '✓' : '✗'}`);
});

// Test vertical features  
const testVerticals = [
  "CNN Longevity",
  "CNN Personal Finance",
  "CNN Travel",
  "CNN Expert Buying Guide"
];

console.log('\nVertical Mapping Tests:');
testVerticals.forEach(uiName => {
  const dataKey = mapVerticalName(uiName);
  const exists = sampleRespondent.all_features?.verticals?.[dataKey] !== undefined;
  console.log(`  "${uiName}" -> "${dataKey}" ${exists ? '✓' : '✗'}`);
});

console.log('\n=== ACTUAL DATA KEYS AVAILABLE ===');
console.log('Reader keys:', Object.keys(sampleRespondent.all_features?.reader || {}));
console.log('Streaming keys:', Object.keys(sampleRespondent.all_features?.streaming || {}));
console.log('Vertical keys:', Object.keys(sampleRespondent.all_features?.verticals || {}));

console.log('\n✓ Mapping test complete!');
