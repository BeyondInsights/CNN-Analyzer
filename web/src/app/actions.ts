'use server';

import { runSimulation as runSimulationLogic } from '@/lib/simulatorClient';

export async function runSimulation(params: any) {
  try {
    console.log('Server: runSimulation called with:', JSON.stringify(params));
    const results = await runSimulationLogic(params);
    console.log('Server: simulation completed successfully');
    return results;
  } catch (error) {
    console.error('Server: simulation error:', error);
    console.error('Stack:', error.stack);
    throw new Error(`Simulation failed: ${error.message}`);
  }
}
