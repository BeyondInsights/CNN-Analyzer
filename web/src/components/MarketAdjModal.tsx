// File: src/components/MarketAdjModal.tsx
'use client';
import React from 'react';
import MarketFactorsModal from './MarketFactorsModal';

type MarketAdjModalProps = {
  open: boolean;
  onClose: () => void;
  settings: any; // Replace 'any' with the actual type if known
  onChange: (settings: any) => void; // Adjust type as needed
};

export default function MarketAdjModal({ open, onClose, settings, onChange }: MarketAdjModalProps) {
  return (
    <MarketFactorsModal
      isOpen={open}
      onClose={onClose}
      currentFactors={settings}
      onApplyFactors={onChange}
    />
  );
}

