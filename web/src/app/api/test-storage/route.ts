// Test Firebase Storage connectivity
import { loadServerData } from '@/lib/serverDataLoader';

export async function GET() {
  try {
    console.log('Testing Firebase Storage connectivity...');
    
    // Try to load a small amount of data to test the connection
    const data = await loadServerData();
    
    const testResult = {
      success: true,
      message: 'Firebase Storage connection successful',
      dataInfo: {
        respondentUtilities: Array.isArray(data.respondentUtilities) ? data.respondentUtilities.length : 0,
        demographics: Array.isArray(data.demographics) ? data.demographics.length : 0,
        modelParameters: Array.isArray(data.modelParameters) ? data.modelParameters.length : 0,
        drnRates: Array.isArray(data.drnRates) ? data.drnRates.length : 0,
      }
    };

    return Response.json(testResult);
  } catch (error) {
    console.error('Firebase Storage test failed:', error);
    return Response.json({ 
      success: false, 
      message: 'Firebase Storage connection failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
