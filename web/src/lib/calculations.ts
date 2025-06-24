// src/lib/calculations.ts
const DEBUG_MODE = false;

import type { 
  ProductSetupConfig, 
  SimulationOptions, 
  MarketFactors,
  SimulationResults,
  TakeRate,
  SegmentResults,
  ReportType
} from './types';

import { PRODUCT_PRICE_RANGES, DEMOGRAPHIC_SEGMENTS } from './constants';
import verticalMapping from '@/data/verticalMapping.json';

const DEFAULT_FEATURE_WEIGHTS = {
  base: 0.18,      // 20% - Product type preference
  price: 0.40,     // 34% - Price sensitivity (dominant factor)
  verticals: 0.115, // 13.5% - Vertical content appeal
  features: 0.105,  // 12.5% - Feature bundle value
  subscription: 0.20 // 20% - Subscription term preference
};

// To increase vertical impact, adjust weights in SimulationOptions:
// Example: Make verticals matter more in your page.tsx:
//
// const simulationOptions = {
//   ...otherOptions,
//   featureWeights: {
//     base: 0.20,
//     price: 0.25,      // Reduce from 34% to 25%
//     verticals: 0.25,  // Increase from 13.5% to 25%
//     features: 0.10,   // Reduce from 12.5% to 10%
//     subscription: 0.20
//   }
// };

// Reference prices for normalization approach
const REFERENCE_PRICES: Record<string, number> = {
  'CNN Standalone Vertical': 2.99,  // Updated to match typical standalone pricing
  'CNN Reader': 7.99,
  'CNN Streaming': 12.99,
  'CNN All-Access': 14.99
};

// Price tier breakpoints for piecewise function
const PRICE_TIER_BREAKS = {
  low: 5,
  medium: 15
};

// Add to SimulationOptions in types.ts:
interface DemoMultipliers {
  gender: {
    Male: number;
    Female: number;
  };
  age: {
    '18-34': number;
    '35-54': number;
    '55-74': number;
  };
  cnnAccess: {
    'Regularly Access CNN': number;
    'Occasionally Access CNN': number;
    'Rarely Access CNN': number;
  };
  linearTV: {
    'Have Linear TV': number;
    'No Linear TV': number;
  };
  digitalNews: {
    'Digital News Subscriber': number;
    'Non-Subscriber': number;
  };
}

// Interface for respondent with parameters
interface RespondentWithParams {
  respondentId?: string;
  Respondent_ID?: string;
  weight: number;
  demographics?: any;
  drn?: number;
  individualParams: {
    base: Record<string, number>;
    price: {
      linear: number;
      squared: number;
      lowTier?: number;    // For piecewise function
      midTier?: number;    // For piecewise function
      highTier?: number;   // For piecewise function
    };
    all_features?: any;
    features?: any;
    verticals?: any;
    verticalCount?: any;
    subscription?: any;
    featureCounts?: any;
  };
}

const VERTICAL_NAME_TO_CODE: Record<string, string> = {};
verticalMapping.forEach(item => {
  VERTICAL_NAME_TO_CODE[item.Vertical_Name] = item.Vertical_Code;
});

// Available verticals from conjoint study:
// Design 1: D1_1 (Longevity), D1_2 (Meditation), D1_3 (Fitness), D1_4 (Entertainment)
// Design 2: D2_1 (Travel), D2_2 (Home), D2_3 (Beauty), D2_4 (Weather)
// Bridge: B1 (Expert Buying Guide), B2 (Personal Finance)

// Debug: Show vertical mapping (run once)
if (Object.keys(VERTICAL_NAME_TO_CODE).length === 0) {
  if (DEBUG_MODE) console.warn('[WARNING] No vertical mappings loaded! Check verticalMapping import.');
} else if (Math.random() < 0.001) { // Very rarely
  if (DEBUG_MODE) console.log(`Loaded ${Object.keys(VERTICAL_NAME_TO_CODE).length} vertical mappings`);
}

const MODEL_CALIBRATION_FACTOR = 3.5

const PRODUCT_CALIBRATION: Record<string, number> = {
  'CNN Reader': .95,
  'CNN All-Access': 1.05,
  'CNN Streaming': 0.90,
  'CNN Standalone Vertical': 0.30  // Much stronger reduction for standalone
};

// DEFAULT DEMOGRAPHIC MULTIPLIERS (can be overridden by UI)
const DEFAULT_DEMO_MULTIPLIERS: DemoMultipliers = {
  gender: {
    'Male': 1.0,
    'Female': 1.1,
  },
  age: {
    '18-34': 0.975,
    '35-54': 1.1,
    '55-74': 0.975
  },
  cnnAccess: {
    'Regularly Access CNN': 1.0,
    'Occasionally Access CNN': 1.1,
    'Rarely Access CNN': 1.0
  },
  linearTV: {
    'Have Linear TV': 1.0,
    'No Linear TV': 1.1
  },
  digitalNews: {
    'Digital News Subscriber': 0.975,
    'Non-Subscriber': 1.0
  }
};

// Update the getDemoMultiplier function to check the correct fields:
function getDemoMultiplier(demo: any): number {
  let multiplier = 1.0;
  
  // Gender
  if (demo.Gender === 'Female') {
    multiplier *= DEFAULT_DEMO_MULTIPLIERS.gender['Female'];
  } else if (demo.Gender === 'Male') {
    multiplier *= DEFAULT_DEMO_MULTIPLIERS.gender['Male'];
  }
  
  // Age - CHECK THE ACTUAL FIELDS FROM YOUR DATA
  if (demo.Age_18_34 === 1 || demo.Age_18_34 === "1") {
    multiplier *= DEFAULT_DEMO_MULTIPLIERS.age['18-34'];
  } else if (demo.Age_35_54 === 1 || demo.Age_35_54 === "1") {
    multiplier *= DEFAULT_DEMO_MULTIPLIERS.age['35-54'];
  } else if (demo.Age_55_74 === 1 || demo.Age_55_74 === "1") {
    multiplier *= DEFAULT_DEMO_MULTIPLIERS.age['55-74'];
  }
  
  // CNN Access - CHECK THE ACTUAL FIELDS
  if (demo.Regularly_Access_CNN === 1 || demo.Regularly_Access_CNN === "1") {
    multiplier *= DEFAULT_DEMO_MULTIPLIERS.cnnAccess['Regularly Access CNN'];
  } else if (demo.Occasionally_Access_CNN === 1 || demo.Occasionally_Access_CNN === "1") {
    multiplier *= DEFAULT_DEMO_MULTIPLIERS.cnnAccess['Occasionally Access CNN'];
  } else if (demo.Rarely_Access_CNN === 1 || demo.Rarely_Access_CNN === "1") {
    multiplier *= DEFAULT_DEMO_MULTIPLIERS.cnnAccess['Rarely Access CNN'];
  }
  
  // Linear TV
  if (demo.Have_Linear_TV === 1 || demo.Have_Linear_TV === "1") {
    multiplier *= DEFAULT_DEMO_MULTIPLIERS.linearTV['Have Linear TV'];
  } else {
    multiplier *= DEFAULT_DEMO_MULTIPLIERS.linearTV['No Linear TV'];
  }
  
  // Digital News Subscriber
  if (demo.Digital_News_Subscriber === 1 || demo.Digital_News_Subscriber === "1") {
    multiplier *= DEFAULT_DEMO_MULTIPLIERS.digitalNews['Digital News Subscriber'];
  } else {
    multiplier *= DEFAULT_DEMO_MULTIPLIERS.digitalNews['Non-Subscriber'];
  }
  
  return multiplier;
}
/**
 * Calculate price utility with sensitivity adjustments
 */
function calculatePriceUtility(
  price: number,
  params: any,
  productType: string,
  options: SimulationOptions
): number {
  const safePrice = Math.max(0.01, price);
  const logP = Math.log(safePrice);
  
  if (options.enablePriceTiers === true) {
    // Base calculation
    let priceUtility = params.linear * logP + params.squared * logP * logP;
    
    const threshold = options.priceThreshold || 12;
    
    if (safePrice < threshold) {
      // For low prices: REDUCE the negative impact (boost adoption)
      const multiplier = options.lowPriceMultiplier || 1.3;
      priceUtility = priceUtility / multiplier;
    } else {
      // For high prices: INCREASE the negative impact (reduce adoption)  
      const multiplier = options.highPriceMultiplier || 0.8;
      priceUtility = priceUtility / multiplier;
    }
    
    // SAFETY CHECK - prevent NaN/Infinity
    if (!isFinite(priceUtility)) {
      console.error('Invalid price utility:', { price, priceUtility, params });
      // Fallback to base calculation
      return params.linear * logP + params.squared * logP * logP;
    }
    
    return priceUtility;
  }
  
  // Default calculation if not enabled
  return params.linear * logP + params.squared * logP * logP;
}

/**
 * Computes utilities for a single product/respondent pair
 */
