import React from 'react';

interface MarketWeightsProps {
  awarenessWeight: number;
  distributionWeight: number;
  competitiveWeight: number;
  marketingWeight: number;
  yearOneWeight: number;
  onWeightChange: (weights: {
    awarenessWeight: number;
    distributionWeight: number;
    competitiveWeight: number;
    marketingWeight: number;
    yearOneWeight: number;
  }) => void;
}

export default function MarketFactorWeights({
  awarenessWeight = 30,
  distributionWeight = 25,
  competitiveWeight = 10,
  marketingWeight = 15,
  yearOneWeight = 20,
  onWeightChange
}: MarketWeightsProps) {
  const totalWeight = awarenessWeight + distributionWeight + competitiveWeight + marketingWeight + yearOneWeight;
  
  const handleChange = (factor: string, value: number) => {
    const newWeights = {
      awarenessWeight,
      distributionWeight,
      competitiveWeight,
      marketingWeight,
      yearOneWeight,
      [factor]: value
    };
    onWeightChange(newWeights);
  };

  const getNormalizedPercentage = (weight: number) => {
    return totalWeight > 0 ? ((weight / totalWeight) * 100).toFixed(1) : '0.0';
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
      <h4 className="font-semibold mb-3">Market Factor Weights</h4>
      <p className="text-sm text-gray-600 mb-3">
        Adjust how much each factor impacts take rates (weighted average)
      </p>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium w-32">Awareness</label>
          <input
            type="range"
            min="0"
            max="50"
            value={awarenessWeight}
            onChange={(e) => handleChange('awarenessWeight', Number(e.target.value))}
            className="flex-1 mx-3"
          />
          <span className="text-sm font-mono w-16 text-right">
            {getNormalizedPercentage(awarenessWeight)}%
          </span>
        </div>

        <div className="flex items-center justify-between">
          <label className="text-sm font-medium w-32">Distribution</label>
          <input
            type="range"
            min="0"
            max="50"
            value={distributionWeight}
            onChange={(e) => handleChange('distributionWeight', Number(e.target.value))}
            className="flex-1 mx-3"
          />
          <span className="text-sm font-mono w-16 text-right">
            {getNormalizedPercentage(distributionWeight)}%
          </span>
        </div>

        <div className="flex items-center justify-between">
          <label className="text-sm font-medium w-32">Year 1 Adoption</label>
          <input
            type="range"
            min="0"
            max="50"
            value={yearOneWeight}
            onChange={(e) => handleChange('yearOneWeight', Number(e.target.value))}
            className="flex-1 mx-3"
          />
          <span className="text-sm font-mono w-16 text-right">
            {getNormalizedPercentage(yearOneWeight)}%
          </span>
        </div>

        <div className="flex items-center justify-between">
          <label className="text-sm font-medium w-32">Marketing</label>
          <input
            type="range"
            min="0"
            max="50"
            value={marketingWeight}
            onChange={(e) => handleChange('marketingWeight', Number(e.target.value))}
            className="flex-1 mx-3"
          />
          <span className="text-sm font-mono w-16 text-right">
            {getNormalizedPercentage(marketingWeight)}%
          </span>
        </div>

        <div className="flex items-center justify-between">
          <label className="text-sm font-medium w-32">Competition</label>
          <input
            type="range"
            min="0"
            max="50"
            value={competitiveWeight}
            onChange={(e) => handleChange('competitiveWeight', Number(e.target.value))}
            className="flex-1 mx-3"
          />
          <span className="text-sm font-mono w-16 text-right">
            {getNormalizedPercentage(competitiveWeight)}%
          </span>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-gray-300">
        <div className="flex justify-between text-sm">
          <span className="font-medium">Total (normalized to 100%)</span>
          <span className="font-mono">100.0%</span>
        </div>
      </div>

      <div className="mt-3 p-3 bg-blue-50 rounded text-sm">
        <strong>Current Impact:</strong> With weighted average, your market adjustment will be approximately{' '}
        <span className="font-mono font-bold">
          {((70 * awarenessWeight + 85 * distributionWeight + 90 * competitiveWeight + 80 * marketingWeight + 65 * yearOneWeight) / totalWeight).toFixed(1)}%
        </span>{' '}
        of base take rates (vs 27.8% with multiplication)
      </div>
    </div>
  );
}
