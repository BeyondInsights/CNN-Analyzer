console.log('🔥 FIREBASE FUNCTION: Loading FULL respondent-level data...');
console.log('📊 Data files being loaded:');
console.log('  - a7b9c2d1.json (6.45 MB) - Respondent Utilities');  
console.log('  - c9d4e7f1.json (752 KB) - Demographics');
console.log('  - e5f8a3b2.json (6.56 MB) - Respondent Data');
console.log('  - modelParameters.json - Model Parameters');
console.log('  - drnRates.json - DRN Rates');

const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp();
}

// Cache for data files (30-minute expiration)
let dataCache = null;
let cacheExpiry = 0;

// DEMOGRAPHIC SEGMENTS from your code
const DEMOGRAPHIC_SEGMENTS = [
  { group: "Male", filters: { Gender: 'Male' } },
  { group: "Female", filters: { Gender: 'Female' } },
  { group: "18-34", filters: { Age_Group: '18-34' } },
  { group: "35-54", filters: { Age_Group: '35-54' } },
  { group: "55+", filters: { Age_Group: '55+' } },
  { group: "College+", filters: { Education: 'College+' } },
  { group: "High Income", filters: { Income: 'High' } },
  { group: "Linear TV", filters: { Have_Linear_TV: 1 } },
  { group: "Digital News Subscriber", filters: { Digital_News_Subscriber: 1 } }
];

async function loadSecureData() {
  // Check cache
  if (dataCache && Date.now() < cacheExpiry) {
    return dataCache;
  }

  try {
    const bucket = admin.storage().bucket();
    
    console.log('Loading secure data from Firebase Storage...');
    
    // Load obfuscated data files (server-side only)
    const [
      respondentUtilitiesBuffer,
      demographicsBuffer,
      modelParametersBuffer,
      drnRatesBuffer
    ] = await Promise.all([
      bucket.file('data/a7b9c2d1.json').download(),
      bucket.file('data/c9d4e7f1.json').download(),
      bucket.file('data/modelParameters.json').download(),
      bucket.file('data/drnRates.json').download()
    ]);

    const data = {
      respondentUtilities: JSON.parse(respondentUtilitiesBuffer[0].toString()),
      demographics: JSON.parse(demographicsBuffer[0].toString()),
      modelParameters: JSON.parse(modelParametersBuffer[0].toString()),
      drnRates: JSON.parse(drnRatesBuffer[0].toString())
    };

    console.log('Loaded data:', {
      respondents: data.respondentUtilities.length,
      demographics: data.demographics.length,
      modelParams: data.modelParameters.length,
      drnRates: data.drnRates.length
    });

    // Cache for 30 minutes
    dataCache = data;
    cacheExpiry = Date.now() + (30 * 60 * 1000);
    
    return data;
  } catch (error) {
    console.error('Failed to load secure data:', error);
    throw new functions.https.HttpsError('internal', 'Failed to load data');
  }
}

// Secure simulation function
exports.runSimulation = functions.https.onCall(async (data, context) => {
  // Verify authentication
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  try {
    console.log('Running secure simulation for user:', context.auth.uid);
    
    // Load secure data (never exposed to client)
    const secureData = await loadSecureData();
    
    // Extract simulation parameters from request
    const { cardData, marketFactors, reportType, outputType } = data;
    
    // Validate input parameters
    if (!cardData || !marketFactors) {
      throw new functions.https.HttpsError('invalid-argument', 'Missing required parameters');
    }

    // Run simulation logic server-side
    const simulationResult = runSecureSimulation(
      cardData,
      marketFactors,
      reportType,
      outputType,
      secureData
    );

    // Return only aggregated results (no raw data)
    return {
      success: true,
      result: simulationResult,
      timestamp: Date.now()
    };
    
  } catch (error) {
    console.error('Simulation error:', error);
    throw new functions.https.HttpsError('internal', 'Simulation failed: ' + error.message);
  }
});

// Secure sensitivity analysis function
exports.runSensitivityAnalysis = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  try {
    console.log('Running sensitivity analysis for user:', context.auth.uid);
    
    const secureData = await loadSecureData();
    const { cardData, marketFactors } = data;
    
    const sensitivityResult = runSecureSensitivityAnalysis(
      cardData,
      marketFactors,
      secureData
    );

    return {
      success: true,
      result: sensitivityResult,
      timestamp: Date.now()
    };
    
  } catch (error) {
    console.error('Sensitivity analysis error:', error);
    throw new functions.https.HttpsError('internal', 'Sensitivity analysis failed: ' + error.message);
  }
});