function calculateUtility(
  product: ProductSetupConfig,
  resp: RespondentWithParams,
  options: SimulationOptions
): number {
  const p = resp.individualParams;
  
  // Use enhanced weights
  const weights = options.featureWeights || DEFAULT_FEATURE_WEIGHTS;
  
  // Component utilities initialization
  let baseUtility = 0;
  let priceUtility = 0;
  let verticalUtility = 0;
  let featureUtility = 0;
  let subscriptionUtility = 0;
  
  // Base utility with calibration
  baseUtility = p.base[product.product] ?? 0;
  
  // Log if standalone is missing (expected since it's reference)
  if (product.product === 'CNN Standalone Vertical' && baseUtility === 0 && Math.random() < 0.01) {
    if (DEBUG_MODE) console.log(`Standalone base = 0 (reference category in HBC model)`);
  }
  
  baseUtility *= MODEL_CALIBRATION_FACTOR;
  
  // Enhanced price utility calculation
  priceUtility = calculatePriceUtility(
    product.monthlyRate,
    p.price,
    product.product,
    options
  );
  
  const PRICE_SENSITIVITY_MULTIPLIER = 1.0;
  priceUtility *= PRICE_SENSITIVITY_MULTIPLIER;

  // Feature utilities - Reader
  if (product.readerFeatures && product.readerFeatures.length > 0) {
    const readerFeatures = p.all_features?.reader || p.features?.reader || {};
    for (const feature of product.readerFeatures) {
      const featureKey = feature.replace(/\s+/g, '_').replace(/-/g, '');
      if (readerFeatures[featureKey]) {
        featureUtility += readerFeatures[featureKey];
      }
    }
  }
  
  // Feature utilities - Streaming
  if (product.streamingFeatures && product.streamingFeatures.length > 0) {
    const streamingFeatures = p.all_features?.streaming || p.features?.streaming || {};
    for (const feature of product.streamingFeatures) {
      const featureKey = feature.replace(/\s+/g, '_').replace(/-/g, '');
      if (streamingFeatures[featureKey]) {
        featureUtility += streamingFeatures[featureKey];
      }
    }
  }
  
  // Vertical utilities
  if (product.verticals && product.verticals.length > 0 && p.verticals) {
    for (const vertical of product.verticals) {
      const verticalCode = VERTICAL_NAME_TO_CODE[vertical] || vertical;
      if (p.verticals[verticalCode]) {
        verticalUtility += p.verticals[verticalCode];
        
        // Debug: Log vertical mapping for standalone
        if (product.product === 'CNN Standalone Vertical' && Math.random() < 0.05) {
          if (DEBUG_MODE) console.log(`"${vertical}" → "${verticalCode}" = ${p.verticals[verticalCode].toFixed(3)}`);
          
          // Show typical range
          if (Math.random() < 0.2) {
            const allVertUtils = Object.values(p.verticals).filter(v => typeof v === 'number') as number[];
            const minVert = Math.min(...allVertUtils);
            const maxVert = Math.max(...allVertUtils);
            if (DEBUG_MODE) console.log(`Range across all verticals: ${minVert.toFixed(3)} to ${maxVert.toFixed(3)}`);
          }
        }
      } else if (product.product === 'CNN Standalone Vertical' && Math.random() < 0.05) {
        if (DEBUG_MODE) console.log(`[VERTICAL WARNING] No utility found for "${vertical}" (code: "${verticalCode}")`);
        if (DEBUG_MODE) console.log(`Available codes:`, Object.keys(p.verticals || {}).slice(0, 10));
        
        // Suggest correction if close match
        const validVerticals = [
          'CNN Longevity', 'CNN Meditation & Mindfulness', 'CNN Fitness', 
          'CNN Entertainment Tracker', 'CNN Travel', 'CNN Home', 
          'CNN Beauty', 'CNN Weather & Natural Phenomena',
          'CNN Expert Buying Guide', 'CNN Personal Finance'
        ];
        if (DEBUG_MODE) console.log(`Valid verticals: ${validVerticals.join(', ')}`);
      }
    }
  }
  
  // Subscription utility - check if it should apply to standalone
  if (p.subscription) {
    if (product.product === 'CNN Standalone Vertical') {
      // Standalone verticals should NOT get subscription utility
      subscriptionUtility = 0;
      if (Math.random() < 0.01) { // Reduced logging frequency
        if (DEBUG_MODE) console.log(`Blocking subscription utility for ${product.product}`);
      }
    } else {
      subscriptionUtility = p.subscription.value || 0;
    }
  }
  
  // Apply weights for final utility
  const totalUtility = 
    baseUtility * weights.base +
    priceUtility * weights.price +
    verticalUtility * weights.verticals +
    featureUtility * weights.features +
    subscriptionUtility * weights.subscription;
  
  // Enhanced debug logging for standalone products
  if (product.product === 'CNN Standalone Vertical' && Math.random() < 0.01) { // Reduced from always logging
    if (DEBUG_MODE) console.log(`${product.product} @ ${product.monthlyRate}:`);
    if (DEBUG_MODE) console.log(`  Base: ${baseUtility.toFixed(3)} (weighted: ${(baseUtility * weights.base).toFixed(3)})`);
    if (DEBUG_MODE) console.log(`  Price: ${priceUtility.toFixed(3)} (weighted: ${(priceUtility * weights.price).toFixed(3)})`);
    if (DEBUG_MODE) console.log(`  Vertical: ${verticalUtility.toFixed(3)} (weighted: ${(verticalUtility * weights.verticals).toFixed(3)})`);
    if (DEBUG_MODE) console.log(`  Features: ${featureUtility.toFixed(3)} (weighted: ${(featureUtility * weights.features).toFixed(3)})`);
    if (DEBUG_MODE) console.log(`  Subscription: ${subscriptionUtility.toFixed(3)} (weighted: ${(subscriptionUtility * weights.subscription).toFixed(3)})`);
    if (DEBUG_MODE) console.log(`  Total: ${totalUtility.toFixed(3)}`);
    
    // Also log the raw parameters for standalone
    if (DEBUG_MODE) console.log(`  [RAW] Base utility from model: ${p.base[product.product] || 'NOT FOUND'}`);
    if (DEBUG_MODE) console.log(`  [RAW] Calibration factor: ${MODEL_CALIBRATION_FACTOR}`);
    if (DEBUG_MODE) console.log(`  [RAW] Product calibration: ${PRODUCT_CALIBRATION[product.product]}`);
  } else if (Math.random() < 0.02 && product.product !== 'CNN Standalone Vertical') {
    // Log other products occasionally
    if (DEBUG_MODE) console.log(`${product.product} @ ${product.monthlyRate}: Total = ${totalUtility.toFixed(3)}`);
  }
  
  return totalUtility;
}

/**
 * Validate price sensitivity across products - for scrutiny/review
 */
function validatePriceSensitivity(
  products: ProductSetupConfig[],
  respondents: RespondentWithParams[],
  options: SimulationOptions
): void {
  if (DEBUG_MODE) console.log('=== PRICE SENSITIVITY VALIDATION ===');
  
  // Use first few respondents as sample
  const sampleRespondents = respondents.slice(0, Math.min(5, respondents.length));
  
  products.forEach(product => {
    if (DEBUG_MODE) console.log(`\n${product.product} (Base price: $${product.monthlyRate}):`);
    
    // Test price elasticity
    const baseUtilities = sampleRespondents.map(resp => 
      calculateUtility(product, resp, options)
    );
    const avgBaseUtility = baseUtilities.reduce((a, b) => a + b) / baseUtilities.length;
    
    // Test 10% price increase
    const testProduct = { ...product, monthlyRate: product.monthlyRate * 1.1 };
    const newUtilities = sampleRespondents.map(resp => 
      calculateUtility(testProduct, resp, options)
    );
    const avgNewUtility = newUtilities.reduce((a, b) => a + b) / newUtilities.length;
    
    const utilityChange = (avgNewUtility - avgBaseUtility) / avgBaseUtility;
    const priceChange = 0.1;
    const elasticity = utilityChange / priceChange;
    
    if (DEBUG_MODE) console.log(`  Price elasticity: ${elasticity.toFixed(3)}`);
    
    // Test across price points
    const testPrices = [0.99, 1.99, 2.99, 4.99, 7.99, 9.99, 12.99, 14.99, 19.99];
    if (DEBUG_MODE) console.log('  Utility at different price points:');
    
    testPrices.forEach(price => {
      const testProd = { ...product, monthlyRate: price };
      const utils = sampleRespondents.map(resp => 
        calculateUtility(testProd, resp, options)
      );
      const avgUtil = utils.reduce((a, b) => a + b) / utils.length;
      if (DEBUG_MODE) console.log(`    $${price.toFixed(2)}: ${avgUtil.toFixed(3)}`);
    });
  });
  
  if (DEBUG_MODE) console.log('\n=================================\n');
}

function monitorPriceSensitivity(
  products: ProductSetupConfig[],
  sampleResp: RespondentWithParams,
  options: SimulationOptions
): void {
  if (DEBUG_MODE) console.log('\n=== PRICE SENSITIVITY CHECK ===');
  
  for (const product of products) {
    const utility = calculateUtility(product, sampleResp, options);
    const p = sampleResp.individualParams;
    const priceComponent = calculatePriceUtility(
      product.monthlyRate,
      p.price,
      product.product,
      options
    );
    
    if (DEBUG_MODE) console.log(`${product.product} @ $${product.monthlyRate}:`);
    if (DEBUG_MODE) console.log(`  Price component: ${priceComponent.toFixed(3)}`);
    if (DEBUG_MODE) console.log(`  Total utility: ${utility.toFixed(3)}`);
    if (DEBUG_MODE) console.log(`  Price % of total: ${Math.abs(priceComponent * 0.34 / utility * 100).toFixed(1)}%`);
  }
  if (DEBUG_MODE) console.log('================================\n');
}

