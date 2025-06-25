'use server';

import fs from 'fs/promises';
import path from 'path';
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
import { DEMOGRAPHIC_SEGMENTS } from '@/lib/constants';
import { computeTakeRates } from '@/lib/calculations';

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

// Helper function to load JSON data files
async function loadJsonData<T>(filename: string): Promise<T> {
  const filePath = path.join(process.cwd(), 'src', 'data', filename);
  try {
    const fileContents = await fs.readFile(filePath, 'utf8');
    return JSON.parse(fileContents) as T;
  } catch (error) {
    console.error(`Error loading ${filename}:`, error);
    throw new Error(`Could not load data file: ${filename}`);
  }
}

export async function runServerSimulation(
  activeProducts: ProductSetupConfig[],
  reportType: ReportType,
  outputType: OutputType,
  marketFactors: MarketFactors,
  simulationOptions: SimulationOptions
): Promise<ReportData | null> {
  console.log("[DEBUG] Starting runServerSimulation with:", {
    productCount: activeProducts.length,
    reportType,
    outputType,
    marketFactors
  });

  try {
    // Validate inputs
    if (!activeProducts || activeProducts.length === 0) {
      throw new Error("No products provided for simulation");
    }
    
    if (!reportType || !outputType) {
      throw new Error("Missing report type or output type");
    }

    // Load the data files
    const respondentUtilities = await loadJsonData<RespondentUtility[]>('a7b9c2d1.json');
    const demographicsData = await loadJsonData<DemographicData[]>('c9d4e7f1.json');
    const modelParametersList = await loadJsonData<ModelParameter[]>('modelParameters.json');
    const drnRates = await loadJsonData<any>('drnRates.json');
    
    // Convert model parameters to map
    const modelParams: Record<string, number> = {};
    modelParametersList.forEach((p: ModelParameter) => {
      modelParams[p.Parameter] = p.Value;
    });

    const TOTAL_TAM = modelParams['Total_TAM'] || 105624640;

    console.log("[DEBUG] Loaded data:", {
      respondentCount: respondentUtilities.length,
      demographicsCount: demographicsData.length,
      TAM: TOTAL_TAM
    });

    // Transform to format calculations.ts expects
    const respondentsWithParams: RespondentWithParams[] = respondentUtilities.map(resp => {
      const demo = demographicsData.find((d: DemographicData) => d.Respondent_ID === resp.Respondent_ID);
      
      return {
        respondentId: resp.Respondent_ID,
        weight: resp.Weight,
        demographics: demo,
        drn: 0.85, // Default DRN
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
          all_features: {},
          features: {},
          verticals: {},
          verticalCount: {},
          subscription: {},
          featureCounts: {}
        }
      };
    });

    // Add calculateSegments option to simulationOptions
    const enhancedSimulationOptions = {
      ...simulationOptions,
      calculateSegments: true
    };

    // Run the simulation
    const results = computeTakeRates(
      respondentsWithParams,
      activeProducts,
      enhancedSimulationOptions,
      marketFactors,
      TOTAL_TAM,
      drnRates,
      reportType
    );

    console.log('[DEBUG] Simulation results:', {
      takeRatesCount: results.takeRates.length,
      segmentCount: Object.keys(results.segmentResults || {}).length,
      anyProductRate: results.anyProductRate,
      segmentNames: Object.keys(results.segmentResults || {})
    });
    
    // Transform results to match ReportData format
    const allExpectedSegments = DEMOGRAPHIC_SEGMENTS.flatMap(g => g.segments);
    
    const segmentSharesArray: ReportDataSegment[] = allExpectedSegments.map(segmentName => {
      const segmentData = results.segmentResults?.[segmentName];
      
      if (segmentData) {
        const shares = activeProducts.map((_, index) => {
          const takeRate = segmentData.takeRates[index];
          return outputType === 'percentage' 
            ? takeRate?.adjustedTakeRate || 0
            : takeRate?.subscribers || 0;
        });
        
        return {
          segmentName,
          shares
        };
      } else {
        // Return zero shares for missing segments
        return {
          segmentName,
          shares: new Array(activeProducts.length).fill(0)
        };
      }
    });

    const overallShares = activeProducts.map((_, index) => {
      const takeRate = results.takeRates[index];
      return outputType === 'percentage' 
        ? takeRate?.adjustedTakeRate || 0
        : takeRate?.subscribers || 0;
    });

    return {
      overallShare: overallShares,
      segmentShares: segmentSharesArray,
      reportType,
      outputType
    };
    
  } catch (error) {
    console.error('Simulation error:', error);
    throw new Error(`Simulation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getProductProfile(productConfig: ProductSetupConfig): Promise<ProductProfileData | null> {
  try {
    return {
      productName: productConfig.product,
      description: `${productConfig.product} subscription product`,
      targetAudience: "Target demographic for this product",
      keyFeatures: [
        ...productConfig.readerFeatures || [],
        ...productConfig.streamingFeatures || [],
        ...productConfig.verticals || []
      ],
      pricing: {
        monthlyRate: productConfig.monthlyRate,
        annualRate: productConfig.monthlyRate * 12,
        pricingType: productConfig.pricingType || 'monthly',
        discount: productConfig.discount || ''
      },
      configuration: {
        verticals: productConfig.verticals || [],
        readerFeatures: productConfig.readerFeatures || [],
        streamingFeatures: productConfig.streamingFeatures || []
      }
    };
  } catch (error) {
    console.error('Error generating product profile:', error);
    return null;
  }
}

export async function runPriceSensitivityAnalysis(
  product: any,
  priceVariations: number[],
  reportType: string,
  outputType: string,
  marketFactors: any
): Promise<SensitivityPoint[]> {
  const basePrice = product.monthlyRate;
  const results: SensitivityPoint[] = [];
  
  // Run simulation for each price point
  for (const variation of priceVariations) {
    const newPrice = basePrice * (1 + variation / 100);
    
    // Create modified product config with new price
    const modifiedConfig = {
      ...product,
      monthlyRate: newPrice
    };
    
    // For now, return mock data
    const baseAdoption = 15;
    const priceElasticity = -1.2;
    const adoptionRate = baseAdoption * Math.pow((newPrice / basePrice), priceElasticity);
    
    results.push({
      priceVariation: variation,
      testPrice: Number(newPrice.toFixed(2)),
      adoptionRate: Number(Math.max(0, Math.min(100, adoptionRate)).toFixed(1)),
      adoptionImpact: `${variation > 0 ? '+' : ''}${variation}%`,
      sharePercentage: Number(Math.max(0, Math.min(100, adoptionRate)).toFixed(1)),
      estimatedRevenue: Math.round(Math.max(0, Math.min(100, adoptionRate)) / 100 * 105624640 * newPrice * 12),
      elasticityUsed: priceElasticity
    });
  }
  
  return results.sort((a, b) => a.priceVariation - b.priceVariation);
}
