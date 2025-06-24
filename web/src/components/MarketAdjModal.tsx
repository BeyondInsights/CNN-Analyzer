// File: src/components/MarketAdjModal.tsx
'use client';
import React from 'react';
import MarketFactorsModal from './MarketFactorsModal';

export default function MarketAdjModal({ open, onClose, settings, onChange }) {
  return (
    <MarketFactorsModal
      isOpen={open}
      onClose={onClose}
      settings={settings}
      onChange={onChange}
    />
  );
}

