// File: src/components/MarketFactorsModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { X } from 'lucide-react';
import type { MarketFactors, MarketFactorSettings } from '@/lib/types';


interface MarketFactorsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFactors: (settings: MarketFactorSettings) => void;
  currentFactors: MarketFactors;
}

export default function MarketFactorsModal({ 
  isOpen, 
  onClose, 
  onApplyFactors, 
  currentFactors 
}: MarketFactorsModalProps) {
  const [userId, setUserId] = useState<string | null>(null);
  
  // Initialize settings from currentFactors or use defaults
  const [settings, setSettings] = useState<MarketFactorSettings>({
    scenario: 'realistic',
    awareness: currentFactors?.awareness || 70,
    distribution: currentFactors?.distribution || 85,
    competitive: currentFactors?.competitive || 90,
    marketing: currentFactors?.marketing || 80,
    yearOneAdoption: currentFactors?.yearOneAdoption || 65,
    enablePriceSensitivity: currentFactors?.enablePriceSensitivity || false,
    lowPriceMultiplier: currentFactors?.lowPriceMultiplier || 1.3,
    highPriceMultiplier: currentFactors?.highPriceMultiplier || 0.8,
    priceThreshold: currentFactors?.priceThreshold || 12,
    // Add weights
    awarenessWeight: currentFactors?.awarenessWeight || 30,
    distributionWeight: currentFactors?.distributionWeight || 25,
    competitiveWeight: currentFactors?.competitiveWeight || 10,
    marketingWeight: currentFactors?.marketingWeight || 15,
    yearOneWeight: currentFactors?.yearOneWeight || 20
  });

  // Update settings when currentFactors changes
  useEffect(() => {
    if (currentFactors) {
      setSettings(prev => ({
        ...prev,
        awareness: currentFactors.awareness ?? prev.awareness,
        distribution: currentFactors.distribution ?? prev.distribution,
        competitive: currentFactors.competitive ?? prev.competitive,
        marketing: currentFactors.marketing ?? prev.marketing,
        yearOneAdoption: currentFactors.yearOneAdoption ?? prev.yearOneAdoption,
        enablePriceSensitivity: currentFactors.enablePriceSensitivity ?? prev.enablePriceSensitivity,
        lowPriceMultiplier: currentFactors.lowPriceMultiplier ?? prev.lowPriceMultiplier,
        highPriceMultiplier: currentFactors.highPriceMultiplier ?? prev.highPriceMultiplier,
        priceThreshold: currentFactors.priceThreshold ?? prev.priceThreshold,
        // Update weights
        awarenessWeight: currentFactors.awarenessWeight ?? prev.awarenessWeight,
        distributionWeight: currentFactors.distributionWeight ?? prev.distributionWeight,
        competitiveWeight: currentFactors.competitiveWeight ?? prev.competitiveWeight,
        marketingWeight: currentFactors.marketingWeight ?? prev.marketingWeight,
        yearOneWeight: currentFactors.yearOneWeight ?? prev.yearOneWeight
      }));
    }
  }, [currentFactors]);


  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <Dialog.Panel className="w-full max-w-md bg-white p-6 rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-lg font-semibold">Market & Time Adjustments</Dialog.Title>
            <button onClick={onClose}><X size={20} /></button>
          </div>

          <div className="space-y-4">
            {/* Core Market Factors */}
            <div>
              <h3 className="text-sm font-semibold mb-3">Market Factor Values</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium">
                    Market Awareness <span className="text-gray-500">({settings.awareness}%)</span>
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={settings.awareness}
                    onChange={e => setSettings({ ...settings, awareness: Number(e.target.value) })}
                    className="w-full"
                  />
                </div>
            <div className={styles.helpBox} style={{ marginTop: '1rem' }}>
              <h4>�� Price Sensitivity Guide</h4>
              <p><strong>Price Threshold:</strong> The psychological barrier. Below = value, Above = expensive</p>
              <ul>
                <li>$10 - Digital subscription benchmark (Netflix/Spotify)</li>
                <li>$12 - Standard news (recommended)</li>
                <li>$15 - Premium news (NYT/WSJ)</li>
              </ul>
              <p><strong>Low Price Boost:</strong> Extra adoption when below threshold</p>
              <ul>
                <li>1.3x = 30% boost (standard)</li>
                <li>1.5x = 50% boost (aggressive)</li>
              </ul>
              <p><strong>High Price Penalty:</strong> Reduced adoption when above threshold</p>
              <ul>
                <li>0.8x = 20% penalty (mild)</li>
                <li>0.7x = 30% penalty (standard)</li>
                <li>0.5x = 50% penalty (severe)</li>
              </ul>
            </div>

                <div>
                  <label className="block text-sm font-medium">
                    Distribution Reach <span className="text-gray-500">({settings.distribution}%)</span>
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={settings.distribution}
                    onChange={e => setSettings({ ...settings, distribution: Number(e.target.value) })}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium">
                    Competitive Factor <span className="text-gray-500">({settings.competitive}%)</span>
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={settings.competitive}
                    onChange={e => setSettings({ ...settings, competitive: Number(e.target.value) })}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium">
                    Marketing Effectiveness <span className="text-gray-500">({settings.marketing}%)</span>
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={settings.marketing}
                    onChange={e => setSettings({ ...settings, marketing: Number(e.target.value) })}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium">
                    Year One Adoption <span className="text-gray-500">({settings.yearOneAdoption}%)</span>
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={settings.yearOneAdoption}
                    onChange={e => setSettings({ ...settings, yearOneAdoption: Number(e.target.value) })}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Market Factor Weights */}
            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold mb-3">Factor Importance Weights</h3>
              <p className="text-xs text-gray-600 mb-3">Adjust how much each factor impacts the final take rate:</p>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium">
                    Awareness Weight <span className="text-gray-500">({settings.awarenessWeight || 30}%)</span>
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={settings.awarenessWeight || 30}
                    onChange={e => setSettings({ ...settings, awarenessWeight: Number(e.target.value) })}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium">
                    Distribution Weight <span className="text-gray-500">({settings.distributionWeight || 25}%)</span>
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={settings.distributionWeight || 25}
                    onChange={e => setSettings({ ...settings, distributionWeight: Number(e.target.value) })}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium">
                    Competitive Weight <span className="text-gray-500">({settings.competitiveWeight || 10}%)</span>
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={settings.competitiveWeight || 10}
                    onChange={e => setSettings({ ...settings, competitiveWeight: Number(e.target.value) })}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium">
                    Marketing Weight <span className="text-gray-500">({settings.marketingWeight || 15}%)</span>
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={settings.marketingWeight || 15}
                    onChange={e => setSettings({ ...settings, marketingWeight: Number(e.target.value) })}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium">
                    Year One Weight <span className="text-gray-500">({settings.yearOneWeight || 20}%)</span>
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={settings.yearOneWeight || 20}
                    onChange={e => setSettings({ ...settings, yearOneWeight: Number(e.target.value) })}
                    className="w-full"
                  />
                </div>
              </div>
              
              <div className="mt-3 p-2 bg-gray-100 rounded text-xs">
                <span className="font-medium">Total: </span>
                {(settings.awarenessWeight || 30) + 
                 (settings.distributionWeight || 25) + 
                 (settings.competitiveWeight || 10) + 
                 (settings.marketingWeight || 15) + 
                 (settings.yearOneWeight || 20)}%
                <span className="text-gray-600 ml-2">(will be normalized)</span>
              </div>
            </div>

            {/* Tiered Price Sensitivity */}
            <div className="border-t pt-4">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={settings.enablePriceSensitivity}
                  onChange={e => setSettings({ ...settings, enablePriceSensitivity: e.target.checked })}
                  className="mr-2"
                />
                Enable Tiered Price Sensitivity
              </label>
              {settings.enablePriceSensitivity && (
                <div className="mt-3 space-y-3">
                  <div>
                    <label className="block text-sm font-medium">Threshold Price ($)</label>
                    <input
                      type="number"
                      min={0}
                      value={settings.priceThreshold}
                      onChange={e => setSettings({ ...settings, priceThreshold: Number(e.target.value) })}
                      className="w-full border rounded p-1" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Low Price Multiplier</label>
                    <input
                      type="number"
                      step={0.1}
                      value={settings.lowPriceMultiplier}
                      onChange={e => setSettings({ ...settings, lowPriceMultiplier: Number(e.target.value) })}
                      className="w-full border rounded p-1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">High Price Multiplier</label>
                    <input
                      type="number"
                      step={0.1}
                      value={settings.highPriceMultiplier}
                      onChange={e => setSettings({ ...settings, highPriceMultiplier: Number(e.target.value) })}
                      className="w-full border rounded p-1"
                    />
                  </div>
                </div>
            <div className={styles.helpBox} style={{ marginTop: '1rem' }}>
              <h4>�� Price Sensitivity Guide</h4>
              <p><strong>Price Threshold:</strong> The psychological barrier. Below = value, Above = expensive</p>
              <ul>
                <li>$10 - Digital subscription benchmark (Netflix/Spotify)</li>
                <li>$12 - Standard news (recommended)</li>
                <li>$15 - Premium news (NYT/WSJ)</li>
              </ul>
              <p><strong>Low Price Boost:</strong> Extra adoption when below threshold</p>
              <ul>
                <li>1.3x = 30% boost (standard)</li>
                <li>1.5x = 50% boost (aggressive)</li>
              </ul>
              <p><strong>High Price Penalty:</strong> Reduced adoption when above threshold</p>
              <ul>
                <li>0.8x = 20% penalty (mild)</li>
                <li>0.7x = 30% penalty (standard)</li>
                <li>0.5x = 50% penalty (severe)</li>
              </ul>
            </div>
              )}
            </div>

            <div className="flex justify-end space-x-2 mt-6 pt-4 border-t">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onApplyFactors(settings);
                  onClose();
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Apply Factors
              </button>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}