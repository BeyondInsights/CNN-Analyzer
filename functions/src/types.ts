// functions/src/types.ts

// Product Configuration
export interface ProductSetupConfig {
  id: string;
  product: string;
  verticals?: string[];
  readerFeatures?: string[];
  streamingFeatures?: string[];
  monthlyRate: number;
  annualRate?: number; 
  discount?: string; 
  isActive: boolean;
  pricingType?: 'monthly' | 'annual' | 'both';
  pricingTier?: number; 
  excluded?: boolean; 
}

// Report Types
export interface ReportData {
  reportType: ReportType;
  outputType: OutputType;
  overallShare: number[];
  anyProductShare?: number; 
  segmentShares: ReportDataSegment[];
  products: Array<{ id: string; name: string; config: ProductSetupConfig }>; 
  data: Array<{ 
    group: string;
    rows: ReportDataRow[];
  }>;
  subgroupCounts?: Array<{ segmentName: string; count: number; weightedCount: number }>; 
}

export interface ReportDataSegment {
  segmentName: string;
  shares: number[];
  anyProductShare?: number; 
  rows?: ReportDataRow[]; 
}

export type ReportType = 'tiered' | 'independent';
export type OutputType = 'percentage' | 'count' | 'revenue';

// Interface for individual respondent utility data
export interface RespondentUtility {
  respondentId: string;  
  weight: number;        
  base: {
    reader?: number;
    streaming?: number;
    allAccess?: number;
    standalone?: number;
  };
  price: {
    linear?: number;
    squared?: number;
  };
  verticals?: Record<string, number>;
  [key: string]: unknown; // Changed from any to unknown
}


export type RespondentUtilitiesMap = Record<string, RespondentUtility>;

export interface ProductProfileData {
  [productName: string]: {
    verticals: string[];
    features: string[];
    monthlyPrice: number;
    annualPrice: number;
    
    metrics?: Array<{ category: string; metric: string; value: string | number }>;
  };
}

// Sensitivity Analysis
export interface SensitivityPoint {
  variation: number; 
  price: number;
  takeRate: number; 
}

// Market Factors
export interface MarketFactors {
  awareness: number;
  distribution: number;
  competitive: number;
  marketing: number;
  baseConversion?: number;
  yearOneAdoption: number;
  lowPriceMultiplier: number;
  highPriceMultiplier: number;
  priceThreshold: number;
  enablePriceSensitivity: boolean;
  priceThresholdAdjustment: number;
  
  awarenessWeight?: number;
  distributionWeight?: number;
  competitiveWeight?: number;
  marketingWeight?: number;
  yearOneWeight?: number;
}

// Market Factor Weights
export interface MarketFactorWeights {
  awarenessWeight: number;
  distributionWeight: number;
  competitiveWeight: number;
  marketingWeight: number;
  yearOneWeight: number;
}

// Simulation Options
export interface SimulationOptions {
  enablePriceTiers: boolean;
  priceTierThreshold: number; 
  lowPriceMultiplier: number;
  highPriceMultiplier: number;
  allocationMethod?: 'proportional' | 'winner-takes-all'; 
  takeThreshold?: number; 
  priceThreshold?: number; 
}

// Respondent Types
export interface RespondentWithParams {
  respondentId: string;
  weight: number;
  drn: number;
  gender?: string;
  ageGroup?: string;
  individualParams: {
    base: Record<string, number>;
    price: { linear: number; squared: number };
    verticals: Record<string, number>;
    verticalCount: Record<string, number>;
    features?: Record<string, Record<string, number>>;
    featureCounts?: { 
      reader?: Record<string, number>;
      streaming?: Record<string, number>;
    };
    subscription?: Record<string, number>; 
  };
}

// Input Config
export interface InputConfig {
  simulationId: string;
  products: ProductSetupConfig[];
  selectedSegments: string[];
  marketFactors?: MarketFactors;
  options?: SimulationOptions;
  TAM?: number;
}

// Take Rate Results
export interface TakeRate {
  productName: string;
  takeRate: number;
  adjustedTakeRate?: number;
  subscribers: number;
  revenue: number;
}

// Define the structure for a single segment's results
export interface SegmentResultItem {
  takeRates: TakeRate[];
  totalSubscribers: number;
  totalRevenue: number;
}

// Define SegmentResults as a record
export type SegmentResults = Record<string, SegmentResultItem>;

// Simulation Results
export interface SimulationResults {
  takeRates: TakeRate[];
  segmentResults?: SegmentResults; 
  diagnostics?: {
    totalRespondents?: number; 
    totalWeight?: number; 
    marketAdjustmentFactor: number;
    averageDRN: number;
  };
}

// Report Results
export interface ReportResults {
  productConfigs?: ProductConfig[];
  takeRates: TakeRate[];
  segmentShares: Record<string, number[]>;
}

// Product Config (for backwards compatibility)
export interface ProductConfig {
  productName: string;
  price: number;
  features: string[];
  verticals: string[];
  subTerm?: string;
}

// Market Factor Settings (for modal)
export interface MarketFactorSettings {
  baseConversion: number;
  awareness: number;
  distribution: number;
  competitive: number;
  marketing: number;
  yearOneAdoption?: number;
  enablePriceSensitivity?: boolean;
}

// For the actual return type of actions.ts/getProductProfile
export interface ProductProfileResult {
  productName?: string; 
  description?: string; 
  targetAudience?: string; 
  keyFeatures?: string[]; 
  pricing?: { monthlyRate: number }; 

  baseTakeRate: number;
  marketAdjustedRate: number;
  estimatedSubscribers: number;
  estimatedRevenue: number;
}

// For the actual return type of actions.ts/runPriceSensitivityAnalysis
export interface ActionSensitivityPoint {
  priceMultiplier: number;
  takeRates: number[]; 
}

export type SimulationState = 'idle' | 'validating' | 'running' | 'complete' | 'error';

// Added: Definition for ReportDataRow
export interface ReportDataRow {
  name: string;
  values: Record<string, number>;
  indent: number;
}
