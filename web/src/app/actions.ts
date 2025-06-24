'use server';
const DEBUG_MODE = false;
import { cert, initializeApp, getApps } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import '@/lib/firebaseAdmin';
import type { 
  ProductSetupConfig, 
  ReportData, 
  ReportDataSegment,
  ReportType,
  OutputType, 
  ProductProfileData,
  SensitivityPoint, 
  MarketFactors,
  SimulationOptions 
} from '@/lib/types';
import { computeTakeRates } from '@/lib/calculations';
import { DEMOGRAPHIC_SEGMENTS } from '@/lib/constants';
import fs from 'fs/promises';
import path from 'path';

// Interface definitions
interface RespondentUtility {
  Respondent_ID: string;
  Weight: number;
  Base_Reader?: number;
  Base_Streaming?: number;
  Base_AllAccess?: number;
  Base_Standalone?: number;
  Price_Linear?: number;
  Price_Squared?: number;
  [key: string]: any;
}

interface ModelParameter {
  Parameter: string;
  Value: number;
  Notes: string;
}

interface DemographicData {
  Respondent_ID: string;
  Gender?: string;
  Age_Group?: string;
  Political?: string;
  CNN_Access?: string;
  News_Subs?: number;
  Linear_TV?: string;
  Ad_Preference?: string;
  SG?: number;
  hAgeRecode?: number;
  SE?: number;
  SI?: number;
  S201?: number;
  S214?: number;
  TV5a06?: number;
  TV5b06?: number;
  N312?: number;
  N4_loop_13_N4?: number;
  [key: string]: any;
}

interface RespondentWithParams {
  respondentId: string;
  weight: number;
  demographics?: DemographicData;
  drn?: number;
  individualParams: {
    base: Record<string, number>;
    price: {
      linear: number;
      squared: number;
    };
    all_features?: any;
    features?: any;
    verticals?: any;
    verticalCount?: any;
    subscription?: any;
    featureCounts?: any;
  };
}

// Constants
const HHI_BANDS: Record<string, { name: string; lower: number; upper: number; width: number }> = {
  '1': { name: "Less than $35,000", lower: 0, upper: 34999, width: 34999 },
  '2': { name: "$35,000 to $49,999", lower: 35000, upper: 49999, width: 14999 },
  '3': { name: "$50,000 to $74,999", lower: 50000, upper: 74999, width: 24999 },
  '4': { name: "$75,000 to $99,999", lower: 75000, upper: 99999, width: 24999 },
  '5': { name: "$100,000 to $124,999", lower: 100000, upper: 124999, width: 24999 },
  '6': { name: "$125,000 to $149,999", lower: 125000, upper: 149999, width: 24999 },
  '7': { name: "$150,000 to $199,999", lower: 150000, upper: 199999, width: 49999 },
  '8': { name: "$200,000 to $299,999", lower: 200000, upper: 299999, width: 99999 },
  '9': { name: "$300,000 or more", lower: 300000, upper: Infinity, width: Infinity }
};

async function loadJsonData<T>(filename: string): Promise<T> {
  const firebaseFiles = ['a7b9c2d1.json', 'c9d4e7f1.json', 'e5f8a3b2.json'];
  
  if (firebaseFiles.includes(filename)) {
    // Load from Firebase Storage
    const storage = getStorage();
    const bucket = storage.bucket('cnn-analyzer.firebasestorage.app');
    const file = bucket.file(`data/${filename}`);
    const [contents] = await file.download();
    return JSON.parse(contents.toString()) as T;
  } else {
    // Load locally (modelParameters.json, drnRates.json, etc.)
    const filePath = path.join(process.cwd(), 'src', 'data', filename);
    const fileContents = await fs.readFile(filePath, 'utf8');
    return JSON.parse(fileContents) as T;
  }
}

