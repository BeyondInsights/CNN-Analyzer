/**
 * Mapping functions to convert between UI feature/vertical names and respondent data keys
 */

import featureMappingData from '@/data/featureMapping.json';
import verticalMappingData from '@/data/verticalMapping.json';

// Create reverse mapping from UI names to data keys for features
const createFeatureMapping = () => {
  const readerMapping: Record<string, string> = {};
  const streamingMapping: Record<string, string> = {};
  
  // Direct mapping based on actual data keys in a7b9c2d1.json
  // Reader features
  readerMapping["Unlimited Articles on CNN.com and the CNN mobile app"] = "Unlimited_Articles_on_CNNcom_and_the_CNN_mobile_app";
  readerMapping["Unlimited articles"] = "Unlimited_Articles_on_CNNcom_and_the_CNN_mobile_app";
  
  readerMapping["Short-Form Video Unlimited access"] = "ShortForm_Video_Unlimited_access";
  readerMapping["Short-form video"] = "ShortForm_Video_Unlimited_access";
  
  readerMapping["Subscriber-Only Articles, Newsletters, and Podcasts"] = "SubscriberOnly_Articles_Newsletters_and_Podcasts";
  readerMapping["Subscriber-only articles, newsletters, and podcasts"] = "SubscriberOnly_Articles_Newsletters_and_Podcasts";
  readerMapping["Subscriber-only articles"] = "SubscriberOnly_Articles_Newsletters_and_Podcasts";
  
  readerMapping["CNN Reality Check"] = "CNN_Reality_Check";
  readerMapping["Podcast Club"] = "Podcast_Club";
  
  readerMapping["News from Local Providers"] = "News_from_Local_Providers";
  readerMapping["News from local providers"] = "News_from_Local_Providers";
  
  readerMapping["CNN You"] = "CNN_You";
  
  readerMapping["CNN Technology Insider I"] = "CNN_Technology_Insider_I";
  readerMapping["CNN Technology Insider"] = "CNN_Technology_Insider_I";
  
  readerMapping["Bonus Subscription"] = "Bonus_Subscription";
  
  readerMapping["News from Global Providers"] = "News_from_Global_Providers";
  readerMapping["News from global providers"] = "News_from_Global_Providers";
  
  readerMapping["CNN Live Events and Expert"] = "CNN_Live_Events_and_Expert";
  readerMapping["CNN Live Events and Expert Q&A"] = "CNN_Live_Events_and_Expert";
  
  readerMapping["Ask CNN"] = "Ask_CNN";
  
  readerMapping["AI Anchor"] = "AI_Anchor";
  readerMapping["Al Anchor"] = "AI_Anchor"; // Handle typo in constants.ts
  
  readerMapping["CNN Business & Markets Insider I"] = "CNN_Business_Markets_Insider_I";
  readerMapping["CNN Business & Markets Insider"] = "CNN_Business_Markets_Insider_I";
  
  readerMapping["CNN Archive"] = "CNN_Archive";
  
  // Streaming features
  streamingMapping["24/7 Live News Channel"] = "247_Live_News_Channel";
  streamingMapping["Catch Up Channel"] = "Catch_Up_Channel";
  
  streamingMapping["CNN Library On-Demand"] = "CNN_Library_OnDemand";
  streamingMapping["CNN Library On-Demand"] = "CNN_Library_OnDemand";
  
  streamingMapping["Curated Video Playlist Channels"] = "Curated_Video_Playlist_Channels";
  streamingMapping["Curated video playlist channels"] = "Curated_Video_Playlist_Channels";
  
  streamingMapping["Multiview"] = "Multiview";
  streamingMapping["Personalized Daily Video Briefings"] = "Personalized_Daily_Video_Briefings";
  
  streamingMapping["Real-Time Fact Checking"] = "RealTime_Fact_Checking";
  streamingMapping["Real-time Fact Checking"] = "RealTime_Fact_Checking";
  
  streamingMapping["CNN You Streaming"] = "CNN_You_Streaming";
  streamingMapping["CNN You"] = "CNN_You_Streaming"; // Map UI "CNN You" to streaming data
  
  streamingMapping["Live Q&A with CNN Experts"] = "Live_QA_with_CNN_Experts";
  streamingMapping["Live Q&A with CNN Experts"] = "Live_QA_with_CNN_Experts";
  
  streamingMapping["Live Global Feeds"] = "Live_Global_Feeds";
  streamingMapping["Customized Local News"] = "Customized_Local_News";
  
  streamingMapping["Original Short-Form CNN Series"] = "Original_ShortForm_CNN_Series";
  streamingMapping["Original Short-Form CNN Series"] = "Original_ShortForm_CNN_Series";
  
  streamingMapping["Live Text Commentary from CNN Experts"] = "Live_Text_Commentary_from_CNN_Experts";
  streamingMapping["Interactive Video Companions"] = "Interactive_Video_Companions";
  streamingMapping["Interactive video companions"] = "Interactive_Video_Companions";
  
  streamingMapping["Real-Time News Ticker"] = "RealTime_News_Ticker";
  streamingMapping["Real-Time News Ticker"] = "RealTime_News_Ticker";
  
  streamingMapping["Exclusive, Subscriber-Only Events"] = "Exclusive_SubscriberOnly_Events";
  streamingMapping["Exclusive, Subscriber-Only Events"] = "Exclusive_SubscriberOnly_Events";
  streamingMapping["Exclusive"] = "Exclusive_SubscriberOnly_Events"; // Handle truncated UI name
  
  return { reader: readerMapping, streaming: streamingMapping };
};

// Create mapping from UI vertical names to data keys
const createVerticalMapping = () => {
  const verticalMapping: Record<string, string> = {};
  
  verticalMappingData.forEach((vertical) => {
    verticalMapping[vertical.Vertical_Name] = vertical.Vertical_Code;
  });
  
  return verticalMapping;
};

const featureMapping = createFeatureMapping();
const verticalMapping = createVerticalMapping();

/**
 * Convert UI feature name to respondent data key
 */
export function mapFeatureToDataKey(featureName: string, productType: 'reader' | 'streaming'): string {
  const mapping = featureMapping[productType][featureName];
  if (!mapping) {
    if (DEBUG_MODE) console.warn(`No mapping found for ${productType} feature: "${featureName}"`);
    // Fallback: create key from feature name
    return featureName
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .toLowerCase();
  }
  return mapping;
}

/**
 * Convert UI vertical name to respondent data key
 */
export function mapVerticalToDataKey(verticalName: string): string {
  const mapping = verticalMapping[verticalName];
  if (!mapping) {
    if (DEBUG_MODE) console.warn(`No mapping found for vertical: "${verticalName}"`);
    // Fallback: return original name
    return verticalName;
  }
  return mapping;
}

/**
 * Get all available feature mappings for debugging
 */
export function getFeatureMappings() {
  return featureMapping;
}

/**
 * Get all available vertical mappings for debugging
 */
export function getVerticalMappings() {
  return verticalMapping;
}

// Export the raw mapping data for debugging
export { featureMappingData, verticalMappingData };
