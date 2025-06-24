// lib/serverSimulation.ts
import { runServerSimulation as serverAction } from '../app/actions';
import type { InputConfig } from './types';

export async function runServerSimulation(simulationInput: InputConfig) {
  try {
    if (DEBUG_MODE) console.log('Calling server action with:', simulationInput);
    
    // Call the server action with the proper parameters
    const result = await serverAction(
      simulationInput.products,
      simulationInput.reportType,
      simulationInput.outputType,
      simulationInput.marketFactors,
      simulationInput.simulationOptions
    );
    
    return result;
  } catch (error) {
    if (DEBUG_MODE) console.error('Server simulation error:', error);
    throw error;
  }
}