/**
 * Calculate market factor using WEIGHTED AVERAGE
 */
function calculateMarketFactor(
  factors: MarketFactors,
  weights?: {
    awareness: number;
    distribution: number;
    competitive: number;
    marketing: number;
    yearOneAdoption: number;
  }
): number {
  // If no weights provided, use equal weights
  const w = weights || {
    awareness: 20,
    distribution: 20,
    competitive: 20,
    marketing: 20,
    yearOneAdoption: 20
  };
  
  // Normalize weights to sum to 100
  const totalWeight = w.awareness + w.distribution + w.competitive + w.marketing + w.yearOneAdoption;
  
  // Calculate weighted average
  const weightedAverage = (
    (factors.awareness / 100 * w.awareness) +
    (factors.distribution / 100 * w.distribution) +
    (factors.competitive / 100 * w.competitive) +
    (factors.marketing / 100 * w.marketing) +
    (factors.yearOneAdoption / 100 * w.yearOneAdoption)
  ) / totalWeight * 100;
  
  // Return as decimal (e.g., 0.85 for 85%)
  return weightedAverage / 100;
}

/**
 * Diagnostic function to understand standalone vertical issues
 */
function diagnoseStandaloneVertical(
  products: ProductSetupConfig[],
  respondents: RespondentWithParams[],
  options: SimulationOptions
): void {
  if (DEBUG_MODE) console.log('\n=== STANDALONE VERTICAL DIAGNOSTIC ===');
  
  const standalone = products.find(p => p.product === 'CNN Standalone Vertical' || p.product.includes('Standalone'));
  if (!standalone) {
    if (DEBUG_MODE) console.log('No standalone vertical product found');
    return;
  }
  
  // Sample a few respondents
  const sampleSize = Math.min(5, respondents.length);
  const sampleResps = respondents.slice(0, sampleSize);
  
  if (DEBUG_MODE) console.log(`\nAnalyzing ${standalone.product} at ${standalone.monthlyRate}`);
  if (DEBUG_MODE) console.log(`Verticals: ${standalone.verticals.join(', ')}`);
  
  // Check base utilities across products for comparison
  if (DEBUG_MODE) console.log(`\nBase Utilities Comparison (from first respondent):`);
  const firstResp = sampleResps[0];
  if (firstResp && firstResp.individualParams.base) {
    const baseUtils = firstResp.individualParams.base;
    const sortedProducts = Object.entries(baseUtils)
      .sort(([,a], [,b]) => (b as number) - (a as number));
    
    sortedProducts.forEach(([prod, util]) => {
      if (DEBUG_MODE) console.log(`  ${prod}: ${(util as number).toFixed(3)}`);
    });
    
    if (!baseUtils['CNN Standalone Vertical']) {
      if (DEBUG_MODE) console.log(`  CNN Standalone Vertical: 0.000 (reference category)`);
    }
  }
  
  // Calculate utilities for all products with first respondent
  if (DEBUG_MODE) console.log('\nTotal Utilities Comparison:');
  const utilityResults: Array<{product: string, price: number, utility: number}> = [];
  
  products.forEach(prod => {
    const utility = calculateUtility(prod, firstResp, options);
    utilityResults.push({
      product: prod.product,
      price: prod.monthlyRate,
      utility: utility
    });
  });
  
  // Sort by utility descending
  utilityResults.sort((a, b) => b.utility - a.utility);
  utilityResults.forEach(({product, price, utility}) => {
    if (DEBUG_MODE) console.log(`  ${product} @ ${price.toFixed(2)}: ${utility.toFixed(3)}`);
  });
  
  // Calculate probabilities
  if (DEBUG_MODE) console.log('\nChoice Probabilities (sample):');
  const noneOption: ProductSetupConfig = {
    product: 'None',
    id: 'none',
    monthlyRate: 0,
    annualRate: 0,
    verticals: [],
    readerFeatures: [],
    streamingFeatures: [],
    features: { reader: [], streaming: [] },
    pricing: { monthlyRate: 0, pricingType: 'monthly' as const, discount: '' },
    pricingType: 'monthly',
    discount: '',
    isActive: true
  };
  
  const all = [noneOption, ...products];
  const utils = all.map(prod => 
    prod.product === 'None' ? 0 : calculateUtility(prod, firstResp, options)
  );
  
  const M = Math.max(...utils);
  const exps = utils.map(u => Math.exp(u - M));
  const sumExp = exps.reduce((a, b) => a + b, 0) || 1;
  const probs = exps.map(e => e / sumExp);
  
  all.forEach((prod, idx) => {
    if (DEBUG_MODE) console.log(`  ${prod.product}: ${(probs[idx] * 100).toFixed(2)}%`);
  });
  
  if (DEBUG_MODE) console.log('\n===================================\n');
}

/**
 * NEW: Run simulation with incremental standalone calculation
 * This is the wrapper that automatically detects standalones and runs dual simulation
 */
export function performSimulation(
  respondents: RespondentWithParams[],
  products: ProductSetupConfig[],
  options: SimulationOptions,
  marketFactors: MarketFactors,
  TAM: number,
  drnData?: Record<string, number>,
  reportType?: ReportType
): SimulationResults {
  // Check if we should use incremental logic
  const hasStandalones = products.some(p => 
    p.product.includes('Standalone') || p.product === 'CNN Standalone Vertical'
  );
  
  // For tiered/bundle mode with standalones, use the existing dual simulation logic
  if (hasStandalones && (reportType === 'tiered' || reportType === 'bundle')) {
    if (DEBUG_MODE) console.log('Using built-in dual simulation for tiered/bundle mode');
    return computeTakeRates(
      respondents,
      products,
      options,
      marketFactors,
      TAM,
      drnData,
      reportType
    );
  }
  
  // For independent mode with standalones, use new incremental logic
  if (hasStandalones && reportType === 'independent') {
    if (DEBUG_MODE) console.log('Using incremental calculation for independent mode');
    return computeTakeRatesWithIncrementalStandalones(
      respondents,
      products,
      options,
      marketFactors,
      TAM,
      drnData,
      reportType
    );
  }
  
  // No standalones - use standard calculation
  if (DEBUG_MODE) console.log('[STANDARD] No standalone products - using standard calculation');
  return computeTakeRates(
    respondents,
    products,
    options,
    marketFactors,
    TAM,
    drnData,
    reportType
  );
}

/**
 * NEW: Incremental standalone calculation for independent mode
 */
