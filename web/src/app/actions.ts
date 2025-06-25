'use server';

import type { 
  ProductSetupConfig, 
  ReportData, 
  ReportType, 
  OutputType, 
  ProductProfileData,
  SensitivityPoint, 
  MarketFactors,
  SimulationOptions 
} from '@/lib/types';

// Server action that delegates to client-side secure simulation
export async function runServerSimulation(
  activeProducts: ProductSetupConfig[],
  reportType: ReportType,
  outputType: OutputType,
  marketFactors: MarketFactors,
  simulationOptions: SimulationOptions
): Promise<ReportData | null> {
  // Note: This server action is now just a placeholder
  // The actual simulation will be called directly from the client using Firebase Functions
  console.log('[actions.ts] Server simulation called - delegating to client-side secure functions');
  
  // For now, return null to indicate that the client should handle this
  return null;
}

// Placeholder for price sensitivity analysis
export async function runPriceSensitivityAnalysis(
  productConfig: ProductSetupConfig,
  priceRange: { min: number; max: number; steps: number },
  marketFactors: MarketFactors,
  simulationOptions: SimulationOptions
): Promise<SensitivityPoint[] | null> {
  console.log('[actions.ts] Price sensitivity analysis called - delegating to client-side secure functions');
  return null;
}

// Placeholder for product profile
export async function getProductProfile(productConfig: ProductSetupConfig): Promise<ProductProfileData | null> {
  console.log('[actions.ts] Product profile analysis called - delegating to client-side secure functions');
  
  // For now, return a basic profile based on config
  const productProfileData: ProductProfileData = {
    productName: productConfig.product,
    description: getProductDescription(productConfig),
    targetAudience: getTargetAudience(productConfig),
    keyFeatures: getKeyFeatures(productConfig),
    configuration: {
      readerFeatures: productConfig.readerFeatures || [],
      streamingFeatures: productConfig.streamingFeatures || [],
      verticals: productConfig.verticals || []
    },
    pricing: {
      monthlyRate: productConfig.monthlyRate,
      annualRate: productConfig.monthlyRate * 12,
      pricingType: productConfig.pricingType,
      discount: productConfig.discount || ''
    }
  };
  
  return productProfileData;
}

// Helper functions for product profile
function getProductDescription(config: ProductSetupConfig): string {
  const descriptions: Record<string, string> = {
    'CNN Reader': 'Premium digital reading experience with exclusive articles and ad-free browsing',
    'CNN Streaming': 'Live and on-demand video content with exclusive shows and documentaries',
    'CNN All-Access': 'Complete CNN experience combining all reader and streaming benefits',
    'CNN Standalone Vertical': `Specialized content focused on ${config.verticals?.[0] || 'selected topic'}`
  };
  return descriptions[config.product] || 'CNN subscription product';
}

function getTargetAudience(config: ProductSetupConfig): string {
  const audiences: Record<string, string> = {
    'CNN Reader': 'News enthusiasts who prefer reading in-depth articles and analysis',
    'CNN Streaming': 'Viewers who want live coverage and video content on-demand',
    'CNN All-Access': 'Power users who want the complete CNN experience across all platforms',
    'CNN Standalone Vertical': 'Specialists and enthusiasts focused on specific topics'
  };
  return audiences[config.product] || 'CNN audience';
}

function getKeyFeatures(config: ProductSetupConfig): string[] {
  const features: string[] = [];
  
  // Add product-specific features
  if (config.product === 'CNN Reader' || config.product === 'CNN All-Access') {
    features.push(...(config.readerFeatures || []).map(f => `Reader: ${f}`));
  }
  
  if (config.product === 'CNN Streaming' || config.product === 'CNN All-Access') {
    features.push(...(config.streamingFeatures || []).map(f => `Streaming: ${f}`));
  }
  
  if (config.verticals && config.verticals.length > 0) {
    features.push(...config.verticals.map(v => `Vertical: ${v}`));
  }
  
  return features;
}
