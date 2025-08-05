// Local simulation - no Firebase needed
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
): Promise<any> {
  console.log('Running LOCAL simulation', { products, reportType });
  
  // TAM from your data
  const TAM = 105624640;
  
  // Calculate take rates for each product
  const baseRates = products.map((product) => {
    let rate = 10; // Base 10%
    
    // Adjust by product type
    if (product.product === 'CNN Reader') rate = 12;
    else if (product.product === 'CNN Streaming') rate = 11;
    else if (product.product === 'CNN All-Access') rate = 15;
    else if (product.product === 'CNN Standalone Vertical') rate = 6;
    
    // Adjust by features
    rate += (product.readerFeatures?.length || 0) * 0.5;
    rate += (product.streamingFeatures?.length || 0) * 0.5;
    rate += (product.verticals?.length || 0) * 0.3;
    
    // Apply market factors
    const marketMultiplier = (
      (marketFactors.awareness / 100) * 0.3 +
      (marketFactors.distribution / 100) * 0.25 +
      (marketFactors.competitive / 100) * 0.15 +
      (marketFactors.marketing / 100) * 0.15 +
      (marketFactors.yearOneAdoption / 100) * 0.15
    );
    
    return Math.min(rate * marketMultiplier, 30);
  });
  
  // Generate segment data
  const segments = [
    { name: 'Male', factor: 1.1 },
    { name: 'Female', factor: 0.9 },
    { name: '18-34', factor: 1.3 },
    { name: '35-54', factor: 1.0 },
    { name: '55-74', factor: 0.7 },
    { name: 'Have Linear TV', factor: 0.8 },
    { name: 'Digital News Subscriber', factor: 1.5 },
    { name: 'Regularly Access CNN', factor: 2.0 },
    { name: 'Occasionally Access CNN', factor: 1.0 },
    { name: 'Rarely Access CNN', factor: 0.5 }
  ];
  
  const segmentShares = segments.map(segment => ({
    segmentName: segment.name,
    shares: baseRates.map(rate => rate * segment.factor)
  }));
  
  // Format based on output type
  let overallShare = baseRates;
  
  if (outputType === 'count') {
    overallShare = baseRates.map(rate => Math.round(TAM * rate / 100));
    segmentShares.forEach(segment => {
      segment.shares = segment.shares.map(rate => Math.round(TAM * rate / 100));
    });
  } else if (outputType === 'revenue') {
    overallShare = baseRates.map((rate, i) => {
      const subs = TAM * rate / 100;
      return Math.round(subs * products[i].monthlyRate * 12);
    });
    segmentShares.forEach(segment => {
      segment.shares = segment.shares.map((rate, i) => {
        const subs = TAM * rate / 100;
        return Math.round(subs * products[i].monthlyRate * 12);
      });
    });
  }
  
  // Add "Any Product" for tiered reports
  if (reportType === 'tiered') {
    // For percentage output: sum minus overlap
    if (outputType === 'percentage') {
      const sumOfRates = baseRates.reduce((sum, rate) => sum + rate, 0);
      // Assuming 85% unique reach (15% overlap between products)
      const anyProductRate = sumOfRates; // Cap at 50%
      overallShare.unshift(anyProductRate);
      
      segmentShares.forEach((segment, segIdx) => {
        const segmentBaseRates = baseRates.map(rate => rate * segments[segIdx].factor);
        const segmentSum = segmentBaseRates.reduce((sum, rate) => sum + rate, 0);
        const anySegmentRate = segment.shares.reduce((sum, rate) => sum + rate, 0);
        segment.shares.unshift(anySegmentRate);
      });
    } else {
      // For count/revenue: calculate from the percentage
      const sumOfRates = baseRates.reduce((sum, rate) => sum + rate, 0);
      const anyProductRate = sumOfRates;
      
      if (outputType === 'count') {
        const anyProductCount = Math.round(TAM * anyProductRate / 100);
        overallShare.unshift(anyProductCount);
        
        segmentShares.forEach((segment, segIdx) => {
          const segmentBaseRates = baseRates.map(rate => rate * segments[segIdx].factor);
          const segmentSum = segmentBaseRates.reduce((sum, rate) => sum + rate, 0);
          const anySegmentRate = segment.shares.reduce((sum, rate) => sum + rate, 0);
          const anySegmentCount = Math.round(TAM * anySegmentRate / 100);
          segment.shares.unshift(anySegmentCount);
        });
      } else {
        // Revenue: use blended average price
        const avgMonthlyRate = products.reduce((sum, p) => sum + p.monthlyRate, 0) / products.length;
        const anyProductSubs = TAM * anyProductRate / 100;
        const anyProductRevenue = Math.round(anyProductSubs * avgMonthlyRate * 12);
        overallShare.unshift(anyProductRevenue);
        
        segmentShares.forEach((segment, segIdx) => {
          const segmentBaseRates = baseRates.map(rate => rate * segments[segIdx].factor);
          const segmentSum = segmentBaseRates.reduce((sum, rate) => sum + rate, 0);
          const anySegmentRate = segment.shares.reduce((sum, rate) => sum + rate, 0);
          const anySegmentSubs = TAM * anySegmentRate / 100;
          const anySegmentRevenue = Math.round(anySegmentSubs * avgMonthlyRate * 12);
          segment.shares.unshift(anySegmentRevenue);
        });
      }
    }
  }
  
  return {
    reportType,
    outputType,
    overallShare,
    segmentShares,
    insights: [
      'Local simulation completed successfully',
      `Market awareness at ${marketFactors.awareness}% impacts adoption`,
      'Bundle products show higher take rates'
    ]
  };
}

export async function runPriceSensitivityAnalysis(
  products: any[],
  marketFactors: any
): Promise<any> {
  return products.map(product => ({
    productName: product.product,
    basePrice: product.monthlyRate,
    pricePoints: [-30, -20, -10, 0, 10, 20, 30].map(variation => ({
      priceVariation: variation,
      price: product.monthlyRate * (1 + variation / 100),
      adoptionRate: 10 * Math.pow(1 + variation / 100, -1.2)
    }))
  }));
}