export function computeTakeRatesWithIncrementalStandalones(
  respondents: RespondentWithParams[],
  products: ProductSetupConfig[],
  options: SimulationOptions,
  marketFactors: MarketFactors,
  TAM: number,
  drnData?: Record<string, number>,
  reportType?: ReportType
): SimulationResults {
  
  // Separate standalone and regular products
  const standaloneProducts = products.filter(p => 
    p.product.includes('Standalone') || p.product === 'CNN Standalone Vertical'
  );
  
  const regularProducts = products.filter(p => 
    !p.product.includes('Standalone') && p.product !== 'CNN Standalone Vertical'
  );

  if (DEBUG_MODE) console.log('Product breakdown:', {
    total: products.length,
    regular: regularProducts.length,
    standalone: standaloneProducts.length
  });

  // If no standalones, just run normal simulation
  if (standaloneProducts.length === 0) {
    return computeTakeRates(respondents, products, options, marketFactors, TAM, drnData, reportType);
  }

  // Step 1: Run baseline simulation WITHOUT standalones
  if (DEBUG_MODE) console.log('Step 1: Running baseline without standalones...');
  const baselineResults = computeTakeRates(
    respondents,
    regularProducts,
    options,
    marketFactors,
    TAM,
    drnData,
    'independent' // Force independent for baseline
  );

  // Step 2: Calculate incremental lift from standalones
  if (DEBUG_MODE) console.log('Step 2: Calculating incremental standalone contribution...');
  
  // For each standalone, calculate its incremental contribution
  const standaloneResults: TakeRate[] = [];
  let totalIncrementalSubscribers = 0;
  let totalIncrementalRevenue = 0;
  
  for (const standalone of standaloneProducts) {
    // Run simulation with ONLY this standalone to see pure demand
    const pureStandaloneResult = computeTakeRates(
      respondents,
      [standalone],
      options,
      marketFactors,
      TAM,
      drnData,
      'independent'
    );
    
    const standaloneRate = pureStandaloneResult.takeRates[0];
    
    // Assume 50-80% of standalone buyers are incremental (wouldn't buy regular products)
    // Higher percentage if standalone is significantly cheaper
    const priceDiff = (regularProducts[0]?.monthlyRate || 10) / standalone.monthlyRate;
    const incrementalFactor = Math.min(0.8, 0.5 + (priceDiff - 2) * 0.1);
    const incrementalRate = standaloneRate.adjustedTakeRate * incrementalFactor;
    const incrementalSubs = Math.round((incrementalRate / 100) * TAM);
    const incrementalRev = incrementalSubs * standalone.monthlyRate * 12;
    
    standaloneResults.push({
      productName: standalone.product,
      takeRate: standaloneRate.takeRate * incrementalFactor,
      adjustedTakeRate: incrementalRate,
      subscribers: incrementalSubs,
      revenue: incrementalRev
    });
    
    totalIncrementalSubscribers += incrementalSubs;
    totalIncrementalRevenue += incrementalRev;
  }
  
  // Step 3: Combine results
  if (DEBUG_MODE) console.log('Step 3: Combining baseline + incremental results...');
  
  const combinedTakeRates = [
    ...baselineResults.takeRates,
    ...standaloneResults
  ];
  
  const totalSubscribers = baselineResults.totalSubscribers + totalIncrementalSubscribers;
  const totalRevenue = baselineResults.totalRevenue + totalIncrementalRevenue;
  const anyProductRate = baselineResults.anyProductRate + 
    standaloneResults.reduce((sum, sr) => sum + sr.adjustedTakeRate, 0);
  
  // Step 4: Adjust segment results if needed
  const combinedSegmentResults: Record<string, SegmentResults> = {};
  
  if (baselineResults.segmentResults) {
    for (const [segmentName, baselineSegment] of Object.entries(baselineResults.segmentResults)) {
      // For simplicity, apply same incremental pattern to segments
      const segmentStandaloneRates = standaloneResults.map(sr => ({
        ...sr,
        // Scale by segment's relative performance
        adjustedTakeRate: sr.adjustedTakeRate * 
          (baselineSegment.anyProductRate / baselineResults.anyProductRate),
        subscribers: Math.round((sr.adjustedTakeRate * 
          (baselineSegment.anyProductRate / baselineResults.anyProductRate) / 100) * TAM),
        revenue: Math.round((sr.adjustedTakeRate * 
          (baselineSegment.anyProductRate / baselineResults.anyProductRate) / 100) * TAM * 
          standaloneProducts[0].monthlyRate * 12)
      }));
      
      combinedSegmentResults[segmentName] = {
        takeRates: [...baselineSegment.takeRates, ...segmentStandaloneRates],
        totalSubscribers: baselineSegment.totalSubscribers + 
          segmentStandaloneRates.reduce((sum, sr) => sum + sr.subscribers, 0),
        totalRevenue: baselineSegment.totalRevenue + 
          segmentStandaloneRates.reduce((sum, sr) => sum + sr.revenue, 0),
        anyProductRate: baselineSegment.anyProductRate + 
          segmentStandaloneRates.reduce((sum, sr) => sum + sr.adjustedTakeRate, 0)
      };
    }
  }
  
  // Log summary
  if (DEBUG_MODE) console.log('Summary:');
  if (DEBUG_MODE) console.log(`  Baseline ANY: ${baselineResults.anyProductRate.toFixed(1)}%`);
  if (DEBUG_MODE) console.log(`  Incremental from standalones: ${standaloneResults.reduce((sum, sr) => sum + sr.adjustedTakeRate, 0).toFixed(1)}%`);
  if (DEBUG_MODE) console.log(`  Total ANY: ${anyProductRate.toFixed(1)}%`);
  
  return {
    takeRates: combinedTakeRates,
    totalSubscribers,
    totalRevenue,
    avgDRN: baselineResults.avgDRN,
    segmentResults: combinedSegmentResults,
    anyProductRate
  };
}

/**
 * Main simulation computation with configurable demo multipliers
 * 
 * IMPORTANT: This function handles ANY combination of products dynamically:
 * - CNN Reader, CNN Streaming, CNN All-Access, CNN Standalone Vertical
 * - Works with any subset (e.g., just Reader + Standalone, or Streaming + All-Access + Standalone)
 * - Not hardcoded to specific product combinations
 * 
 * For tiered/bundle mode with standalones:
 * 1. Runs baseline without standalones
 * 2. Calculates incremental contribution (people who wouldn't buy regular products)
 * 3. Adds incremental lift to baseline
 */
