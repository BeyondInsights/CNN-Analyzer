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

// Get the Firebase project ID from environment
const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'cnn-analyzer';
const REGION = 'us-central1';

// Helper function to get auth token (minimal import)
async function getAuthToken(): Promise<string | null> {
  try {
    if (typeof window === 'undefined') return null;
    
    // Only import what we need to avoid Firebase Functions import
    const { initializeApp } = await import('firebase/app');
    const { getAuth } = await import('firebase/auth');
    
    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
    };

    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    return await user.getIdToken();
  } catch (error) {
    console.error('Failed to get auth token:', error);
    throw error;
  }
}

// Client-side secure simulation using direct HTTP calls to Firebase Functions
export async function runSecureSimulation(
  activeProducts: ProductSetupConfig[],
  reportType: ReportType,
  outputType: OutputType,
  marketFactors: MarketFactors,
  simulationOptions: SimulationOptions
): Promise<ReportData | null> {
  console.log(
    '[secureSimulationMinimal.ts] Running secure simulation with:',
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

    // Get auth token
    const token = await getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
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

    // Call the secure Firebase Function via HTTP
    const functionUrl = `https://${REGION}-${PROJECT_ID}.cloudfunctions.net/runSimulation`;
    
    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        data: {
          cardData,
          marketFactors,
          reportType,
          outputType
        }
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (!result || !result.result || !result.result.success) {
      throw new Error('Simulation failed on server');
    }

    const simulationResult = result.result.result;
    
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

    console.log('[secureSimulationMinimal.ts] Secure simulation completed successfully');
    return reportData;
    
  } catch (error) {
    console.error('[secureSimulationMinimal.ts] Error in runSecureSimulation:', error);
    throw error;
  }
}

// Client-side secure price sensitivity analysis using direct HTTP calls
export async function runSecurePriceSensitivityAnalysis(
  productConfig: ProductSetupConfig,
  priceRange: { min: number; max: number; steps: number },
  marketFactors: MarketFactors,
  simulationOptions: SimulationOptions
): Promise<SensitivityPoint[] | null> {
  try {
    console.log('[secureSimulationMinimal.ts] Running secure price sensitivity analysis');

    // Get auth token
    const token = await getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    // Call the secure Firebase Function via HTTP
    const functionUrl = `https://${REGION}-${PROJECT_ID}.cloudfunctions.net/runSensitivityAnalysis`;
    
    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        data: {
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
        }
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (!result || !result.result || !result.result.success) {
      throw new Error('Sensitivity analysis failed on server');
    }

    const sensitivityResult = result.result.result;
    
    // Convert to expected format
    const sensitivityPoints: SensitivityPoint[] = sensitivityResult.priceElasticity.map((point: any) => ({
      price: point.price,
      takeRate: point.takeRate,
      variation: point.variation
    }));

    return sensitivityPoints;
    
  } catch (error) {
    console.error('[secureSimulationMinimal.ts] Error in runSecurePriceSensitivityAnalysis:', error);
    return null;
  }
}