export async function runServerSimulation(
  activeProducts: ProductSetupConfig[],
  reportType: ReportType,
  outputType: OutputType,
  marketFactors: MarketFactors,
  simulationOptions: SimulationOptions
): Promise<ReportData | null> {
  if (DEBUG_MODE) console.log("Starting runServerSimulation with:", {
    productCount: activeProducts.length,
    reportType,
    outputType,
    marketFactors
  });

  try {
    // Validate inputs
    if (!activeProducts || activeProducts.length === 0) {
      if (DEBUG_MODE) console.error('No active products provided');
      return null;
    }
    
    if (!reportType || !outputType) {
      if (DEBUG_MODE) console.error('Missing report type or output type');
      return null;
    }

    // Load the data files
    const respondentUtilities = await loadJsonData<RespondentUtility[]>('a7b9c2d1.json');
    const demographicsDataRaw = await loadJsonData<any>('c9d4e7f1.json');
    const demographicsData = Array.isArray(demographicsDataRaw) 
      ? demographicsDataRaw 
      : Object.values(demographicsDataRaw);
    const modelParametersList = await loadJsonData<ModelParameter[]>('modelParameters.json');
    const drnRates = await loadJsonData<any>('drnRates.json');
    
    // Convert model parameters to map
    const modelParams: Record<string, number> = {};
    modelParametersList.forEach(p => { 
      modelParams[p.Parameter] = p.Value; 
    });

    const TOTAL_TAM = modelParams['Total_TAM'] || 105624640;

    if (DEBUG_MODE) console.log("Loaded data:", {
      respondentCount: respondentUtilities.length,
      demographicsCount: demographicsData.length,
      TAM: TOTAL_TAM
    });

    // Transform to format calculations.ts expects
    const respondentsWithParams: RespondentWithParams[] = respondentUtilities.map(resp => {
      const demo = demographicsData.find(d => String(d.Respondent_ID) === String(resp.Respondent_ID));
      
      return {
        respondentId: resp.Respondent_ID,
        weight: resp.Weight || 1,
        demographics: demo,
        drn: drnRates[resp.Respondent_ID] || 0.85,
        individualParams: {
          base: {
            'CNN Reader': resp.Base_Reader || 0,
            'CNN Streaming': resp.Base_Streaming || 0,
            'CNN All-Access': resp.Base_AllAccess || 0,
            'CNN Standalone Vertical': resp.Base_Standalone || 0
          },
          price: {
            linear: resp.Price_Linear || -1.08,
            squared: resp.Price_Squared || -0.007
          },
          all_features: resp.all_features,
          features: resp.features,
          verticals: resp.verticals,
          verticalCount: resp.verticalCount,
          subscription: resp.subscription,
          featureCounts: resp.featureCounts
        }
      };
    });

    
    // Add calculateSegments option to simulationOptions
    const enhancedSimulationOptions = {
      ...simulationOptions,
      calculateSegments: true
    };

    // Run the simulation - PASS reportType as the last parameter!
    const results = computeTakeRates(
      respondentsWithParams,
      activeProducts,
      simulationOptions,
      marketFactors,
      TOTAL_TAM,
      drnRates,
      reportType  // ← ADD THIS PARAMETER!
    );

    if (DEBUG_MODE) console.log('Simulation results:', {
      takeRatesCount: results.takeRates.length,
      segmentCount: Object.keys(results.segmentResults || {}).length,
      anyProductRate: results.anyProductRate,
      segmentNames: Object.keys(results.segmentResults || {})
    });
    
    // Transform results to match ReportData format
    const allExpectedSegments = DEMOGRAPHIC_SEGMENTS.flatMap(g => g.segments);
    
    if (reportType === 'tiered') {
      // Use the properly calculated ANY PRODUCT rate
      const anyProductShare = results.anyProductRate || 0;
      
      // Build the shares array with ANY PRODUCT first
      const tieredShares = outputType === 'percentage' 
        ? [anyProductShare, ...results.takeRates.map(tr => tr.adjustedTakeRate)]
        : outputType === 'count'
        ? [Math.round((anyProductShare / 100) * TOTAL_TAM), ...results.takeRates.map(tr => tr.subscribers)]
        : [Math.round((anyProductShare / 100) * TOTAL_TAM * 12), ...results.takeRates.map(tr => tr.revenue)];
      
      // Build segment shares for ALL expected segments
      const tieredSegmentShares: ReportDataSegment[] = allExpectedSegments.map(segmentName => {
        const segmentData = results.segmentResults?.[segmentName];
        
        let shares: number[];
        if (segmentData) {
          const anyProductSegmentShare = segmentData.anyProductRate || 0;
          if (outputType === 'percentage') {
            shares = [anyProductSegmentShare, ...segmentData.takeRates.map(tr => tr.adjustedTakeRate)];
          } else if (outputType === 'count') {
            shares = [
              Math.round((anyProductSegmentShare / 100) * TOTAL_TAM),
              ...segmentData.takeRates.map(tr => tr.subscribers)
            ];
          } else { // revenue
            shares = [
              Math.round((anyProductSegmentShare / 100) * TOTAL_TAM * 12),
              ...segmentData.takeRates.map(tr => tr.revenue)
            ];
          }
        } else {
          // No data for this segment - fill with zeros
          shares = new Array(tieredShares.length).fill(0);
        }
        
        return {
          segmentName: segmentName,
          shares: shares
        };
      });
      
      return {
        reportType,
        outputType,
        overallShare: tieredShares,
        segmentShares: tieredSegmentShares
      };
    } else {
      // For matrix/independent products
      const overallShare = results.takeRates.map(tr => 
        outputType === 'percentage' ? tr.adjustedTakeRate :
        outputType === 'count' ? tr.subscribers :
        tr.revenue
      );

      // Build segment shares for ALL expected segments
      const segmentShares: ReportDataSegment[] = allExpectedSegments.map(segmentName => {
        const segmentData = results.segmentResults?.[segmentName];
        
        return {
          segmentName: segmentName,
          shares: segmentData 
            ? segmentData.takeRates.map(tr => 
                outputType === 'percentage' ? tr.adjustedTakeRate :
                outputType === 'count' ? tr.subscribers :
                tr.revenue
              )
            : new Array(activeProducts.length).fill(0)
        };
      });

      return {
        reportType,
        outputType,
        overallShare,
        segmentShares
      };
    }
  } catch (error) {
    if (DEBUG_MODE) console.error('[ERROR] runServerSimulation failed:', error);
    throw error;
  }
}

