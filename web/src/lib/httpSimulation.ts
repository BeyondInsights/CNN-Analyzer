// HTTP simulation that calls the API route
import type { ProductSetupConfig, MarketFactors, SimulationOptions } from '@/lib/types';

export interface SimpleSimulationResult {
  success: boolean;
  data?: any;
  error?: string;
}

export async function runSecureSimulation(
  products: ProductSetupConfig[],
  reportType: string,
  outputType: string,
  marketFactors: MarketFactors,
  simulationOptions: SimulationOptions
): Promise<SimpleSimulationResult> {
  try {

      console.log('[HTTP] Sending to API:', products.map((p, i) => `${i}: ${p.product}`));
  const response = await fetch('/api/simulation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        products,
        reportType,
        outputType,
        marketFactors,
        simulationOptions
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error('API error:', data);
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    console.log("Returning to page:", { success: true, dataKeys: Object.keys(data) });
    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('Simulation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function runPriceSensitivityAnalysis(
  productConfig: any,
  priceRange: any,
  marketFactors: any,
  simulationOptions: any
): Promise<any> {
  return { success: false, error: 'Not implemented' };
}
