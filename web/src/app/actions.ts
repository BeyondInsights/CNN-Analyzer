'use server';

import { performSimulation } from '@/lib/calculations';
import { adminStorage } from '@/lib/firebaseAdmin';

export async function runSimulation(params: any) {
  const bucket = adminStorage.bucket();
  
  try {
    // Load respondent data with obfuscated name
    const respondentFile = bucket.file('data/c9d4e7f1.json'); // respondentProfile.json
    const [respondentData] = await respondentFile.download();
    const respondents = JSON.parse(respondentData.toString());
    
    // Load other data files (not obfuscated)
    const dataFiles: any = {};
    const files = [
      'readerFeatureDescriptions.json',
      'streamingFeatureDescriptions.json',
      'verticalDescriptions.json',
      'pricingRanges.json',
      'coreProductDescriptions.json'
    ];
    
    for (const fileName of files) {
      const file = bucket.file(`data/${fileName}`);
      const [contents] = await file.download();
      const key = fileName.replace('.json', '').replace('Descriptions', '');
      dataFiles[key] = JSON.parse(contents.toString());
    }
    
    // Run the actual simulation
    const results = performSimulation(
      respondents,
      params.products,
      params.simulationOptions || {},
      params.marketFactors,
      10000, // TAM
      {}, // drnData  
      params.reportType
    );
    
    return results;
  } catch (error: any) {
    console.error('Simulation error:', error);
    throw new Error(`Simulation failed: ${error.message}`);
  }
}