export async function getProductProfile(productConfig: ProductSetupConfig): Promise<ProductProfileData | null> {
  try {
    const respondentUtilities = await loadJsonData<RespondentUtility[]>('a7b9c2d1.json');
    const respondentProfilesObj = await loadJsonData<any>('e5f8a3b2.json');
    
    // Convert object to array so .find() will work
    const demographicsData = Array.isArray(respondentProfilesObj) 
      ? respondentProfilesObj 
      : Object.entries(respondentProfilesObj).map(([id, data]) => ({
          Respondent_ID: id,
          ...(data as any)
        }));
    
    const modelParametersList = await loadJsonData<ModelParameter[]>('modelParameters.json');
    const modelParams: Record<string, number> = {};
    modelParametersList.forEach(p => { modelParams[p.Parameter] = p.Value; });
    const TOTAL_TAM = modelParams['Total_TAM'] || 105624640;
    
    let productChoosersWeightedProbabilities: { demo: DemographicData, prob: number, weight: number }[] = [];
    let totalWeightedProbabilitySumForProduct = 0;

    for (const respUtil of respondentUtilities) { 
      let utility = 0;
      switch (productConfig.product) {
        case 'CNN Reader': utility += respUtil.Base_Reader || 0; break;
        case 'CNN Streaming': utility += respUtil.Base_Streaming || 0; break;
        case 'CNN All-Access': utility += respUtil.Base_AllAccess || 0; break;
        case 'CNN Standalone Vertical': utility += respUtil.Base_Standalone || 0; break;
      }
      const lnPrice = Math.log(productConfig.monthlyRate);
      utility += (respUtil.Price_Linear || 0) * lnPrice;
      if (respUtil.Price_Squared) utility += (respUtil.Price_Squared || 0) * lnPrice * lnPrice;
      const probability = 1 / (1 + Math.exp(-utility));
      const weight = respUtil.Weight || 1;
      const demo = demographicsData.find(d => d.Respondent_ID === respUtil.Respondent_ID);
      if (demo) {
        productChoosersWeightedProbabilities.push({ demo, prob: probability, weight });
        totalWeightedProbabilitySumForProduct += probability * weight;
      }
    } 
    
    const totalWeightSum = productChoosersWeightedProbabilities.reduce((sum, item) => sum + item.weight, 0);
    const overallChooserBase = totalWeightSum > 0 ? totalWeightedProbabilitySumForProduct / totalWeightSum * TOTAL_TAM : 0;
    
    const profileMetrics: Array<{ profile: string; variable: string; value: string }> = [];
    
    profileMetrics.push({ profile: "Overall", variable: "Population Size (Est.)", value: overallChooserBase.toLocaleString(undefined, { maximumFractionDigits: 0 }) });
    profileMetrics.push({ profile: "Overall", variable: "TAM Proportion (%)", value: (overallChooserBase / TOTAL_TAM * 100).toFixed(1) });
    profileMetrics.push({ profile: "Overall", variable: "Est. Yr 1 Revenue ($)", value: (overallChooserBase * productConfig.monthlyRate * 12).toLocaleString(undefined, { maximumFractionDigits: 0, style: 'currency', currency: 'USD' }) });
    
    const calculateSegmentPercentage = (filterFn: (demo: DemographicData) => boolean, variableName: string) => {
      let segmentWeightedProbSum = 0;
      productChoosersWeightedProbabilities.forEach(item => {
        if (filterFn(item.demo)) { segmentWeightedProbSum += item.prob * item.weight; }
      });
      return totalWeightedProbabilitySumForProduct > 0 ?
        (segmentWeightedProbSum / totalWeightedProbabilitySumForProduct * 100).toFixed(1) : "0.0";
    };

    profileMetrics.push({ profile: "Gender: Male", variable: "Composition (%)", value: calculateSegmentPercentage(d => d.SG === 1, "SG") });
    profileMetrics.push({ profile: "Gender: Female", variable: "Composition (%)", value: calculateSegmentPercentage(d => d.SG === 2, "SG") });
    profileMetrics.push({ profile: "Age: 18-34", variable: "Composition (%)", value: calculateSegmentPercentage(d => d.hAgeRecode === 1, "hAgeRecode") });
    profileMetrics.push({ profile: "Age: 35-54", variable: "Composition (%)", value: calculateSegmentPercentage(d => d.hAgeRecode === 2, "hAgeRecode") });
    profileMetrics.push({ profile: "Age: 55-74", variable: "Composition (%)", value: calculateSegmentPercentage(d => d.hAgeRecode === 3, "hAgeRecode") });
    profileMetrics.push({ profile: "Regularly Access CNN", variable: "Composition (%)", value: calculateSegmentPercentage(d => [1, 2, 3].includes(Number(d.S214)), "S214") });
    profileMetrics.push({ profile: "Digital News Subscriber", variable: "Composition (%)", value: calculateSegmentPercentage(d => Number(d.N312) >= 1, "N312") });
    profileMetrics.push({ profile: "Have Linear TV", variable: "Composition (%)", value: calculateSegmentPercentage(d => d.TV5a06 === 1 || d.TV5b06 === 1, "TV5a06") });
    
    return {
      productName: productConfig.product,
      description: `${productConfig.product} subscription service`,
      targetAudience: 'News enthusiasts',
      keyFeatures: [
        ...productConfig.readerFeatures.map(f => `Reader: ${f}`),
        ...productConfig.streamingFeatures.map(f => `Streaming: ${f}`),
        ...productConfig.verticals.map(v => `Vertical: ${v}`)
      ],
      configuration: {
        readerFeatures: productConfig.readerFeatures,
        streamingFeatures: productConfig.streamingFeatures,
        verticals: productConfig.verticals
      },
      pricing: {
        monthlyRate: productConfig.monthlyRate,
        annualRate: productConfig.annualRate,
        pricingType: productConfig.pricingType || 'monthly',
        discount: productConfig.discount || 'none'
      }
    };
  } catch (error) {
    if (DEBUG_MODE) console.error("getProductProfile Error:", error);
    return null;
  }
}

