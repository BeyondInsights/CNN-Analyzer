// Local data loader - no Firebase needed
import respondentUtilities from '@/data/respondentUtilities.json';
import respondentProfile from '@/data/respondentProfile.json';
import modelParameters from '@/data/modelParameters.json';
import drnRates from '@/data/drnRates.json';

export interface DataFiles {
  respondentUtilities: any[];
  respondentProfile: any[];
  modelParameters: any[];
  drnRates: any;
}

export async function loadLocalData(): Promise<DataFiles> {
  console.log('[LocalDataLoader] Loading data from JSON files...');
  
  // Data is already loaded via imports
  const data = {
    respondentUtilities: respondentUtilities as any[],
    respondentProfile: respondentProfile as any[],
    modelParameters: modelParameters as any[],
    drnRates: drnRates
  };
  
  console.log('[LocalDataLoader] Loaded:', {
    respondents: data.respondentUtilities.length,
    profiles: data.respondentProfile.length,
    parameters: data.modelParameters.length
  });
  
  return data;
}
