import { MarketFactors } from '../lib/types';

export function applyMarketFactors(baseRate: number, factors: MarketFactors): number {
  const safeFactors = {
    awareness: Math.max(0, Math.min(100, factors.awareness || 70)),
    distribution: Math.max(0, Math.min(100, factors.distribution || 85)),
    competitive: Math.max(0, Math.min(100, factors.competitive || 90)),
    marketing: Math.max(0, Math.min(100, factors.marketing || 80)),
    yearOneAdoption: Math.max(0, Math.min(100, factors.yearOneAdoption || 100))
  };
  
  let adjustedRate = baseRate * (factors.baseConversion || 0.5);
  
  adjustedRate *= (safeFactors.awareness / 100);
  adjustedRate *= (safeFactors.distribution / 100);
  adjustedRate *= (safeFactors.competitive / 100);
  adjustedRate *= (safeFactors.marketing / 100);
  adjustedRate *= (safeFactors.yearOneAdoption / 100);
  
  return adjustedRate;
}
