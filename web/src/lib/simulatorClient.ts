import { storage } from './firebaseClient';
import { ref, getDownloadURL } from 'firebase/storage';

let dataCache: any = null;

export async function loadDataFromStorage() {
  if (dataCache) return dataCache;

  try {
    // Add safety check for storage
    if (!storage) {
      console.error('Firebase Storage not initialized');
      return getDefaultData();
    }

    const files = {
      readerFeatures: 'data/readerFeatureDescriptions.json',
      streamingFeatures: 'data/streamingFeatureDescriptions.json',
      verticals: 'data/verticalDescriptions.json',
      pricing: 'data/pricingRanges.json',
      coreProducts: 'data/coreProductDescriptions.json'
    };

    const promises = Object.entries(files).map(async ([key, path]) => {
      try {
        const fileRef = ref(storage, path);
        const url = await getDownloadURL(fileRef);
        const response = await fetch(url);
        const data = await response.json();
        return { key, data };
      } catch (error) {
        console.error(`Failed to load ${key}:`, error);
        return { key, data: {} };
      }
    });

    const results = await Promise.all(promises);
    
    const loadedData: any = {};
    results.forEach(({ key, data }) => {
      loadedData[key] = data;
    });

    dataCache = loadedData;
    return dataCache;
  } catch (error) {
    console.error('Failed to load data from Firebase Storage:', error);
    return getDefaultData();
  }
}

function getDefaultData() {
  return {
    readerFeatures: {},
    streamingFeatures: {},
    verticals: {},
    pricing: {},
    coreProducts: {}
  };
}
