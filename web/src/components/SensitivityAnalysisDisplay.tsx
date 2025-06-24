import React from 'react';
import type { SensitivityPoint } from '@/lib/types';

interface SensitivityAnalysisDisplayProps {
  results: SensitivityPoint[];
}

export default function SensitivityAnalysisDisplay({ results }: SensitivityAnalysisDisplayProps) {
  return (
    <div>
      <h3>Price Sensitivity Analysis Results</h3>
      <ul>
        {results.map((point, idx) => (
          <li key={idx}>
            Price: {point.price}, Share: {point.share}
          </li>
        ))}
      </ul>
    </div>
  );
}
