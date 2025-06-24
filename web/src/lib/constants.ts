// lib/constants.ts

export interface DemographicSegment {
  group: string;
  segments: string[];
}

export const DEMOGRAPHIC_SEGMENTS = [
  {
    group: 'Overall',
    segments: ['Overall']
  },
  {
    group: 'Gender',
    segments: ['Male', 'Female']
  },
  {
    group: 'Age',
    segments: ['18-34', '35-54', '55-74']
  },
  {
    group: 'Linear TV Status',
    segments: ['Have Linear TV']
  },
  {
    group: 'Digital News Subscriber',
    segments: ['Digital News Subscriber']
  },
  {
    group: 'CNN Access',
    segments: ['Regularly Access CNN', 'Occasionally Access CNN', 'Rarely Access CNN']
  }
];

// Market size constants
export const MARKET_CONSTANTS = {
  TOTAL_TAM: 105624640, // Total addressable market
  DEFAULT_DRN_FACTOR: 0.85,
  DEFAULT_MARKET_FACTORS: {
    awareness: 70,
    distribution: 85,
    competitive: 90,
    marketing: 80,
    yearOneAdoption: 65
  }
};

// Product constants
export const PRODUCT_TYPES = {
  READER: 'CNN Reader',
  STREAMING: 'CNN Streaming',
  ALL_ACCESS: 'CNN All-Access',
  VERTICAL: 'CNN Standalone Vertical'
} as const;

// Report type constants
export const REPORT_TYPES = {
  TIERED: 'tiered',
  BUNDLE: 'bundle',
  MATRIX: 'matrix',
  INDEPENDENT: 'independent'
} as const;

// Output type constants
export const OUTPUT_TYPES = {
  PERCENTAGE: 'percentage',
  COUNT: 'count',
  REVENUE: 'revenue'
} as const;

export const PRODUCT_PRICE_RANGES = {
  'CNN Reader': {
    min: 3.99,
    max: 21.99,
    midpoint: 12.99, // Average of the default prices across vertical counts
  },
  'CNN Streaming': {
    min: 4.99,
    max: 24.99,
    midpoint: 11.99, // Average of the default prices across vertical counts
  },
  'CNN All-Access': {
    min: 5.99,
    max: 34.99,
    midpoint: 14.99, // Average of the default prices across vertical counts
  },
  'CNN Standalone Vertical': {
    min: 1.99,
    max: 7.99,
    midpoint: 3.99, // Default price
  }
};
// Import or define the feature descriptions before using them
import readerFeatureDescriptions from '@/data/readerFeatureDescriptions.json';
import streamingFeatureDescriptions from '@/data/streamingFeatureDescriptions.json';
import verticalDescriptions from '@/data/verticalDescriptions.json';

export const AVAILABLE_FEATURES = {
  reader: Object.keys(readerFeatureDescriptions),
  streaming: Object.keys(streamingFeatureDescriptions),
  vertical: Object.keys(verticalDescriptions),
};

// Define or import pricingRanges before using it
export const PRICING_RANGES = {};

export const INITIAL_PRODUCT_CONFIG = {
  id: '1',
  product: '',
  monthlyRate: 10,
  annualRate: 120,
  verticals: [],
  readerFeatures: [],
  streamingFeatures: [],
  pricingType: 'monthly' as const,
  discount: 'none' as const,
  isActive: true
};

export const DEBUG_MODE = process.env.NODE_ENV === 'development';
