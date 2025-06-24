// components/PriceSensitivityControl.tsx
import React, { useState } from 'react'; // Removed useEffect as it's no longer needed

interface PriceSensitivityControlProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  thresholdAdjustment: number;
  onThresholdChange: (adjustment: number) => void;
  lowMultiplier: number;
  highMultiplier: number;
  onMultiplierChange: (low: number, high: number) => void;
}

export default function PriceSensitivityControl({
  enabled,
  onToggle,
  thresholdAdjustment,
  onThresholdChange,
  lowMultiplier,
  highMultiplier,
  onMultiplierChange
}: PriceSensitivityControlProps) {
  // Initialize expanded to true, so details are shown by default when the component renders.
  const [expanded, setExpanded] = useState(true); 

  const presets = [
    { label: 'Low Sensitivity', adjustment: -20, low: 1.1, high: 0.9 },
    { label: 'Standard', adjustment: 0, low: 1.3, high: 0.8 },
    { label: 'High Sensitivity', adjustment: 20, low: 1.5, high: 0.7 }
  ];

  const controlId = "price-sensitivity-enabled-checkbox";

  const handleEnableToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEnabledState = e.target.checked;
    onToggle(newEnabledState);
    // No direct effect on 'expanded' state here anymore.
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id={controlId}
            checked={enabled}
            onChange={handleEnableToggle}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
          <label htmlFor={controlId} className="font-medium text-gray-900">
            Enable Price Sensitivity Analysis
          </label>
        </div>
        <button
          onClick={() => setExpanded(!expanded)} 
          className="text-gray-500 hover:text-gray-700"
          // The button is no longer disabled by the 'enabled' state.
          // It always allows toggling the visibility of the details section.
        >
          {expanded ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </button>
      </div>

      {/* Details section is now visible if 'expanded' is true, regardless of 'enabled' state. */}
      {/* The 'enabled' prop determines if these settings are *applied* by the parent, not if they are visible here. */}
      {expanded && (
        <div className="space-y-4 pt-3 border-t border-gray-200">
          {/* Preset buttons */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Quick Settings</label>
            <div className="flex gap-2">
              {presets.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => {
                    onThresholdChange(preset.adjustment);
                    onMultiplierChange(preset.low, preset.high);
                  }}
                  className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                    thresholdAdjustment === preset.adjustment && 
                    lowMultiplier === preset.low && 
                    highMultiplier === preset.high
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Threshold adjustment slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label htmlFor="threshold-slider" className="text-sm font-medium text-gray-700">
                Price Threshold Adjustment: <span className="font-semibold text-blue-600">{thresholdAdjustment > 0 ? '+' : ''}{thresholdAdjustment}%</span>
              </label>
            </div>
            <input
              id="threshold-slider"
              type="range"
              min="-30"
              max="30"
              step="5"
              value={thresholdAdjustment}
              onChange={(e) => onThresholdChange(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>More Sensitive to Low Prices</span>
              <span>More Sensitive to High Prices</span>
            </div>
          </div>

          {/* Multiplier controls */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="low-price-multiplier" className="text-sm font-medium text-gray-700">
                Low Price Multiplier: <span className="font-semibold text-blue-600">{lowMultiplier.toFixed(1)}x</span>
              </label>
              <input
                id="low-price-multiplier"
                type="range"
                min="1.0"
                max="2.0"
                step="0.1"
                value={lowMultiplier}
                onChange={(e) => onMultiplierChange(Number(e.target.value), highMultiplier)}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="high-price-multiplier" className="text-sm font-medium text-gray-700">
                High Price Multiplier: <span className="font-semibold text-blue-600">{highMultiplier.toFixed(1)}x</span>
              </label>
              <input
                id="high-price-multiplier"
                type="range"
                min="0.5"
                max="1.0"
                step="0.1"
                value={highMultiplier}
                onChange={(e) => onMultiplierChange(lowMultiplier, Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>

          {/* Example display */}
          <div className="bg-gray-50 rounded-md p-3 text-sm">
            <div className="font-medium text-gray-700 mb-2">Example Impact:</div>
            <div className="space-y-1 text-gray-600">
              <p>A product priced below the adjusted threshold might see up to a <span className="font-semibold">{(lowMultiplier * 100 - 100).toFixed(0)}%</span> lift.</p>
              <p>A product priced above the adjusted threshold might see up to a <span className="font-semibold">{(100 - highMultiplier * 100).toFixed(0)}%</span> reduction.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}