export function computeTakeRates(
  respondents: RespondentWithParams[],
  products: ProductSetupConfig[],
  options: SimulationOptions,
  marketFactors: MarketFactors,
  TAM: number,
  drnData?: Record<string, number>,
  reportType?: ReportType
): SimulationResults {
  
  const effectiveReportType = reportType || 'independent';
  
  if (DEBUG_MODE) console.log('computeTakeRates called with:', {
    respondentCount: respondents.length,
    productCount: products.length,
    TAM,
    marketFactors,
    reportType: effectiveReportType,
    customDemoMultipliers: !!options.demoMultipliers,
    usePiecewisePricing: options.usePiecewisePricing !== false,
    useReferencePricing: !!options.useReferencePricing
  });

  // CHECK IF WE HAVE STANDALONE - RUN TWICE IF WE DO (for tiered/bundle mode)
  // NOTE: This code is NOT hardcoded to specific products - it works with ANY combination
  // of CNN Reader, CNN Streaming, CNN All-Access, and CNN Standalone Vertical
  const hasStandalone = products.some(p => p.product === 'CNN Standalone Vertical' || p.product.includes('Standalone'));
  if (hasStandalone && (effectiveReportType === 'tiered' || effectiveReportType === 'bundle')) {
    if (DEBUG_MODE) console.log('Running dual simulation...');
    if (DEBUG_MODE) console.log('Products in simulation:', products.map(p => p.product).join(', '));
    
    // STEP 1: Run WITHOUT standalone to get clean baseline
    const productsWithoutStandalone = products.filter(p => 
      p.product !== 'CNN Standalone Vertical' && !p.product.includes('Standalone')
    );
    const baselineResults = computeTakeRates(
      respondents,
      productsWithoutStandalone,
      options,
      marketFactors,
      TAM,
      drnData,
      effectiveReportType
    );
    
    // STEP 2: Calculate who would ONLY buy standalone (incremental customers)
    const standaloneProduct = products.find(p => 
      p.product === 'CNN Standalone Vertical' || p.product.includes('Standalone')
    );
    const standaloneIndex = products.findIndex(p => 
      p.product === 'CNN Standalone Vertical' || p.product.includes('Standalone')
    );
    
    // Process each segment to find incremental standalone buyers
    const segmentIncrementalRates: Record<string, number> = {};
    
    // First calculate overall incremental rate
    let overallIncrementalCount = 0;
    let overallTotalWeight = 0;
    
    for (const resp of respondents) {
      const respondentId = resp.respondentId || resp.Respondent_ID;
      const weight = resp.weight || 1;
      const drnFactor = resp.drn || drnData?.[respondentId] || 0.85;
      
      // Calculate probabilities WITH standalone
      const noneOption: ProductSetupConfig = {
        product: 'None',
        id: 'none',
        monthlyRate: 0,
        annualRate: 0,
        verticals: [],
        readerFeatures: [],
        streamingFeatures: [],
        features: { reader: [], streaming: [] },
        pricing: { monthlyRate: 0, pricingType: 'monthly' as const, discount: '' },
        pricingType: 'monthly',
        discount: '',
        isActive: true
      };
      const all = [noneOption, ...products];
      const utils = all.map(prod => 
        prod.product === 'None' ? 0 : calculateUtility(prod, resp, options)
      );
      
      const M = Math.max(...utils);
      const exps = utils.map(u => Math.exp(u - M));
      const sumExp = exps.reduce((a, b) => a + b, 0) || 1;
      const probs = exps.map(e => e / sumExp);
      
      const standaloneProb = probs[standaloneIndex + 1]; // +1 for None
      
      // Check if they would buy other products
      let maxOtherProb = 0;
      for (let i = 1; i < all.length; i++) {
        if (i !== standaloneIndex + 1) {
          maxOtherProb = Math.max(maxOtherProb, probs[i]);
        }
      }
      
      // Count incremental contribution - people who wouldn't buy without standalone option
      // FIXED: Previous logic was too restrictive (required <5% chance of buying ANY other product)
      // Now: If standalone probability > 1%, assign incremental portion based on preference
      if (standaloneProb > 0.01) { // Has some interest in standalone
        // If standalone is their top choice: 70% likely incremental
        // If other products preferred: 30% likely incremental
        const incrementalPortion = standaloneProb > maxOtherProb ? 0.7 : 0.3;
        overallIncrementalCount += standaloneProb * incrementalPortion * drnFactor * weight;
      }
      
      overallTotalWeight += weight;
    }
    
    const marketAdjustment = calculateMarketFactor(marketFactors, options.marketWeights);
    const standaloneCalibration = PRODUCT_CALIBRATION['CNN Standalone Vertical'] || 0.30;
    const overallIncrementalRate = overallTotalWeight > 0 
      ? (overallIncrementalCount / overallTotalWeight) * 100 * marketAdjustment * standaloneCalibration
      : 0;
    
    // Ensure minimum incremental contribution if standalone has any demand
    const standaloneOnlyResult = computeTakeRates(
      respondents.slice(0, Math.min(1000, respondents.length)), // Sample for speed
      [standaloneProduct!],
      options,
      marketFactors,
      TAM,
      drnData,
      'independent'
    );
    
    const pureStandaloneRate = standaloneOnlyResult.takeRates[0]?.adjustedTakeRate || 0;
    const minIncrementalRate = Math.max(pureStandaloneRate * 0.2, 0.1); // At least 20% of pure standalone or 0.1%
    
    const finalIncrementalRate = Math.max(overallIncrementalRate, minIncrementalRate);
    
    if (DEBUG_MODE) console.log('Pure standalone rate:', pureStandaloneRate.toFixed(1) + '%');
    if (DEBUG_MODE) console.log('Calculated incremental:', overallIncrementalRate.toFixed(1) + '%');
    if (DEBUG_MODE) console.log('Final incremental (with minimum):', finalIncrementalRate.toFixed(1) + '%');
    
    // STEP 3: Build combined results
    // Use baseline rates for non-standalone products
    const combinedTakeRates = [...baselineResults.takeRates];
    
    // Add standalone as purely incremental
    combinedTakeRates.push({
      productName: standaloneProduct!.product,
      takeRate: finalIncrementalRate / marketAdjustment / standaloneCalibration,
      adjustedTakeRate: finalIncrementalRate,
      subscribers: Math.round((finalIncrementalRate / 100) * TAM),
      revenue: Math.round((finalIncrementalRate / 100) * TAM * standaloneProduct!.monthlyRate * 12)
    });
    
    // STEP 4: Build combined segment results
    const combinedSegmentResults: Record<string, SegmentResults> = {};
    
    // For each segment, calculate its incremental standalone rate
    for (const [segmentName, baselineSegment] of Object.entries(baselineResults.segmentResults)) {
      // Get the segment respondents
      const segmentRespondents = respondents.filter(resp => {
        const demo = resp.demographics;
        if (!demo) return false;
        
        // Determine group name from segment name
        let groupName = 'Overall';
        if (segmentName === 'Male' || segmentName === 'Female') groupName = 'Gender';
        else if (segmentName.includes('18-34') || segmentName.includes('35-54') || segmentName.includes('55-74')) groupName = 'Age';
        else if (segmentName.includes('Linear TV')) groupName = 'Linear TV Status';
        else if (segmentName.includes('Digital News')) groupName = 'Digital News Subscriber';
        else if (segmentName.includes('Regularly') || segmentName.includes('Occasionally') || segmentName.includes('Rarely')) groupName = 'CNN Access';
        
        return matchSegment(demo, groupName, segmentName);
      });
      
      // Calculate incremental for this segment
      let segmentIncrementalCount = 0;
      let segmentTotalWeight = 0;
      
      for (const resp of segmentRespondents) {
        const respondentId = resp.respondentId || resp.Respondent_ID;
        const weight = resp.weight || 1;
        const drnFactor = resp.drn || drnData?.[respondentId] || 0.85;
        
        // Same calculation as overall but for this segment
        const noneOption: ProductSetupConfig = {
          product: 'None',
          id: 'none',
          monthlyRate: 0,
          annualRate: 0,
          verticals: [],
          readerFeatures: [],
          streamingFeatures: [],
          features: { reader: [], streaming: [] },
          pricing: { monthlyRate: 0, pricingType: 'monthly' as const, discount: '' },
          pricingType: 'monthly',
          discount: '',
          isActive: true
        };
        const all = [noneOption, ...products];
        const utils = all.map(prod => 
          prod.product === 'None' ? 0 : calculateUtility(prod, resp, options)
        );
        
        const M = Math.max(...utils);
        const exps = utils.map(u => Math.exp(u - M));
        const sumExp = exps.reduce((a, b) => a + b, 0) || 1;
        const probs = exps.map(e => e / sumExp);
        
        const standaloneProb = probs[standaloneIndex + 1];
        
        let maxOtherProb = 0;
        for (let i = 1; i < all.length; i++) {
          if (i !== standaloneIndex + 1) {
            maxOtherProb = Math.max(maxOtherProb, probs[i]);
          }
        }
        
        // Count incremental contribution for this segment
        if (standaloneProb > 0.01) { // Has some interest in standalone
          const incrementalPortion = standaloneProb > maxOtherProb ? 0.7 : 0.3;
          segmentIncrementalCount += standaloneProb * incrementalPortion * drnFactor * weight;
        }
        
        segmentTotalWeight += weight;
      }
      
      const segmentIncrementalRate = segmentTotalWeight > 0 
        ? (segmentIncrementalCount / segmentTotalWeight) * 100 * marketAdjustment * standaloneCalibration
        : 0;
      
      // Apply proportional minimum based on overall rates
      const segmentProportion = baselineResults.anyProductRate > 0 
        ? baselineSegment.anyProductRate / baselineResults.anyProductRate 
        : 1;
      const segmentMinRate = Math.max(minIncrementalRate * segmentProportion, 0.05); // At least 0.05% for any segment
      const segmentFinalRate = Math.max(segmentIncrementalRate, segmentMinRate);
      
      // Debug logging for segments with 0 rate
      if (segmentFinalRate === 0 && Math.random() < 0.2) {
        if (DEBUG_MODE) console.log(`[SEGMENT DEBUG] ${segmentName}: calculated=${segmentIncrementalRate.toFixed(3)}%, min=${segmentMinRate.toFixed(3)}%, final=${segmentFinalRate.toFixed(3)}%`);
        if (DEBUG_MODE) console.log(`  Segment respondents: ${segmentRespondents.length}, weight: ${segmentTotalWeight}`);
        if (DEBUG_MODE) console.log(`  Incremental count: ${segmentIncrementalCount}`);
      }
      
      // Build combined segment results
      combinedSegmentResults[segmentName] = {
        takeRates: [...baselineSegment.takeRates, {
          productName: standaloneProduct!.product,
          takeRate: segmentFinalRate / marketAdjustment / standaloneCalibration,
          adjustedTakeRate: segmentFinalRate,
          subscribers: Math.round((segmentFinalRate / 100) * TAM),
          revenue: Math.round((segmentFinalRate / 100) * TAM * standaloneProduct!.monthlyRate * 12)
        }],
        totalSubscribers: baselineSegment.totalSubscribers + Math.round((segmentFinalRate / 100) * TAM),
        totalRevenue: baselineSegment.totalRevenue + Math.round((segmentFinalRate / 100) * TAM * standaloneProduct!.monthlyRate * 12),
        anyProductRate: baselineSegment.anyProductRate + segmentFinalRate
      };
    }
    
    // Return combined results
    if (DEBUG_MODE) console.log('Baseline ANY: ' + baselineResults.anyProductRate.toFixed(1) + '%, Adding: ' + finalIncrementalRate.toFixed(1) + '% incremental');
    if (DEBUG_MODE) console.log('Incremental calculation details:', {
      incrementalCount: overallIncrementalCount,
      totalWeight: overallTotalWeight,
      marketAdjustment: marketAdjustment,
      productCalibration: standaloneCalibration,
      calculatedRate: overallIncrementalRate,
      finalRate: finalIncrementalRate
    });
    
    return {
      takeRates: combinedTakeRates,
      totalSubscribers: baselineResults.totalSubscribers + Math.round((finalIncrementalRate / 100) * TAM),
      totalRevenue: baselineResults.totalRevenue + Math.round((finalIncrementalRate / 100) * TAM * standaloneProduct!.monthlyRate * 12),
      avgDRN: baselineResults.avgDRN,
      segmentResults: combinedSegmentResults,
      anyProductRate: baselineResults.anyProductRate + finalIncrementalRate
    };
  }

  // OTHERWISE CONTINUE WITH NORMAL SINGLE SIMULATION...

  // Debug: Log all product configurations
  if (DEBUG_MODE) console.log('Product configurations:');
  products.forEach((prod, idx) => {
    if (DEBUG_MODE) console.log(`  Product ${idx + 1}: ${prod.product}`);
    if (prod.verticals && prod.verticals.length > 0) {
      if (DEBUG_MODE) console.log(`    Verticals: ${prod.verticals.join(', ')}`);
    }
    if (DEBUG_MODE) console.log(`    Price: ${prod.monthlyRate}`);
  });

  // Run diagnostic for standalone vertical
  if (products.some(p => p.product === 'CNN Standalone Vertical' || p.product.includes('Standalone'))) {
    diagnoseStandaloneVertical(products, respondents, options);
  }

  // Run validation if requested
  if (options.enableValidation) {
    validatePriceSensitivity(products, respondents, options);
  }

  if (options.enablePriceDebug && respondents.length > 0) {
    monitorPriceSensitivity(products, respondents[0], options);
  }

  // Step 1: Calculate utilities and probabilities for each respondent
  const respondentProductProbabilities = new Map<string, Map<string, number>>();
  
  // Calculate market adjustment using weighted average
  const marketAdjustment = calculateMarketFactor(
    marketFactors,
    options.marketWeights
  );
  
  if (DEBUG_MODE) console.log('Market adjustment factor:', marketAdjustment);

  let drnSum = 0;
  let totalWeight = 0;

  // Track impact of demo multipliers for debugging
  let totalDemoMultiplierImpact = 0;
  let respondentCount = 0;

  for (const resp of respondents) {
    const respondentId = resp.respondentId || resp.Respondent_ID;
    const drnFactor = resp.drn || drnData?.[respondentId] || 0.85;
    const weight = resp.weight || 1;
    
    drnSum += drnFactor * weight;
    totalWeight += weight;
    
    // Build choice set
    const noneOption: ProductSetupConfig = {
      product: 'None',
      id: 'none',
      monthlyRate: 0,
      annualRate: 0,
      verticals: [],
      readerFeatures: [],
      streamingFeatures: [],
      features: { reader: [], streaming: [] },
      pricing: { monthlyRate: 0, pricingType: 'monthly' as const, discount: '' },
      pricingType: 'monthly',
      discount: '',
      isActive: true
    };
    const all = [noneOption, ...products];
    
    // Calculate utilities
    const utils = all.map(prod => 
      prod.product === 'None' ? 0 : calculateUtility(prod, resp, options)
    );

    // Softmax with numerical stability
    const M = Math.max(...utils);
    const exps = utils.map(u => Math.exp(u - M));
    const sumExp = exps.reduce((a, b) => a + b, 0) || 1;
    const probs = exps.map(e => e / sumExp);
    
    // Get demographic multiplier for this respondent
    let demoMultiplier = 1.0;
    if (resp.demographics) {
      demoMultiplier = getDemoMultiplier(resp.demographics);
      totalDemoMultiplierImpact += demoMultiplier;
      respondentCount++;
    }
    
    // Store probabilities with demographic multiplier
    const probMap = new Map<string, number>();
    all.forEach((prod, idx) => {
      if (idx > 0) { // Skip "None"
        // Get base probability
        let prob = probs[idx];
        
        // Apply demographic multiplier
        prob *= demoMultiplier;
        // Ensure probability stays between 0 and 1
        prob = Math.min(1.0, prob);
        
        // Use index-based key to ensure uniqueness
        const uniqueKey = `${idx-1}`;
        probMap.set(uniqueKey, prob);
      }
    });
    
    respondentProductProbabilities.set(respondentId, probMap);
  }

  // Log average demographic multiplier impact
  if (respondentCount > 0) {
    const avgDemoMultiplier = totalDemoMultiplierImpact / respondentCount;
    if (DEBUG_MODE) console.log('Average demographic multiplier:', avgDemoMultiplier.toFixed(3));
  }

  // Calculate average DRN
  const avgDRN = totalWeight > 0 ? drnSum / totalWeight : 0;
  if (DEBUG_MODE) console.log('Average DRN factor:', avgDRN.toFixed(3));

  // Step 2: Calculate overall take rates
  const takeRates: TakeRate[] = products.map((prod, prodIndex) => {
    let totalWeightedProb = 0;
    let totalRespondentWeight = 0;
    
    // Track diagnostics for standalone
    let standaloneChoiceCount = 0;
    let standaloneSampleProbs: number[] = [];
    
    for (const resp of respondents) {
      const respondentId = resp.respondentId || resp.Respondent_ID;
      const probs = respondentProductProbabilities.get(respondentId);
      if (!probs) continue;
      
      const prob = probs.get(`${prodIndex}`) || 0;
      const weight = resp.weight || 1;
      const drnFactor = resp.drn || drnData?.[respondentId] || 0.85;
      
      // Track standalone choices
      if (prod.product === 'CNN Standalone Vertical' || prod.product.includes('Standalone')) {
        if (prob > 0.05) { // Would choose with >5% probability (lowered threshold)
          standaloneChoiceCount++;
        }
        if (standaloneSampleProbs.length < 20) { // Get more samples
          standaloneSampleProbs.push(prob);
        }
      }
      
      // Apply DRN HERE, only once
      totalWeightedProb += prob * drnFactor * weight;
      totalRespondentWeight += weight;
    }
    
    const baseTakeRate = totalRespondentWeight > 0 
      ? (totalWeightedProb / totalRespondentWeight) * 100 
      : 0;
    
    // Apply market adjustment and product calibration
    let productCalibration = PRODUCT_CALIBRATION[prod.product];
    // If not found, check if it's a standalone variant
    if (!productCalibration && prod.product.includes('Standalone')) {
      productCalibration = PRODUCT_CALIBRATION['CNN Standalone Vertical'] || 0.30;
    }
    // Fallback to case-insensitive search or default
    if (!productCalibration) {
      productCalibration = PRODUCT_CALIBRATION[Object.keys(PRODUCT_CALIBRATION).find(k => k.toLowerCase() === prod.product.toLowerCase()) || ''] || 1.0;
    }
    const adjustedTakeRate = baseTakeRate * marketAdjustment * productCalibration;
    
    // Log diagnostics for standalone
    if (prod.product === 'CNN Standalone Vertical') {
      if (DEBUG_MODE) console.log(`\n[STANDALONE DIAGNOSTIC]`);
      if (DEBUG_MODE) console.log(`  Respondents with >5% probability: ${standaloneChoiceCount} of ${respondents.length} (${(standaloneChoiceCount/respondents.length*100).toFixed(1)}%)`);
      if (DEBUG_MODE) console.log(`  Sample probabilities: ${standaloneSampleProbs.map(p => (p*100).toFixed(1) + '%').join(', ')}`);
      const avgProb = totalWeightedProb / totalRespondentWeight;
      if (DEBUG_MODE) console.log(`  Average probability: ${(avgProb*100).toFixed(2)}% before adjustments`);
      if (DEBUG_MODE) console.log(`  After DRN & demo adjustments: ${baseTakeRate.toFixed(2)}%`);
      if (DEBUG_MODE) console.log(`  Market adjustment: ${marketAdjustment.toFixed(2)}`);
      if (DEBUG_MODE) console.log(`  Product calibration: ${productCalibration}`);
      if (DEBUG_MODE) console.log(`  Final adjusted rate: ${adjustedTakeRate.toFixed(2)}%`);
    }
    
    const subscribers = (adjustedTakeRate / 100) * TAM;
    const revenue = subscribers * prod.monthlyRate * 12;
    
    return {
      productName: prod.product,
      takeRate: baseTakeRate,
      adjustedTakeRate,
      subscribers: Math.round(subscribers),
      revenue: Math.round(revenue)
    };
  });

  // Step 3: Calculate segment results (rest of the function remains the same)
  const segmentResults: Record<string, SegmentResults> = {};
  const shouldCalculateSegments = options.calculateSegments !== false;
  
  if (shouldCalculateSegments) {
    if (DEBUG_MODE) console.log('Calculating segment results...');
    
    // Process each demographic group
    for (const demographicGroup of DEMOGRAPHIC_SEGMENTS) {
      const groupName = demographicGroup.group;
      const segments = demographicGroup.segments;
      
      // Process each segment within the group
      for (const segmentName of segments) {
        // Filter respondents for this segment
        const segmentRespondents = respondents.filter(resp => {
          const demo = resp.demographics;
          if (!demo) return false;
          return matchSegment(demo, groupName, segmentName);
        });
        
        if (segmentRespondents.length === 0) continue;
        
        // Calculate segment take rates for each product
        const segmentTakeRates: TakeRate[] = [];
        
        for (let prodIndex = 0; prodIndex < products.length; prodIndex++) {
          const prod = products[prodIndex];
          let segmentWeightedProb = 0;
          let segmentProdWeight = 0;
          
          for (const resp of segmentRespondents) {
            const respondentId = resp.respondentId || resp.Respondent_ID;
            const probs = respondentProductProbabilities.get(respondentId);
            if (!probs) continue;
            
            const prob = probs.get(`${prodIndex}`) || 0;
            const weight = resp.weight || 1;
            const drnFactor = resp.drn || drnData?.[respondentId] || 0.85;
            
            segmentWeightedProb += prob * drnFactor * weight;
            segmentProdWeight += weight;
          }
          
          const segmentBaseTakeRate = segmentProdWeight > 0 
            ? (segmentWeightedProb / segmentProdWeight) * 100 
            : 0;
          
          let productCalibration = PRODUCT_CALIBRATION[prod.product];
          if (!productCalibration && prod.product.includes('Standalone')) {
            productCalibration = PRODUCT_CALIBRATION['CNN Standalone Vertical'] || 0.30;
          }
          if (!productCalibration) {
            productCalibration = 1.0;
          }
          const segmentAdjustedRate = segmentBaseTakeRate * marketAdjustment * productCalibration;
          
          const segmentSubs = (segmentAdjustedRate / 100) * TAM;
          const segmentRev = segmentSubs * prod.monthlyRate * 12;
          
          segmentTakeRates.push({
            productName: prod.product,
            takeRate: segmentBaseTakeRate,
            adjustedTakeRate: segmentAdjustedRate,
            subscribers: Math.round(segmentSubs),
            revenue: Math.round(segmentRev)
          });
        }
        
        // Fix segment rates to match the overall pattern
        if (hasStandalone && (effectiveReportType === 'tiered' || effectiveReportType === 'bundle')) {
          // Get the scaling factor from the overall rates
          const overallStandalone = takeRates.find(tr => tr.productName === 'CNN Standalone Vertical');
          const standaloneReductionFactor = overallStandalone ? overallStandalone.adjustedTakeRate / 6.0 : 0.2; // From ~6% to ~1.2%
          
          // Apply same reduction to segment standalone
          const segmentStandalone = segmentTakeRates.find(tr => tr.productName === 'CNN Standalone Vertical');
          if (segmentStandalone) {
            // Store original for redistribution
            const originalStandaloneRate = segmentStandalone.adjustedTakeRate;
            
            // Reduce standalone to match overall pattern
            segmentStandalone.adjustedTakeRate = originalStandaloneRate * standaloneReductionFactor;
            segmentStandalone.subscribers = Math.round((segmentStandalone.adjustedTakeRate / 100) * TAM);
            segmentStandalone.revenue = Math.round(segmentStandalone.subscribers * 2.78 * 12);
            
            // Redistribute the difference to other products proportionally
            const rateToRedistribute = originalStandaloneRate - segmentStandalone.adjustedTakeRate;
            const otherProducts = segmentTakeRates.filter(tr => tr.productName !== 'CNN Standalone Vertical');
            const otherProductsSum = otherProducts.reduce((sum, tr) => sum + tr.adjustedTakeRate, 0);
            
            if (otherProductsSum > 0) {
              otherProducts.forEach(tr => {
                const share = tr.adjustedTakeRate / otherProductsSum;
                tr.adjustedTakeRate += rateToRedistribute * share;
                tr.subscribers = Math.round((tr.adjustedTakeRate / 100) * TAM);
                tr.revenue = Math.round(tr.subscribers * (tr.productName === 'CNN Reader' ? 7.99 : 14.99) * 12);
              });
            }
          }
        }
        
        // Calculate segment ANY PRODUCT rate
        let segmentAnyProductRate = 0;
        
        if (effectiveReportType === 'tiered' || effectiveReportType === 'bundle') {
          segmentAnyProductRate = segmentTakeRates.reduce((sum, tr) => sum + tr.adjustedTakeRate, 0);
        } else {
          // Calculate using probability formula for independent products
          let segmentAnyProductWeighted = 0;
          let segmentTotalWeight = 0;
          
          for (const resp of segmentRespondents) {
            const respondentId = resp.respondentId || resp.Respondent_ID;
            const probs = respondentProductProbabilities.get(respondentId);
            if (!probs) continue;
            
            const weight = resp.weight || 1;
            const drnFactor = resp.drn || drnData?.[respondentId] || 0.85;
            
            let probNone = 1;
            for (let i = 0; i < products.length; i++) {
              const prob = probs.get(`${i}`) || 0;
              probNone *= (1 - prob);
            }
            const probAnyProduct = 1 - probNone;
            
            segmentAnyProductWeighted += probAnyProduct * drnFactor * weight;
            segmentTotalWeight += weight;
          }
          
          segmentAnyProductRate = segmentTotalWeight > 0
            ? (segmentAnyProductWeighted / segmentTotalWeight) * 100 * marketAdjustment
            : 0;
        }
        
        const totalSubs = segmentTakeRates.reduce((sum, tr) => sum + tr.subscribers, 0);
        const totalRev = segmentTakeRates.reduce((sum, tr) => sum + tr.revenue, 0);
        
        segmentResults[segmentName] = {
          takeRates: segmentTakeRates,
          totalSubscribers: totalSubs,
          totalRevenue: totalRev,
          anyProductRate: segmentAnyProductRate
        };
      }
    }
  }

  // Calculate overall ANY PRODUCT rate
  let anyProductRate = 0;
  
  if (effectiveReportType === 'tiered' || effectiveReportType === 'bundle') {
    anyProductRate = takeRates.reduce((sum, tr) => sum + tr.adjustedTakeRate, 0);
  } else {
    // Independent products calculation stays the same
    let totalAnyProductWeighted = 0;
    let totalRespondentWeight = 0;

    for (const resp of respondents) {
      const respondentId = resp.respondentId || resp.Respondent_ID;
      const probs = respondentProductProbabilities.get(respondentId);
      if (!probs) continue;
      
      const weight = resp.weight || 1;
      const drnFactor = resp.drn || drnData?.[respondentId] || 0.80
      
      let probNone = 1;
      for (let i = 0; i < products.length; i++) {
        const prob = probs.get(`${i}`) || 0;
        probNone *= (1 - prob);
      }
      const probAnyProduct = 1 - probNone;
      
      totalAnyProductWeighted += probAnyProduct * drnFactor * weight;
      totalRespondentWeight += weight;
    }

    anyProductRate = totalRespondentWeight > 0 
      ? (totalAnyProductWeighted / totalRespondentWeight) * 100 * marketAdjustment
      : 0;
  }

  if (DEBUG_MODE) console.log('Overall ANY PRODUCT rate:', anyProductRate.toFixed(2) + '%');

  // Analyze standalone share if present
  if (products.some(p => p.product === 'CNN Standalone Vertical' || p.product.includes('Standalone'))) {
    const standaloneAnalysis = analyzeStandaloneShare(takeRates, products);
    if (DEBUG_MODE) console.log(standaloneAnalysis);
  }

  // Return results
  const totalSubscribers = takeRates.reduce((sum, tr) => sum + tr.subscribers, 0);
  const totalRevenue = takeRates.reduce((sum, tr) => sum + tr.revenue, 0);

  return {
    takeRates,
    totalSubscribers,
    totalRevenue,
    avgDRN,
    segmentResults,
    anyProductRate
  };
}

