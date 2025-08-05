import { NextRequest, NextResponse } from 'next/server';
import type { ProductSetupConfig, MarketFactors, SimulationOptions } from '@/lib/types';

// Import calculation engine and data
import { performSimulation } from '@/lib/calculations';
import respondentUtilities from '@/data/respondentUtilities.json';
import respondentProfile from '@/data/respondentProfile.json';
import modelParameters from '@/data/modelParameters.json';
import drnRates from '@/data/drnRates.json';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { products, reportType, outputType, marketFactors, simulationOptions } = body;

    // Validate inputs
    if (!products || !Array.isArray(products) || products.length === 0) {
      return NextResponse.json(
        { error: 'No products provided' },
        { status: 400 }
      );
    }
    
    // Get TAM
    const TAM = 105624640;

    // Prepare respondent data with proper structure
    const respondentsWithParams = respondentUtilities.map((utility: any, index: number) => {
      const profile = respondentProfile.find((p: any) => 
        String(p.Respondent_ID) === String(utility.respondentId || utility.Respondent_ID || index)
      );
      
      return {
        respondentId: utility.respondentId || utility.Respondent_ID || String(index),
        weight: utility.weight || utility.Weight || 1,
        demographics: profile || {},
        individualParams: {
          base: utility.base || {},
          price: utility.price || {},
          all_features: utility.all_features || {},
          features: utility.features || {},
          verticals: utility.verticals || {},
          subscription: utility.subscription || {},
          featureCounts: utility.featureCounts || {},
          verticalCount: utility.verticalCount || {}
        }
      };
    });

    // Run simulation

    const results = performSimulation(
      respondentsWithParams,
      products,
      simulationOptions || {},
      marketFactors || {},
      TAM,
      drnRates || {},
      reportType || 'independent'
    );

        // Format results based on report type
    let reportData;
    
    if (reportType === 'tiered' || reportType === 'bundle') {
      // For tiered: first column is ANY product, rest are individual
      const anyProductRate = results?.anyProductRate || 
        results?.takeRates?.reduce((sum: number, t: any) => sum + (t.adjustedTakeRate || 0), 0) || 0;
      
      reportData = {
        reportType: reportType || 'tiered',
        outputType: outputType || 'percentage',
        overallShare: [
          anyProductRate,
          ...results?.takeRates?.map((t: any) => t.adjustedTakeRate || 0) || []
        ],
        segmentShares: Object.entries(results?.segmentResults || {}).map(([name, data]: [string, any]) => ({
          segmentName: name,
          shares: [
            data.anyProductRate || 0,
            ...data.takeRates?.map((t: any) => t.adjustedTakeRate || 0) || []
          ]
        }))
      };
    } else {
      reportData = {
      reportType: reportType || 'independent',
      outputType: outputType || 'percentage',
      overallShare: results?.takeRates?.map((t: any) => t.adjustedTakeRate || 0) || [],
      segmentShares: Object.entries(results?.segmentResults || {}).map(([name, data]: [string, any]) => ({
        segmentName: name,
        shares: data.takeRates?.map((t: any) => t.adjustedTakeRate || 0) || []
      }))
    };

    }
    
    return NextResponse.json(reportData);
    
  } catch (error) {
    console.error('[API] Simulation error:', error);
    console.error('[API] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    return NextResponse.json(
      { 
        error: 'Simulation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
