// web/src/lib/types.ts

// Card and Product Configuration
export interface CardData {
  product: string;
  readerFeatures: string[];
  streamingFeatures: string[];
  verticals: string[];
  monthlyRate: number;
  pricingType: string;
  discount: string;
}

export interface ProductSetupConfig {
  id: string;
  product: string;
  monthlyRate: number;
  annualRate: number;
  verticals: string[];
  readerFeatures: string[];
  streamingFeatures: string[];
  features: {
    reader: string[];
    streaming: string[];
  };
  pricing: {
    monthlyRate: number;
    pricingType: string;
    discount: string;
  };
  pricingType: string;
  discount: string;
  isActive: boolean;
  excluded?: boolean;
  selectedReaderFeatures?: string[];
  selectedStreamingFeatures?: string[];
  selectedVerticals?: string[];
  dynamicPricing?: boolean;
}

// Report Types
export type ReportType = 'tiered' | 'independent' | 'bundle' | 'matrix';
export type OutputType = 'percentage' | 'count' | 'revenue';

export interface ReportDataSegment {
  segmentName: string;
  shares: number[];
}

export interface ReportData {
  reportType: ReportType;
  outputType: OutputType;
  overallShare: number[];
  segmentShares: ReportDataSegment[];
  products?: any[];
  anyProductShare?: number;
  monthlyPercentages?: number[];
  annualPercentages?: number[];
  metadata?: {
    runDate: string;
    products: number;
    reportType: string;
    outputType: string;
  };
  profiles?: Array<{
    productName: string;
    features: string[];
    pricing: {
      monthlyRate: number;
      annualRate: number;
    };
    metrics: Array<{
      profile: string;
      variable: string;
      value: string;
    }>;
  }>;
  summary?: {
    totalRevenue: number;
    totalSubscribers: number;
    averagePrice: number;
  };
  priceSensitivity?: {
    productName: string;
    basePrice: number;
    pricePoints: {
      priceVariation: number;
      price: number;
      adoptionRate: number;
    }[];
  }[];
}

export interface TakeRate {
  productName: string;
  takeRate: number;
  adjustedTakeRate: number;
  subscribers: number;
  revenue: number;
}

export interface SegmentResults {
  takeRates: TakeRate[];
  totalSubscribers: number;
  totalRevenue: number;
  anyProductRate?: number;
}

export interface SimulationResults {
  takeRates: TakeRate[];
  totalSubscribers: number;
  totalRevenue: number;
  avgDRN: number;
  segmentResults: Record<string, SegmentResults>;
  anyProductRate: number;
  overallTakeRates?: number[]; // For compatibility with SimulatorSection
  segmentTakeRates?: Record<string, number[]>; // For compatibility
  productNames?: string[]; // For compatibility
  reportType?: ReportType;
  outputType?: OutputType;
  diagnostics?: {
    totalRespondents: number;
    totalWeight: number;
    averageDRN: number;
    marketAdjustmentFactor: number;
  };
}

export interface MarketFactorSettings {
  scenario: string;
  awareness: number;
  distribution: number;
  competitive: number;
  marketing: number;
  yearOneAdoption: number;
  enablePriceSensitivity: boolean;
  lowPriceMultiplier: number;
  highPriceMultiplier: number;
  priceThreshold: number;
  // Weight properties:
  awarenessWeight?: number;
  distributionWeight?: number;
  competitiveWeight?: number;
  marketingWeight?: number;
  yearOneWeight?: number;
} // FIXED: Added missing closing brace

// Market Factors Interface
export interface MarketFactors {
  baseConversion?: number;
  awareness: number;
  distribution: number;
  competitive: number;
  marketing: number;
  yearOneAdoption: number;
  enablePriceSensitivity?: boolean;
  lowPriceMultiplier?: number;
  highPriceMultiplier?: number;
  priceThreshold?: number;
  // Add these weight properties
  awarenessWeight?: number;
  distributionWeight?: number;
  competitiveWeight?: number;
  marketingWeight?: number;
  yearOneWeight?: number;
}

// Simulation Options
export interface SimulationOptions {
  takeThreshold?: number;
  drnFactor?: number;
  allocationMethod?: 'proportional' | 'maxUtil' | 'firstChoice';
  enablePriceTiers?: boolean;
  priceThreshold?: number;
  lowPriceMultiplier?: number;
  highPriceMultiplier?: number;
  calculateSegments?: boolean; // ADDED
  // ADDED: Market weights for weighted average calculation
  marketWeights?: {
    awareness: number;
    distribution: number;
    competitive: number;
    marketing: number;
    yearOneAdoption: number;
  };
  featureWeights?: {
    base: number;
    price: number;
    verticals: number;
    features: number;
    subscription: number;
  };
  enablePriceDebug?: boolean;
}

// Input Configuration for Simulation
export interface InputConfig {
  products: ProductSetupConfig[];
  reportType: ReportType;
  outputType: OutputType;
  marketFactors: MarketFactors;
  simulationOptions: SimulationOptions;
}

// Product Profile Data
export interface ProductProfileData {
  productName: string;
  description?: string;
  targetAudience?: string;
  keyFeatures: string[];
  configuration: {
    readerFeatures: string[];
    streamingFeatures: string[];
    verticals: string[];
  };
  pricing: {
    monthlyRate: number;
    annualRate: number;
    pricingType?: string;
    discount?: string;
  };
}

// Sensitivity Analysis
export interface SensitivityPoint {
  priceVariation: number;
  testPrice: number;
  adoptionRate: number;
  adoptionImpact: string;
  sharePercentage: number;
  estimatedRevenue: number;
  elasticityUsed: number;
}

export interface ProductSensitivityData {
  productName: string;
  basePrice: number;
  pricePoints: {
    priceVariation: number;
    price: number;
    adoptionRate: number;
  }[];
  elasticityUsed: number;
}

// Report Results
export interface ReportResults {
  reportType: string;
  outputType: string;
  overallShare: number[];
  segmentShares: Array<{
    segmentName: string;
    shares: number[];
  }>;
}

// Pricing Range
export interface PricingRange {
  min: number;
  max: number;
  default: number;
  prices?: number[];
}

// Feature Descriptions
export interface FeatureDescriptions {
  [key: string]: string;
}

// Vertical Description
export interface VerticalDescription {
  description: string;
  features: string[];
}

// Respondent Data Types (if needed by your app)
export interface RespondentWithParams {
  respondentId: string;
  weight: number;
  gender: string;
  ageGroup: string;
  hasLinearTV: boolean;
  digitalNewsSubscriber: boolean;
  cnnAccessFrequency: string;
  parameters: {
    base: {
      reader: number;
      streaming: number;
      allAccess: number;
      standalone: number;
    };
    price: {
      linear: number;
      squared: number;
    };
    features: {
      reader: Record<string, number>;
      streaming: Record<string, number>;
    };
  };
}

// Type definitions
export type PricingType = 'monthly' | 'annual' | 'both';
export type DiscountType = 'none' | 'student' | 'senior' | 'bundle' | 'free' | '30' | '50' | '';
export type BaseProductName = 'CNN Reader' | 'CNN Streaming' | 'CNN All-Access' | 'CNN Standalone Vertical';
export type ProductPricingType = PricingType;
export type ProductDiscountType = DiscountType;
export type PricingConfig = {
  monthlyRate: number;
  annualRate: number;
  pricingType: PricingType;
  discount: DiscountType;
};