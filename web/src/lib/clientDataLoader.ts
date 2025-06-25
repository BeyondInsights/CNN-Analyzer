// Client-side data loader for authenticated Firebase Storage access
import { getDownloadURL, ref } from 'firebase/storage';
import { storage } from './firebaseClient';

interface DataFiles {
  respondentUtilities: any[];
  demographics: any[];
  modelParameters: any[];
  drnRates: any[];
}

let clientDataCache: DataFiles | null = null;
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
let cacheTimestamp = 0;

export async function loadClientData(): Promise<DataFiles> {
  // Check cache first
  if (clientDataCache && (Date.now() - cacheTimestamp) < CACHE_DURATION) {
    console.log('Using cached data...');
    return clientDataCache;
  }

  try {
    console.log('Loading data from Firebase Storage (client-side)...');
    
    // Load required data files using client SDK with authentication
    const filePromises = [
      loadFileFromStorageClient('data/a7b9c2d1.json'),
      loadFileFromStorageClient('data/c9d4e7f1.json'),
      loadFileFromStorageClient('data/modelParameters.json'),
      loadFileFromStorageClient('data/drnRates.json')
    ];

    const [respondentUtilities, demographics, modelParameters, drnRates] = await Promise.all(filePromises);

    const data: DataFiles = {
      respondentUtilities,
      demographics,
      modelParameters,
      drnRates
    };

    // Cache the data
    clientDataCache = data;
    cacheTimestamp = Date.now();
    
    console.log('Successfully loaded data from Firebase Storage (client-side)');
    return data;

  } catch (error) {
    console.error('Failed to load data from Firebase Storage (client-side):', error);
    throw new Error('Could not load required data files from Firebase Storage. Make sure you are authenticated.');
  }
}

async function loadFileFromStorageClient(filePath: string): Promise<any> {
  try {
    console.log(`Loading ${filePath} from Firebase Storage (client-side)...`);
    
    // Get download URL using client SDK (requires authentication)
    const fileRef = ref(storage, filePath);
    const downloadURL = await getDownloadURL(fileRef);
    
    // Fetch the file content
    const response = await fetch(downloadURL);
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`Successfully loaded ${filePath}, ${Array.isArray(data) ? data.length : 'object'} records`);
    return data;
  } catch (error) {
    console.error(`Failed to load ${filePath}:`, error);
    if (error instanceof Error && error.message.includes('unauthorized')) {
      throw new Error(`Access denied to ${filePath}. Please ensure you are logged in.`);
    }
    throw error;
  }
}

// Clear cache when user logs out
export function clearDataCache() {
  clientDataCache = null;
  cacheTimestamp = 0;
  console.log('Data cache cleared');
}