// Price Sensitivity Analysis with TIERED elasticity
export async function runPriceSensitivityAnalysis(
  product: any,
  priceVariations: number[],
  marketFactors: MarketFactors,
  userId: string
) {
  const results = [];
  const basePrice = product.monthlyRate;
 
  // TIERED ELASTICITY FUNCTION - ADD THIS
  function getPriceElasticity(price: number): number {
    if (price < 5) {
      return -2.0;  // Very elastic: budget shoppers are very price sensitive
    } else if (price < 10) {
      return -1.5;  // Moderately elastic
    } else if (price < 15) {
      return -1.2;  // Standard elasticity (your current default)
    } else if (price < 20) {
      return -0.8;  // Less elastic: willing to pay more, less sensitive
    } else {
      return -0.5;  // Premium tier: least price sensitive
    }
  }
 
  for (const variation of priceVariations) {
    const priceMultiplier = 1 + (variation / 100);
    const testPrice = basePrice * priceMultiplier;
   
    // GET ELASTICITY BASED ON TEST PRICE - THIS IS THE KEY CHANGE
    const priceElasticity = getPriceElasticity(testPrice);
    
    // Log for debugging
    if (DEBUG_MODE) console.log(`Price: $${testPrice.toFixed(2)}, Using elasticity: ${priceElasticity}`);
   
    // Calculate adoption impact using price elasticity
    const adoptionImpact = 1 + (priceElasticity * (variation / 100));
   
    // Apply market factors with price sensitivity
    let finalAdoptionRate: number = marketFactors.baseConversion ?? 1.0;
   
    // Apply awareness factor
    finalAdoptionRate *= (1 + (marketFactors.awareness - 50) / 100 * (marketFactors.awarenessWeight || 30));

    // Apply distribution factor
    finalAdoptionRate *= (1 + (marketFactors.distribution - 50) / 100 * (marketFactors.distributionWeight || 25));

    // Apply competitive factor
    finalAdoptionRate *= (1 + (marketFactors.competitive - 50) / 100 * (marketFactors.competitiveWeight || 10));

    // Apply marketing factor
    finalAdoptionRate *= (1 + (marketFactors.marketing - 50) / 100 * (marketFactors.marketingWeight || 15));

    // Apply year one adoption factor
    finalAdoptionRate *= (1 + (marketFactors.yearOneAdoption - 50) / 100 * (marketFactors.yearOneWeight || 20));
   
    // Apply price sensitivity impact
    finalAdoptionRate *= adoptionImpact;
   
    // Ensure rate stays within reasonable bounds (0.1% to 25%)
    finalAdoptionRate = Math.max(0.1, Math.min(25, finalAdoptionRate));
   
    // Run simulation with the test price
    const testProduct = {
      ...product,
      monthlyRate: testPrice,
      yearlyRate: testPrice * 12 * (product.pricingType === 'annual' ? 0.85 : 1)
    };
   
   const simulationResult = await runServerSimulation(
  [testProduct],
  'independent',
  'percentage',
  {
    ...marketFactors,
    baseConversion: finalAdoptionRate
  },
  {
    takeThreshold: 0.01,
    drnFactor: 1.0,
    allocationMethod: 'proportional'
  }
);

// Add this null check
if (!simulationResult) {
  console.error('Simulation returned null for price variation:', variation);
  continue; // Skip this iteration
}

results.push({
  priceVariation: variation,
  testPrice,
  adoptionRate: finalAdoptionRate,
  adoptionImpact: ((adoptionImpact - 1) * 100).toFixed(1),
  sharePercentage: simulationResult.overallShare?.[0] || 0,
  estimatedRevenue: (simulationResult.overallShare?.[0] || 0) * testPrice * 12 / 100,
  elasticityUsed: priceElasticity
});
  }
 
  return {
    productName: product.product || product.name || 'Unknown',
    basePrice,
    results,
    optimalPrice: results.reduce((optimal, current) =>
      current.estimatedRevenue > optimal.estimatedRevenue ? current : optimal
    ).testPrice
  };  // <-- closes the return object
}  // <-- closes the function