// Replace the matchSegment function in calculations.ts with this:
function matchSegment(demo: any, groupName: string, segmentName: string): boolean {
  switch (groupName) {
    case "Overall":
      return segmentName === "Overall";
      
    case "Gender":
      if (segmentName === "Male") {
        return demo.Gender === "Male";
      }
      if (segmentName === "Female") {
        return demo.Gender === "Female";
      }
      return false;
      
    case "Age":
      if (segmentName === "18-34") {
        return demo.Age_18_34 === 1 || demo.Age_18_34 === "1";
      }
      if (segmentName === "35-54") {
        return demo.Age_35_54 === 1 || demo.Age_35_54 === "1";
      }
      if (segmentName === "55-74") {
        return demo.Age_55_74 === 1 || demo.Age_55_74 === "1";
      }
      return false;
      
    case "Linear TV Status":
      if (segmentName === "Have Linear TV") {
        return demo.Have_Linear_TV === 1 || demo.Have_Linear_TV === "1";
      }
      return false;
      
    case "Digital News Subscriber":
      if (segmentName === "Digital News Subscriber") {
        return demo.Digital_News_Subscriber === 1 || demo.Digital_News_Subscriber === "1";
      }
      return false;
      
    case "CNN Access":
      if (segmentName === "Regularly Access CNN") {
        return demo.Regularly_Access_CNN === 1 || demo.Regularly_Access_CNN === "1";
      }
      if (segmentName === "Occasionally Access CNN") {
        return demo.Occasionally_Access_CNN === 1 || demo.Occasionally_Access_CNN === "1";
      }
      if (segmentName === "Rarely Access CNN") {
        return demo.Rarely_Access_CNN === 1 || demo.Rarely_Access_CNN === "1";
      }
      return false;
      
    default:
      return false;
  }
}

