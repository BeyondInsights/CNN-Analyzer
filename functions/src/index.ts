import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { computeTakeRates } from './calculations'; 
import {
  RespondentWithParams,
  RespondentUtilitiesMap
} from './types';

admin.initializeApp();

export const runSimulation = functions.https.onCall(async (data, /*context*/) => {
  // Authentication check (optional, can be re-enabled later)
  // if (!context.auth) {
  //   throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
  // }

  const {
    products, // This should be ProductSetupConfig[]
    marketFactors,
    simulationOptions,
    // reportType, // This would also be unused if its import is commented
    // outputType, // This would also be unused if its import is commented
  } = data;

  // Basic validation of incoming data
  if (!Array.isArray(products) || products.length === 0) {
    console.error('Validation Error: Products array is missing or empty.', products);
    throw new functions.https.HttpsError('invalid-argument', 'Products array is missing or empty.');
  }
  if (!marketFactors) {
    console.error('Validation Error: Market factors are missing.', marketFactors);
    throw new functions.https.HttpsError('invalid-argument', 'Market factors are missing.');
  }
  if (!simulationOptions) {
    console.error('Validation Error: Simulation options are missing.', simulationOptions);
    throw new functions.https.HttpsError('invalid-argument', 'Simulation options are missing.');
  }
  // You might want to add more specific validation for each parameter's structure

  try {
    const bucket = admin.storage().bucket(); // Get default storage bucket

    // --- Fetch Respondent Utilities Data from Firebase Storage ---
    const utilsFileLocationDocRef = admin.firestore().collection('SimulationData').doc('utilitiesFileLocation');
    const utilsFileLocationDoc = await utilsFileLocationDocRef.get();

    if (!utilsFileLocationDoc.exists) {
      console.error('Firestore document "SimulationData/utilitiesFileLocation" not found.');
      throw new functions.https.HttpsError('not-found', 'Configuration for utilities data file location is missing.');
    }
    const utilsFileLocationData = utilsFileLocationDoc.data();
    // CORRECTED: Check for 'filename' (lowercase n) to match Firestore screenshot
    if (!utilsFileLocationData || typeof utilsFileLocationData.filename !== 'string') { 
      console.error('"filename" field missing or not a string in "SimulationData/utilitiesFileLocation". Current data:', utilsFileLocationData);
      throw new functions.https.HttpsError('internal', 'Invalid configuration for utilities data file location.');
    }
    // CORRECTED: Use 'filename' (lowercase n)
    const utilitiesDataFileName = utilsFileLocationData.filename;
    console.log(`Attempting to download utilities file: ${utilitiesDataFileName}`);
    const utilitiesDataFile = bucket.file(utilitiesDataFileName);
    let utilitiesData: RespondentUtilitiesMap;
    try {
      const [utilsFileContents] = await utilitiesDataFile.download();
      utilitiesData = JSON.parse(utilsFileContents.toString('utf8'));
      console.log('Successfully downloaded and parsed utilities data.');
    } catch (error) {
      console.error(`Failed to download or parse utilities data file "${utilitiesDataFileName}" from Storage. Error:`, error);
      throw new functions.https.HttpsError('internal', `Error processing utilities data file from Storage: ${ (error as Error).message || 'Unknown error'}`);
    }
    if (!utilitiesData) { // Check if utilitiesData is null, undefined, or empty in a way that's invalid for your logic
        console.error('Utilities data from Storage is invalid or empty after parsing.');
        throw new functions.https.HttpsError('internal', 'Utilities data from Storage is not in the expected format.');
    }


    // --- Fetch Respondent Data from Firebase Storage ---
    const respDataFileLocationDocRef = admin.firestore().collection('SimulationData').doc('respondentDataFileLocation');
    const respDataFileLocationDoc = await respDataFileLocationDocRef.get();

    if (!respDataFileLocationDoc.exists) {
      console.error('Firestore document "SimulationData/respondentDataFileLocation" not found.');
      throw new functions.https.HttpsError('not-found', 'Configuration for respondent data file location is missing.');
    }
    const respDataFileLocationData = respDataFileLocationDoc.data();
    // CORRECTED: Check for 'filename' (lowercase n) to match potential similar issue
    if (!respDataFileLocationData || typeof respDataFileLocationData.filename !== 'string') { 
      console.error('"filename" field missing or not a string in "SimulationData/respondentDataFileLocation". Current data:', respDataFileLocationData);
      throw new functions.https.HttpsError('internal', 'Invalid configuration for respondent data file location.');
    }
    // CORRECTED: Use 'filename' (lowercase n)
    const respondentDataFileName = respDataFileLocationData.filename;
    console.log(`Attempting to download respondent data file: ${respondentDataFileName}`);
    const respondentDataFile = bucket.file(respondentDataFileName);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let respondentsRaw: {[key: string]: any}; // Expect an object with any structure initially
    let respondents: RespondentWithParams[];
    try {
      const [respFileContents] = await respondentDataFile.download();
      respondentsRaw = JSON.parse(respFileContents.toString('utf8'));
      console.log(`Successfully downloaded and parsed respondent data object. Number of keys: ${respondentsRaw ? Object.keys(respondentsRaw).length : 'N/A'}`);

      if (respondentsRaw && typeof respondentsRaw === 'object' && !Array.isArray(respondentsRaw)) {
        respondents = Object.entries(respondentsRaw).map(([id, rawParamData]) => {
          // Ensure rawParamData is an object before trying to destructure
          if (typeof rawParamData !== 'object' || rawParamData === null) {
            console.warn(`Skipping respondent ${id} due to invalid data format:`, rawParamData);
            return null; // Or throw an error, or handle as appropriate
          }

          const {
            respondentId, // This might be redundant if 'id' is used, but keep if present in data
            weight,
            cbc_version,
            drn, // Try to get drn
            base,
            price,
            verticals,
            verticalCount,
            subscription,
            features,
            featureCounts,
            gender, // Include demographic fields if they exist at this level
            ageGroup,
            ...other // Capture any other fields that might exist
          } = rawParamData;

          // Construct the RespondentWithParams object
          const respondent: RespondentWithParams = {
            respondentId: respondentId || id, // Use outer key 'id' if inner 'respondentId' is missing
            weight: typeof weight === 'number' ? weight : 1, // Default weight if missing/invalid
            cbc_version: typeof cbc_version === 'number' ? cbc_version : undefined,
            drn: typeof drn === 'number' ? Math.max(0.1, Math.min(0.99, drn)) : 0.5, // Default DRN to 0.5 and clamp
            individualParams: { // Nest the parameter fields
              base: base || {},
              price: price || { linear: 0, squared: 0 },
              verticals: verticals || {},
              verticalCount: verticalCount || {},
              subscription: subscription || {},
              features: features || {},
              featureCounts: featureCounts || {}
            },
            gender: typeof gender === 'string' ? gender : undefined,
            ageGroup: typeof ageGroup === 'string' ? ageGroup : undefined,
            ...other // Spread any other captured properties
          };
          return respondent;
        }).filter(r => r !== null) as RespondentWithParams[]; // Filter out any nulls from bad data

        console.log(`Converted respondent data object to array with nested params. Number of respondents: ${respondents.length}`);
        if (respondents.length > 0) {
            console.log('Sample of first processed respondent:', JSON.stringify(respondents[0], null, 2));
        }

      } else if (Array.isArray(respondentsRaw)) {
        // This path assumes the array elements are already correctly structured.
        // If not, similar mapping logic would be needed here.
        console.warn('Respondent data from storage was already an array. Assuming correct structure.');
        respondents = respondentsRaw as RespondentWithParams[];
      } else {
        console.error('Parsed respondent data is not an object or array:', respondentsRaw);
        throw new functions.https.HttpsError('internal', 'Respondent data from Storage is not in a convertible format.');
      }

    } catch (error) {
      console.error(`Failed to download or parse respondent data file "${respondentDataFileName}" from Storage. Error:`, error);
      throw new functions.https.HttpsError('internal', `Error processing respondent data file from Storage: ${ (error as Error).message || 'Unknown error'}`);
    }
    if (!Array.isArray(respondents)) {
      console.error(`Parsed respondent data from Storage file "${respondentDataFileName}" is NOT an array. Actual type:`, typeof respondents, 'Original raw type was:', typeof respondentsRaw);
      throw new functions.https.HttpsError('internal', 'Respondent data from Storage is not in the expected list format.');
    }
    if (respondents.length === 0) {
        console.warn('Warning: Respondent data from Storage is an empty array.');
        // Depending on your logic, an empty array might be an error or just lead to no results.
        // If it's an error, throw:
        // throw new functions.https.HttpsError('internal', 'Respondent data from Storage is empty.');
    }


    // --- Run Simulation ---
    console.log(
      `Calling computeTakeRates with ${products.length} products, ` +
      `${respondents ? respondents.length : 'N/A'} respondents, ` +
      `and ${utilitiesData ? Object.keys(utilitiesData).length : 'N/A'} utility entries.`
    );

    // CRITICAL FIX: Pass respondents (RespondentWithParams[]) as the first argument,
    // and products (ProductSetupConfig[]) as the second argument.
    // The utilitiesData is used internally by computeTakeRates if it's designed to fetch/merge it,
    // or it needs to be merged with respondents before calling.
    // For now, assuming computeTakeRates can handle respondents and products directly.
    // If computeTakeRates needs utilitiesData explicitly, its signature and logic will need adjustment.

    const simulationResults = computeTakeRates(
      respondents, // Corrected: This should be the respondent data
      products,    // Corrected: This is the product configuration
      simulationOptions,
      marketFactors
      // TAM (Total Addressable Market) is optional in computeTakeRates, defaults to 50,000,000
    );

    console.log('Simulation completed successfully.');

    return simulationResults;

  } catch (error) {
    console.error('Critical error in runSimulation function:', error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    // Log the full error for unexpected issues
    console.error('Original error details for unexpected error:', (error as Error).message, (error as Error).stack); 
    throw new functions.https.HttpsError('internal', `An unexpected error occurred during simulation. Check function logs. Message: ${ (error as Error).message || 'No error message available'}`);
  }
});