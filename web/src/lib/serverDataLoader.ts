// Server-side data loader for Firebase Storage
import { adminStorage } from './firebaseAdmin';

interface DataFiles {
  respondentUtilities: any[];
  demographics: any[];
  modelParameters: any[];
  drnRates: any[];
}

let serverDataCache: DataFiles | null = null;
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
let cacheTimestamp = 0;

export async function loadServerData(): Promise<DataFiles> {
  // Check cache first
  if (serverDataCache && (Date.now() - cacheTimestamp) < CACHE_DURATION) {
    return serverDataCache;
  }

  try {
    console.log('Loading data from Firebase Storage...');
    
    const bucket = adminStorage.bucket();
    
    // Load required data files
    const filePromises = [
      loadFileFromStorage(bucket, 'data/a7b9c2d1.json'),
      loadFileFromStorage(bucket, 'data/c9d4e7f1.json'),
      loadFileFromStorage(bucket, 'data/modelParameters.json'),
      loadFileFromStorage(bucket, 'data/drnRates.json')
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

async function loadFileFromStorage(bucket: any, filePath: string): Promise<any> {
  try {
    console.log(`Loading ${filePath} from Firebase Storage...`);
    const file = bucket.file(filePath);
    
    // Check if file exists
    const [exists] = await file.exists();
    if (!exists) {
      throw new Error(`File ${filePath} does not exist in Firebase Storage`);
    }
    
    const [contents] = await file.download();
    const data = JSON.parse(contents.toString());
    console.log(`Successfully loaded ${filePath}, ${Array.isArray(data) ? data.length : 'object'} records`);
    return data;
  } catch (error) {
    console.error(`Failed to load ${filePath}:`, error);
    throw error;
  }
}