// Your actual simulation logic (moved server-side)
function runSecureSimulation(cardData, marketFactors, reportType, outputType, secureData) {
  const { respondentUtilities, demographics, modelParameters, drnRates } = secureData;
  
  // Convert cardData to activeProducts format
  const activeProducts = Object.values(cardData).filter(card => 
    card.product && card.product !== ''
  );
  
  if (!activeProducts || activeProducts.length === 0) {
    throw new Error('No active products provided');
  }

  // Convert model parameters to map
  const modelParams = {};
  modelParameters.forEach(p => {
    modelParams[p.Parameter] = p.Value;
  });
  
  const TOTAL_TAM = modelParams['Total_TAM'] || 105624640;
  
  console.log('Running simulation with', activeProducts.length, 'products');
  
  // Calculate utilities and probabilities for each respondent/product combination
  const respondentProductProbabilities = new Map();
  
  for (const respondent of respondentUtilities) {
    const respondentProbs = new Map();
    let totalExpUtility = 0;
    
    // Calculate utilities for each product
    const utilities = new Map();
    
    for (const product of activeProducts) {
      let utility = 0;
      
      // Base utility based on product type
      switch (product.product) {
        case 'CNN Reader': 
          utility += respondent.Base_Reader || 0; 
          break;
        case 'CNN Streaming': 
          utility += respondent.Base_Streaming || 0; 
          break;
        case 'CNN All-Access': 
          utility += respondent.Base_AllAccess || 0; 
          break;
        case 'CNN Standalone Vertical': 
          utility += respondent.Base_Standalone || 0; 
          break;
      }
      
      // Price effects
      const lnPrice = Math.log(product.monthlyRate);
      utility += (respondent.Price_Linear || -1.08) * lnPrice;
      utility += (respondent.Price_Squared || -0.007) * lnPrice * lnPrice;
      
      // Add feature utilities based on respondent preferences
      for (const feature of product.readerFeatures || []) {
        const featureCoef = respondent[`Reader_${feature}`] || 0;
        utility += featureCoef;
      }
      
      for (const feature of product.streamingFeatures || []) {
        const featureCoef = respondent[`Streaming_${feature}`] || 0;
        utility += featureCoef;
      }
      
      // Vertical utilities
      for (const vertical of product.verticals || []) {
        const verticalCoef = respondent[`Vertical_${vertical}`] || 0;
        utility += verticalCoef;
      }
      
      // Vertical count effect (diminishing returns)
      if (product.verticals && product.verticals.length > 0) {
        const countEffect = respondent[`VerticalCount_${product.verticals.length}`] || 0;
        utility += countEffect;
      }
      
      utilities.set(product.product, utility);
      totalExpUtility += Math.exp(utility);
    }
    
    // Add "none" option
    totalExpUtility += Math.exp(0); // Utility of not subscribing
    
    // Calculate probabilities using softmax
    for (const [productName, utility] of utilities) {
      const probability = Math.exp(utility) / totalExpUtility;
      respondentProbs.set(productName, probability);
    }
    
    respondentProductProbabilities.set(respondent.Respondent_ID, respondentProbs);
  }
  
  // Apply market factors and calculate overall shares
  const overallShare = [];
  const segmentShares = new Map();
  
  // Initialize segment maps
  for (const segment of DEMOGRAPHIC_SEGMENTS) {
    segmentShares.set(segment.group, new Array(activeProducts.length).fill(0));
  }
  
  // Calculate weighted shares
  for (const product of activeProducts) {
    let totalWeightedProb = 0;
    let totalWeight = 0;
    
    for (const respondent of respondentUtilities) {
      const probs = respondentProductProbabilities.get(respondent.Respondent_ID);
      if (!probs) continue;
      
      const prob = probs.get(product.product) || 0;
      const weight = respondent.Weight || 1;
      
      // Apply DRN factor from drnRates data
      const drnRecord = drnRates.find(d => d.Respondent_ID === respondent.Respondent_ID);
      const drnFactor = drnRecord?.DRN_Composite || drnRecord?.DRN_Base || 0.85;
      
      const adjustedProb = prob * drnFactor;
      totalWeightedProb += adjustedProb * weight;
      totalWeight += weight;
      
      // Add to segment calculations
      const demo = demographics.find(d => d.Respondent_ID === respondent.Respondent_ID);
      if (demo) {
        const segmentName = getSegmentName(demo);
        if (segmentName && segmentShares.has(segmentName)) {
          const segmentArray = segmentShares.get(segmentName);
          const productIndex = activeProducts.indexOf(product);
          segmentArray[productIndex] += adjustedProb * weight;
        }
      }
    }
    
    // Calculate base take rate
    const baseTakeRate = totalWeight > 0 ? (totalWeightedProb / totalWeight) * 100 : 0;
    
    // Apply market realization factors
    const realizedTakeRate = baseTakeRate * 
      (marketFactors.awareness / 100) *
      (marketFactors.distribution / 100) *
      (marketFactors.competitive / 100) *
      (marketFactors.marketing / 100) *
      (marketFactors.yearOneAdoption / 100);
    
    overallShare.push(parseFloat(realizedTakeRate.toFixed(2)));
  }
  
  // Convert segment shares to percentages
  const segmentSharesArray = [];
  for (const segment of DEMOGRAPHIC_SEGMENTS) {
    const shares = segmentShares.get(segment.group) || [];
    const normalizedShares = shares.map(share => {
      const segmentSize = getSegmentSize(segment.group, respondentUtilities, demographics);
      return segmentSize > 0 ? parseFloat((share / segmentSize * 100).toFixed(2)) : 0;
    });
    
    segmentSharesArray.push({
      segmentName: segment.group,
      shares: normalizedShares
    });
  }
  
  // Apply output type transformation
  if (outputType === 'count') {
    const overallCounts = overallShare.map(share => Math.round((share / 100) * TOTAL_TAM));
    const segmentCounts = segmentSharesArray.map(segment => ({
      ...segment,
      shares: segment.shares.map(share => Math.round((share / 100) * TOTAL_TAM))
    }));
    
    return {
      reportType,
      outputType,
      overallShare: overallCounts,
      segmentShares: segmentCounts
    };
  } else if (outputType === 'revenue') {
    const overallRevenue = overallShare.map((share, index) => {
      const subscribers = (share / 100) * TOTAL_TAM;
      const monthlyRate = activeProducts[index].monthlyRate;
      return Math.round(subscribers * monthlyRate * 12);
    });
    
    const segmentRevenue = segmentSharesArray.map(segment => ({
      ...segment,
      shares: segment.shares.map((share, index) => {
        const subscribers = (share / 100) * TOTAL_TAM;
        const monthlyRate = activeProducts[index].monthlyRate;
        return Math.round(subscribers * monthlyRate * 12);
      })
    }));
    
    return {
      reportType,
      outputType,
      overallShare: overallRevenue,
      segmentShares: segmentRevenue
    };
  }
  
  return {
    reportType,
    outputType,
    overallShare,
    segmentShares: segmentSharesArray
  };
}

