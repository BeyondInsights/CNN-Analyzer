import React from 'react';

interface AboutModelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AboutModelModal({ isOpen, onClose }: AboutModelModalProps) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        background: 'white',
        padding: '2rem',
        borderRadius: '8px',
        maxWidth: '800px',
        width: '90%',
        maxHeight: '80vh',
        overflow: 'auto'
      }}>
        <h2>About the CNN Analyzer Model</h2>
        <div style={{ marginBottom: '1.5rem' }}>
          <h3>Model Overview</h3>
          <p>The CNN Analyzer uses advanced choice modeling techniques to simulate market adoption for CNN digital subscription products.</p>
          
          <h3>Key Features</h3>
          <ul>
            <li>Respondent-level utility modeling</li>
            <li>Price sensitivity analysis</li>
            <li>Market factor adjustments</li>
            <li>Demographic segmentation</li>
            <li>Feature impact analysis</li>
          </ul>
          
          <h3>Data Security</h3>
          <p>All sensitive respondent data is processed server-side in secure Firebase Functions. No raw data is accessible to end users.</p>
        </div>
        
        <button onClick={onClose} style={{
          background: '#0070f3',
          color: 'white',
          border: 'none',
          padding: '0.75rem 1.5rem',
          borderRadius: '4px',
          cursor: 'pointer'
        }}>
          Close
        </button>
      </div>
    </div>
  );
}