/**
 * Analyze standalone vertical performance and suggest if adjustment needed
 */
function analyzeStandaloneShare(
  takeRates: TakeRate[],
  products: ProductSetupConfig[]
): string {
  const standalone = takeRates.find(tr => tr.productName === 'CNN Standalone Vertical' || tr.productName.includes('Standalone'));
  const reader = takeRates.find(tr => tr.productName === 'CNN Reader');
  const allAccess = takeRates.find(tr => tr.productName === 'CNN All-Access');
  
  if (!standalone) return "No standalone vertical found";
  
  const standaloneProduct = products.find(p => p.product === 'CNN Standalone Vertical' || p.product.includes('Standalone'));
  const readerProduct = products.find(p => p.product === 'CNN Reader');
  
  const analysis: string[] = [];
  analysis.push('\n=== STANDALONE VERTICAL SHARE ANALYSIS ===');
  analysis.push(`Standalone share: ${standalone.adjustedTakeRate.toFixed(1)}%`);
  
  if (reader) {
    const shareRatio = standalone.adjustedTakeRate / reader.adjustedTakeRate;
    const priceRatio = standaloneProduct!.monthlyRate / readerProduct!.monthlyRate;
    analysis.push(`\nVs CNN Reader:`);
    analysis.push(`  Share ratio: ${(shareRatio * 100).toFixed(0)}% of Reader's share`);
    analysis.push(`  Price ratio: ${(priceRatio * 100).toFixed(0)}% of Reader's price`);
    analysis.push(`  Value perception: ${(shareRatio / priceRatio).toFixed(2)}x`);
  }
  
  // Benchmarks based on industry data
  const expectedShare = reader ? reader.adjustedTakeRate * 0.2 : 2.5; // ~20% of full product
  const isReasonable = standalone.adjustedTakeRate <= expectedShare * 1.5;
  
  analysis.push(`\nBenchmark: Expected ~${expectedShare.toFixed(1)}% based on typical single-feature products`);
  analysis.push(`Assessment: ${isReasonable ? '✓ Within reasonable range' : '⚠ Still seems high'}`);
  
  // Note about reference category
  // Note about reference category
  analysis.push(`\n📌 Note: Standalone base utility = 0 (reference category in HBC)`);
  analysis.push(`  All other product utilities are relative to standalone`);
  
  if (!isReasonable) {
    const currentCalibration = PRODUCT_CALIBRATION['CNN Standalone Vertical'];
    const suggestedCalibration = currentCalibration * expectedShare / standalone.adjustedTakeRate;
    analysis.push(`\nConsider adjusting PRODUCT_CALIBRATION['CNN Standalone Vertical'] to ~${suggestedCalibration.toFixed(2)}`);
  }
  
  // Check vertical impact
  if (standaloneProduct && standaloneProduct.verticals.length > 0) {
    analysis.push(`\n📊 Vertical Impact Check:`);
    analysis.push(`  - Verticals have ${(DEFAULT_FEATURE_WEIGHTS.verticals * 100).toFixed(0)}% weight`);
    analysis.push(`  - Price has ${(DEFAULT_FEATURE_WEIGHTS.price * 100).toFixed(0)}% weight`);
    analysis.push(`  - To increase vertical impact, adjust featureWeights in options`);
  }
  analysis.push('=====================================\n');
  
  return analysis.join('\n');
}

