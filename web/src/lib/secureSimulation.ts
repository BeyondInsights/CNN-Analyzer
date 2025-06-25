'use client';

import type { 
  ProductSetupConfig, 
  ReportData, 
  ReportDataSegment,
  ReportType, 
  OutputType, 
  SensitivityPoint, 
  MarketFactors,
  SimulationOptions 
} from '@/lib/types';

// Dynamic imports for Firebase to avoid build issues
async function getFirebaseFunctions() {
  if (typeof window === 'undefined') {
    throw new Error('Firebase Functions can only be used in the browser');
  }
  
  const { functions } = await import('@/lib/firebaseClient');
  const { httpsCallable } = await import('firebase/functions');
  
  return { functions, httpsCallable };
}

// Client-side secure simulation using Firebase Functions
export async function runSecureSimulation(
  activeProducts: ProductSetupConfig[],
  reportType: ReportType,
  outputType: OutputType,
  marketFactors: MarketFactors,
  simulationOptions: SimulationOptions
): Promise<ReportData | null> {
  console.log(
    '[secureSimulation.ts] Running secure simulation with:',
    activeProducts.length,
    reportType,
    outputType,
    marketFactors,
    simulationOptions
  );
  
  try {
    if (!activeProducts || activeProducts.length === 0) {
      console.error('No active products provided');
      return null;
    }

    // Convert activeProducts to the format expected by the Firebase Function
    const cardData: Record<string, any> = {};
    activeProducts.forEach((product, index) => {
      cardData[product.id || index.toString()] = {
        product: product.product,
        readerFeatures: product.readerFeatures || [],
        streamingFeatures: product.streamingFeatures || [],
        verticals: product.verticals || [],
        monthlyRate: product.monthlyRate || product.pricing?.monthlyRate || 10,
        pricingType: product.pricingType || product.pricing?.pricingType || 'monthly',
        discount: product.discount || product.pricing?.discount || ''
      };
    });

    // Get Firebase Functions dynamically
    const { functions, httpsCallable } = await getFirebaseFunctions();

    // Call the secure Firebase Function
    const runSimulation = httpsCallable(functions, 'runSimulation');
    const result = await runSimulation({
      cardData,
      marketFactors,
      reportType,
      outputType
    });

    if (!result.data || !(result.data as any).success) {
      throw new Error('Simulation failed on server');
    }

    const simulationResult = (result.data as any).result;
    
    // Convert the Firebase Function result to the expected ReportData format
    const segments: ReportDataSegment[] = simulationResult.segmentShares.map((segment: any) => ({
      segmentName: segment.segmentName,
      shares: segment.shares
    }));

    const reportData: ReportData = {
      overallShare: simulationResult.overallShare,
      segmentShares: segments,
      reportType: simulationResult.reportType,
      outputType: simulationResult.outputType
    };

    console.log('[secureSimulation.ts] Secure simulation completed successfully');
    return reportData;
    
  } catch (error) {
    console.error('[secureSimulation.ts] Error in runSecureSimulation:', error);
    throw error;
  }
}

// Client-side secure price sensitivity analysis using Firebase Functions
export async function runSecurePriceSensitivityAnalysis(
  productConfig: ProductSetupConfig,
  priceRange: { min: number; max: number; steps: number },
  marketFactors: MarketFactors,
  simulationOptions: SimulationOptions
): Promise<SensitivityPoint[] | null> {
  try {
    console.log('[secureSimulation.ts] Running secure price sensitivity analysis');

    // Get Firebase Functions dynamically
    const { functions, httpsCallable } = await getFirebaseFunctions();

    // Call the secure Firebase Function for sensitivity analysis
    const runSensitivityAnalysis = httpsCallable(functions, 'runSensitivityAnalysis');
    const result = await runSensitivityAnalysis({
      cardData: {
        '1': {
          product: productConfig.product,
          readerFeatures: productConfig.readerFeatures || [],
          streamingFeatures: productConfig.streamingFeatures || [],
          verticals: productConfig.verticals || [],
          monthlyRate: productConfig.monthlyRate,
          pricingType: productConfig.pricingType,
          discount: productConfig.discount || ''
        }
      },
      marketFactors
    });

    if (!result.data || !(result.data as any).success) {
      throw new Error('Sensitivity analysis failed on server');
    }

    const sensitivityResult = (result.data as any).result;
    
    // Convert to expected format
    const sensitivityPoints: SensitivityPoint[] = sensitivityResult.priceElasticity.map((point: any) => ({
      price: point.price,
      takeRate: point.takeRate,
      variation: point.variation
    }));

    return sensitivityPoints;
    
  } catch (error) {
    console.error('[secureSimulation.ts] Error in runSecurePriceSensitivityAnalysis:', error);
    return null;
  }
}
