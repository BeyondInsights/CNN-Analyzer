import React, { useEffect, useState } from 'react';
import type { ProductSetupConfig, MarketFactors } from '@/lib/types';

interface PreSimulationCheckProps {
  products: ProductSetupConfig[];
  respondents: any[];
  marketFactors: MarketFactors;
  simulationOptions: any;
}

export function PreSimulationCheck({ products, respondents, marketFactors }: PreSimulationCheckProps) {
  const [issues, setIssues] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  
  useEffect(() => {
    const checkList: string[] = [];
    
    const activeProducts = products.filter(p => p.isActive);
    if (activeProducts.length === 0) {
      checkList.push('❌ No active products');
    }
    
    if (!respondents?.length) {
      checkList.push('❌ No respondent data loaded');
    }
    
    if (marketFactors.baseConversion > 1 || marketFactors.baseConversion < 0) {
      checkList.push('❌ Invalid base conversion rate');
    }
    
    setIssues(checkList.filter(item => item.includes('❌') || item.includes('⚠️')));
    setReady(checkList.filter(item => item.includes('❌')).length === 0);
  }, [products, respondents, marketFactors]);

  return (
    <div className="bg-blue-50 p-4 rounded-lg mb-4">
      <h3 className="font-semibold mb-2">Pre-Simulation Check</h3>
      {issues.length === 0 ? (
        <p className="text-green-600">✅ All checks passed - ready to simulate!</p>
      ) : (
        <ul className="space-y-1">
          {issues.map((issue, i) => (
            <li key={i} className="text-sm">{issue}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