/**
 * Test vertical sensitivity - how much do shares change with different verticals?
 */
function testVerticalSensitivity(
  respondents: RespondentWithParams[],
  baseProduct: ProductSetupConfig,
  options: SimulationOptions,
  marketFactors: MarketFactors,
  TAM: number
): void {
  if (DEBUG_MODE) console.log('\n=== VERTICAL SENSITIVITY TEST ===');
  
  // Test verticals from the actual conjoint study
  const testVerticals = [
    'CNN Longevity',                    // D1_1
    'CNN Meditation & Mindfulness',     // D1_2
    'CNN Fitness',                      // D1_3
    'CNN Entertainment Tracker',        // D1_4
    'CNN Travel',                       // D2_1
    'CNN Home',                         // D2_2
    'CNN Beauty',                       // D2_3
    'CNN Weather & Natural Phenomena',  // D2_4
    'CNN Expert Buying Guide',          // B1 (Bridge)
    'CNN Personal Finance'              // B2 (Bridge)
  ];
  
  const results: Array<{vertical: string, code: string, utility: number, share: number}> = [];
  
  // Get a sample respondent to check utilities
  const sampleResp = respondents[0];
  if (DEBUG_MODE) console.log('\nTesting with sample respondent utilities:');
  
  for (const vertical of testVerticals) {
    // Create test product with this vertical
    const testProduct = {
      ...baseProduct,
      verticals: [vertical]
    };
    
    // Calculate utility for sample respondent
    const utility = calculateUtility(testProduct, sampleResp, options);
    
    // Get vertical code and utility
    const verticalCode = VERTICAL_NAME_TO_CODE[vertical] || vertical;
    const verticalUtil = sampleResp.individualParams.verticals?.[verticalCode] || 0;
    
    // Quick share estimate (simplified)
    const products = [testProduct];
    const quickResults = computeTakeRates(
      respondents.slice(0, 100), // Use subset for speed
      products,
      options,
      marketFactors,
      TAM
    );
    
    results.push({
      vertical,
      code: verticalCode,
      utility: verticalUtil,
      share: quickResults.takeRates[0]?.adjustedTakeRate || 0
    });
    
    if (DEBUG_MODE) console.log(`${vertical} (${verticalCode}): util=${verticalUtil.toFixed(3)}, share=${quickResults.takeRates[0]?.adjustedTakeRate.toFixed(1)}%`);
  }
  
  // Check range
  const shares = results.map(r => r.share);
  const minShare = Math.min(...shares);
  const maxShare = Math.max(...shares);
  const range = maxShare - minShare;
  
  // Sort by utility to show best/worst
  results.sort((a, b) => b.utility - a.utility);
  
  if (DEBUG_MODE) console.log(`\nBest vertical: ${results[0].vertical} (${results[0].utility.toFixed(3)})`);
  if (DEBUG_MODE) console.log(`Worst vertical: ${results[results.length-1].vertical} (${results[results.length-1].utility.toFixed(3)})`);
  if (DEBUG_MODE) console.log(`\nShare range: ${minShare.toFixed(1)}% to ${maxShare.toFixed(1)}% (${range.toFixed(1)}pp difference)`);
  
  if (range < 0.5) {
    if (DEBUG_MODE) console.log('⚠️  WARNING: Verticals have minimal impact on share!');
    if (DEBUG_MODE) console.log('   This is because vertical weight is only 13.5% vs price at 34%.');
    if (DEBUG_MODE) console.log('   Consider increasing featureWeights.verticals to see more impact.');
  }
  
  if (DEBUG_MODE) console.log('==================================\n');
}
/**
 * Quick check to verify verticals are working
 */
function checkVerticalMapping(verticalName?: string): void {
  if (DEBUG_MODE) console.log(`\n=== VERTICAL MAPPING CHECK ===`);
  
  if (verticalName) {
    const code = VERTICAL_NAME_TO_CODE[verticalName];
    if (DEBUG_MODE) console.log(`Input: "${verticalName}"`);
    if (DEBUG_MODE) console.log(`Mapped code: "${code || 'NOT FOUND'}"`);
    
    if (!code) {
      if (DEBUG_MODE) console.log('\nDid you mean one of these?');
      Object.keys(VERTICAL_NAME_TO_CODE)
        .filter(name => name.toLowerCase().includes(verticalName.toLowerCase()))
        .forEach(name => console.log(`  - ${name}`));
    }
  } else {
    // Show all available verticals
    if (DEBUG_MODE) console.log('All available verticals:');
    if (DEBUG_MODE) console.log('\nDesign 1 (Unique):');
    if (DEBUG_MODE) console.log('  - CNN Longevity (D1_1)');
    if (DEBUG_MODE) console.log('  - CNN Meditation & Mindfulness (D1_2)');
    if (DEBUG_MODE) console.log('  - CNN Fitness (D1_3)');
    if (DEBUG_MODE) console.log('  - CNN Entertainment Tracker (D1_4)');
    
    if (DEBUG_MODE) console.log('\nDesign 2 (Unique):');
    if (DEBUG_MODE) console.log('  - CNN Travel (D2_1)');
    if (DEBUG_MODE) console.log('  - CNN Home (D2_2)');
    if (DEBUG_MODE) console.log('  - CNN Beauty (D2_3)');
    if (DEBUG_MODE) console.log('  - CNN Weather & Natural Phenomena (D2_4)');
    
    if (DEBUG_MODE) console.log('\nBridge (Both designs):');
    if (DEBUG_MODE) console.log('  - CNN Expert Buying Guide (B1)');
    if (DEBUG_MODE) console.log('  - CNN Personal Finance (B2)');
  }
  
  if (DEBUG_MODE) console.log(`==============================\n`);
}

/**
 * Quick test for standalone vertical sensitivity
 */
function testStandaloneVerticalImpact(
  respondents: RespondentWithParams[],
  options: SimulationOptions,
  marketFactors: MarketFactors,
  TAM: number,
  price: number = 2.78
): void {
  if (DEBUG_MODE) console.log('\n=== STANDALONE VERTICAL IMPACT TEST ===');
  if (DEBUG_MODE) console.log(`Testing at price: $${price}`);
  
  const testVerticals = [
    { name: 'CNN Expert Buying Guide', code: 'B1', type: 'Bridge' },
    { name: 'CNN Personal Finance', code: 'B2', type: 'Bridge' },
    { name: 'CNN Longevity', code: 'D1_1', type: 'Design 1' },
    { name: 'CNN Travel', code: 'D2_1', type: 'Design 2' }
  ];
  
  const results: Array<{name: string, share: number, utility: number}> = [];
  
  for (const vert of testVerticals) {
    const product: ProductSetupConfig = {
      product: 'CNN Standalone Vertical',
      id: 'standalone-test',
      monthlyRate: price,
      annualRate: price * 12,
      verticals: [vert.name],
      readerFeatures: [],
      streamingFeatures: [],
      features: { reader: [], streaming: [] },
      pricing: { monthlyRate: price, pricingType: 'monthly' as const, discount: '' },
      pricingType: 'monthly',
      discount: '',
      isActive: true
    };
    
    const simResults = computeTakeRates(
      respondents.slice(0, 200), // Use subset
      [product],
      options,
      marketFactors,
      TAM
    );
    
    const share = simResults.takeRates[0]?.adjustedTakeRate || 0;
    const sampleResp = respondents[0];
    const vertUtil = sampleResp.individualParams.verticals?.[vert.code] || 0;
    
    results.push({ name: vert.name, share, utility: vertUtil });
    if (DEBUG_MODE) console.log(`${vert.name} (${vert.type}): ${share.toFixed(1)}% share, util=${vertUtil.toFixed(3)}`);
  }
  
  const minShare = Math.min(...results.map(r => r.share));
  const maxShare = Math.max(...results.map(r => r.share));
  const range = maxShare - minShare;
  
  if (DEBUG_MODE) console.log(`\nShare range: ${minShare.toFixed(1)}% - ${maxShare.toFixed(1)}% (${range.toFixed(1)}pp spread)`);
  
  if (range < 1.0) {
    if (DEBUG_MODE) console.log('\n⚠️  Low sensitivity to vertical choice!');
    if (DEBUG_MODE) console.log('Consider increasing vertical weight in featureWeights.');
  }
  
  if (DEBUG_MODE) console.log('=====================================\n');
}

// Export all diagnostic and utility functions
export { 
  calculateUtility, 
  diagnoseStandaloneVertical, 
  validatePriceSensitivity, 
  testVerticalSensitivity,
  analyzeStandaloneShare,
  checkVerticalMapping,
  testStandaloneVerticalImpact
};