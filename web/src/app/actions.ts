'use server';

export async function runSimulation(params: any) {
  // For now, just return mock data to test
  return {
    success: true,
    data: {
      summary: {
        totalRespondents: 1000,
        products: {}
      }
    }
  };
}
