// Server-side data loader for Firebase Storage
// Uses direct HTTP access to Firebase Storage with public URLs

interface DataFiles {
  respondentUtilities: any[];
  demographics: any[];
  modelParameters: any[];
  drnRates: any[];
}

let serverDataCache: DataFiles | null = null;
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
let cacheTimestamp = 0;

// Firebase Storage base URL for public files
const STORAGE_BASE_URL = `https://firebasestorage.googleapis.com/v0/b/${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.firebasestorage.app/o`;

export async function loadServerData(): Promise<DataFiles> {
  // Check cache first
  if (serverDataCache && (Date.now() - cacheTimestamp) < CACHE_DURATION) {
    return serverDataCache;
  }

  try {
    console.log('Loading data from Firebase Storage...');
    
    // Load required data files
    const filePromises = [
      loadFileFromStorage('data%2Fa7b9c2d1.json'),
      loadFileFromStorage('data%2Fc9d4e7f1.json'),
      loadFileFromStorage('data%2FmodelParameters.json'),
      loadFileFromStorage('data%2FdrnRates.json')
    ];

    const [respondentUtilities, demographics, modelParameters, drnRates] = await Promise.all(filePromises);

    const data: DataFiles = {
      respondentUtilities,
      demographics,
      modelParameters,
      drnRates
    };

    // Cache the data
    serverDataCache = data;
    cacheTimestamp = Date.now();
    
    console.log('Successfully loaded data from Firebase Storage');
    return data;

  } catch (error) {
    console.error('Failed to load data from Firebase Storage:', error);
    throw new Error('Could not load required data files from Firebase Storage');
  }
}

async function loadFileFromStorage(encodedFilePath: string): Promise<any> {
  try {
    const url = `${STORAGE_BASE_URL}/${encodedFilePath}?alt=media`;
    console.log(`Loading ${encodedFilePath} from Firebase Storage...`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const text = await response.text();
    const data = JSON.parse(text);
    console.log(`Successfully loaded ${encodedFilePath}, ${Array.isArray(data) ? data.length : 'object'} records`);
    return data;
  } catch (error) {
    console.error(`Failed to load ${encodedFilePath}:`, error);
    throw error;
  }
}