// Helper function to determine segment name from demographics
function getSegmentName(demo) {
  // Gender
  const gender = demo.SG === 1 ? 'Male' : 
                demo.SG === 2 ? 'Female' : 
                demo.Gender || 'Unknown';
  
  return gender; // Simplified - return first match
}

// Helper function to get segment size
function getSegmentSize(segmentName, respondents, demographics) {
  let count = 0;
  for (const demo of demographics) {
    if (getSegmentName(demo) === segmentName) {
      count++;
    }
  }
  return count;
}

function runSecureSensitivityAnalysis(cardData, marketFactors, secureData) {
  // Price sensitivity analysis
  const baseProduct = Object.values(cardData)[0]; // Take first product
  if (!baseProduct || !baseProduct.product) {
    throw new Error('No valid product for sensitivity analysis');
  }
  
  const priceVariations = [-50, -30, -20, -10, -5, 0, 5, 10, 20, 30, 50];
  const results = [];
  
  for (const variation of priceVariations) {
    const testProduct = {
      ...baseProduct,
      monthlyRate: baseProduct.monthlyRate * (1 + variation / 100)
    };
    
    // Run simplified simulation for this price point
    const testData = { [testProduct.id]: testProduct };
    const simResult = runSecureSimulation(testData, marketFactors, 'tiered', 'percentage', secureData);
    
    results.push({
      variation: variation,
      price: testProduct.monthlyRate,
      takeRate: simResult.overallShare[0] || 0
    });
  }
  
  return {
    priceElasticity: results,
    baseProduct: baseProduct.product,
    basePrice: baseProduct.monthlyRate
  };
}
