// Local simulation client using API routes
export interface SimpleSimulationRequest {
  products: any[];
  reportType: string;
  outputType: string;
  marketFactors: any;
  simulationOptions: any;
}

export interface SimpleSimulationResult {
  success: boolean;
  data?: any;
  error?: string;
}

export async function runSecureSimulation(
  products: any[],
  reportType: string,
  outputType: string,
  marketFactors: any,
  simulationOptions: any
): Promise<SimpleSimulationResult> {
  try {
    console.log('Running local simulation via API with products:', products.length);
    
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

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    return {
      success: true,
      data: result
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
): Promise<SimpleSimulationResult> {
  try {
    const functionUrl = `https://us-central1-${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.cloudfunctions.net/runPriceSensitivity`;
    
    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        productConfig,
        priceRange,
        marketFactors,
        simulationOptions
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    return {
      success: true,
      data: result
    };
  } catch (error) {
    console.error('Price sensitivity analysis error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}