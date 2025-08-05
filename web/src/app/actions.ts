// Client-side action wrapper (no server actions)
import type { 
  ProductSetupConfig, 
  ReportData, 
  ReportType, 
  OutputType, 
  MarketFactors,
  SimulationOptions 
} from '@/lib/types';

// This just exports the type for backward compatibility
export type { ReportData };

// Placeholder function - actual simulation happens via API
export async function runSimulation(
  activeProducts: ProductSetupConfig[],
  reportType: ReportType,
  outputType: OutputType,
  marketFactors: MarketFactors,
  simulationOptions: SimulationOptions
): Promise<ReportData | null> {
  // This function is not used anymore - httpSimulation.ts handles everything
  console.log('Note: This function is deprecated. Use runSecureSimulation instead.');
  return null;
}
