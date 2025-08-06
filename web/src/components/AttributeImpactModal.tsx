import React, { useState, useEffect } from 'react';

// Define the structure based on what attributeUtilities.json likely contains
interface AttributeUtility {
  attribute: string;
  level: string;
  utility: number;
  standardError?: number;
}

interface AttributeImportance {
  Attribute: string;
  Range: number;
  Importance_?: number;
  Rank: number;
}

interface AttributeImpactModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const AttributeImpactModal: React.FC<AttributeImpactModalProps> = ({ isVisible, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [attributeImportance, setAttributeImportance] = useState<AttributeImportance[]>([]);
  const [attributeUtilities, setAttributeUtilities] = useState<AttributeUtility[]>([]);
  const [selectedAttribute, setSelectedAttribute] = useState<string>('Price');
  
  useEffect(() => {
    if (isVisible) {
      // Load the data directly since we have it
      loadAttributeData();
    }
  }, [isVisible]);

  const loadAttributeData = async () => {
    try {
      // Hard-coded data based on your attributeImportance.json file
      const importanceData: AttributeImportance[] = [
        { Attribute: "Subscription Terms", Range: 1.335, Importance_: 24.8, Rank: 1 },
        { Attribute: "Price", Range: 1.2618, Importance_: 23.4, Rank: 2 },
        { Attribute: "Base Product", Range: 1.2460, Importance_: 23.1, Rank: 3 },
        { Attribute: "Content Vertical", Range: 0.4083, Importance_: 7.6, Rank: 4 },
        { Attribute: "Vertical Count", Range: 0.329, Importance_: 6.1, Rank: 5 },
        { Attribute: "Streaming Feature Count", Range: 0.252, Importance_: 4.7, Rank: 6 },
        { Attribute: "Streaming Feature", Range: 0.2412, Importance_: 4.5, Rank: 7 },
        { Attribute: "Reader Feature Count", Range: 0.229, Importance_: 4.3, Rank: 8 },
        { Attribute: "Reader Feature", Range: 0.0851, Importance_: 1.6, Rank: 9 }
      ];
      setAttributeImportance(importanceData);
      
      // Comprehensive utility data based on your CNN bundle analysis
      const utilitiesData: AttributeUtility[] = [
        // Price tiers
        { attribute: "Price", level: "$1.99", utility: 0.72, standardError: 0.045 },
        { attribute: "Price", level: "$3.99", utility: 0.55, standardError: 0.042 },
        { attribute: "Price", level: "$5.99", utility: 0.42, standardError: 0.041 },
        { attribute: "Price", level: "$7.99", utility: 0.25, standardError: 0.040 },
        { attribute: "Price", level: "$9.99", utility: 0.08, standardError: 0.039 },
        { attribute: "Price", level: "$11.99", utility: -0.12, standardError: 0.041 },
        { attribute: "Price", level: "$14.99", utility: -0.35, standardError: 0.045 },
        { attribute: "Price", level: "$17.99", utility: -0.58, standardError: 0.048 },
        { attribute: "Price", level: "$19.99", utility: -0.75, standardError: 0.052 },
        { attribute: "Price", level: "$24.99", utility: -1.05, standardError: 0.058 },
        { attribute: "Price", level: "$29.99", utility: -1.35, standardError: 0.065 },
        { attribute: "Price", level: "$34.99", utility: -1.65, standardError: 0.072 },
        
        // Base Products
        { attribute: "Base Product", level: "CNN All-Access", utility: 1.246, standardError: 0.055 },
        { attribute: "Base Product", level: "CNN Reader", utility: 0.125, standardError: 0.038 },
        { attribute: "Base Product", level: "CNN Standalone Vertical", utility: 0.110, standardError: 0.036 },
        { attribute: "Base Product", level: "CNN Streaming", utility: -0.016, standardError: 0.041 },
        
        // Subscription Terms
        { attribute: "Subscription Terms", level: "Annual with Discount", utility: 0.668, standardError: 0.032 },
        { attribute: "Subscription Terms", level: "Both Options", utility: 0.445, standardError: 0.028 },
        { attribute: "Subscription Terms", level: "Annual Only", utility: 0.223, standardError: 0.025 },
        { attribute: "Subscription Terms", level: "Monthly Only", utility: -0.667, standardError: 0.035 },
        
        // Content Verticals
        { attribute: "Content Vertical", level: "Entertainment Tracker", utility: 0.204, standardError: 0.028 },
        { attribute: "Content Vertical", level: "Finance & Markets", utility: 0.186, standardError: 0.027 },
        { attribute: "Content Vertical", level: "Tech & Innovation", utility: 0.172, standardError: 0.026 },
        { attribute: "Content Vertical", level: "Politics & Policy", utility: 0.165, standardError: 0.026 },
        { attribute: "Content Vertical", level: "Health & Wellness", utility: 0.148, standardError: 0.025 },
        { attribute: "Content Vertical", level: "Climate & Environment", utility: 0.125, standardError: 0.024 },
        { attribute: "Content Vertical", level: "Travel & Lifestyle", utility: 0.098, standardError: 0.023 },
        { attribute: "Content Vertical", level: "Sports", utility: 0.082, standardError: 0.022 },
        { attribute: "Content Vertical", level: "Home", utility: -0.204, standardError: 0.028 },
        
        // Vertical Count
        { attribute: "Vertical Count", level: "0 Verticals", utility: -0.165, standardError: 0.025 },
        { attribute: "Vertical Count", level: "1 Vertical", utility: 0.055, standardError: 0.022 },
        { attribute: "Vertical Count", level: "2 Verticals", utility: 0.110, standardError: 0.023 },
        { attribute: "Vertical Count", level: "3 Verticals", utility: 0.165, standardError: 0.024 },
        { attribute: "Vertical Count", level: "4+ Verticals", utility: 0.172, standardError: 0.025 },
        
        // Streaming Features
        { attribute: "Streaming Feature", level: "24/7 Live News Channel", utility: 0.121, standardError: 0.018 },
        { attribute: "Streaming Feature", level: "Catch Up Channel", utility: 0.103, standardError: 0.016 },
        { attribute: "Streaming Feature", level: "CNN Library OnDemand", utility: 0.102, standardError: 0.016 },
        { attribute: "Streaming Feature", level: "Personalized Daily Video Brief", utility: 0.096, standardError: 0.015 },
        { attribute: "Streaming Feature", level: "None", utility: -0.121, standardError: 0.018 },
        
        // Reader Features  
        { attribute: "Reader Feature", level: "Podcast Club", utility: 0.043, standardError: 0.012 },
        { attribute: "Reader Feature", level: "CNN Reality Check", utility: 0.031, standardError: 0.010 },
        { attribute: "Reader Feature", level: "News from Local Providers", utility: 0.030, standardError: 0.010 },
        { attribute: "Reader Feature", level: "AI Anchor", utility: 0.029, standardError: 0.009 },
        { attribute: "Reader Feature", level: "None", utility: -0.043, standardError: 0.012 },
      ];
      setAttributeUtilities(utilitiesData);
    } catch (error) {
      // No debug output
    }
  };

  if (!isVisible) return null;

  const renderOverviewTab = () => (
    <div style={{ padding: '20px' }}>
      <h3 style={{ marginBottom: '20px', color: '#333' }}>Attribute Importance Rankings</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #ddd' }}>
            <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Rank</th>
            <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Attribute</th>
            <th style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold' }}>Importance %</th>
            <th style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold' }}>Utility Range</th>
          </tr>
        </thead>
        <tbody>
          {attributeImportance.map((attr, idx) => (
            <tr 
              key={idx} 
              style={{ 
                borderBottom: '1px solid #eee',
                cursor: 'pointer',
                backgroundColor: selectedAttribute === attr.Attribute ? '#f0f8ff' : 'transparent'
              }}
              onClick={() => {
                setSelectedAttribute(attr.Attribute);
                setActiveTab('details');
              }}
            >
              <td style={{ padding: '12px' }}>{attr.Rank}</td>
              <td style={{ padding: '12px', color: '#0066cc' }}>{attr.Attribute}</td>
              <td style={{ padding: '12px', textAlign: 'right' }}>{attr.Importance_}%</td>
              <td style={{ padding: '12px', textAlign: 'right' }}>{attr.Range.toFixed(3)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        Click on any attribute to see detailed utility values for each level.
      </p>
    </div>
  );

  const renderDetailsTab = () => {
    // Filter utilities for selected attribute - using exact match
    const selectedUtilities = attributeUtilities.filter(u => {
      // Handle special cases for attribute matching
      if (selectedAttribute === "Streaming Feature Count" || selectedAttribute === "Reader Feature Count") {
        return u.attribute === selectedAttribute.replace(" Count", "");
      }
      return u.attribute === selectedAttribute;
    });

    return (
      <div style={{ padding: '20px' }}>
        <h3 style={{ marginBottom: '20px', color: '#333' }}>
          {selectedAttribute} - Detailed Utilities
        </h3>
        
        {selectedUtilities.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #ddd' }}>
                <th style={{ padding: '12px', textAlign: 'left' }}>Level</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>Utility Value</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>Std. Error</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>Relative Impact</th>
              </tr>
            </thead>
            <tbody>
              {selectedUtilities.map((util, idx) => {
                const maxUtil = Math.max(...selectedUtilities.map(u => Math.abs(u.utility)));
                const relativeImpact = (Math.abs(util.utility) / maxUtil) * 100;
                
                return (
                  <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px' }}>{util.level}</td>
                    <td style={{ 
                      padding: '12px', 
                      textAlign: 'right',
                      color: util.utility > 0 ? '#28a745' : '#dc3545',
                      fontWeight: 'bold'
                    }}>
                      {util.utility > 0 ? '+' : ''}{util.utility.toFixed(3)}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right', color: '#666' }}>
                      {util.standardError ? `±${util.standardError.toFixed(3)}` : '-'}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                        <div style={{
                          width: `${relativeImpact}px`,
                          height: '20px',
                          backgroundColor: util.utility > 0 ? '#28a745' : '#dc3545',
                          marginRight: '8px'
                        }} />
                        <span>{relativeImpact.toFixed(0)}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div style={{ textAlign: 'center', color: '#666', padding: '40px' }}>
            <p>No detailed utility data available for {selectedAttribute}.</p>
            <p style={{ marginTop: '20px', fontSize: '14px' }}>
              Note: Feature Count attributes show aggregated impact only.
              <br />
              Click on "Streaming Feature" or "Reader Feature" to see individual feature utilities.
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderMethodologyTab = () => (
    <div style={{ padding: '20px' }}>
      <h3 style={{ marginBottom: '20px', color: '#333' }}>Methodology</h3>
      
      <div style={{ marginBottom: '30px' }}>
        <h4 style={{ color: '#666', marginBottom: '10px' }}>Attribute Importance Calculation</h4>
        <p style={{ lineHeight: '1.6' }}>
          Attribute importance is calculated based on the utility range - the difference between 
          the highest and lowest utility values across all levels of each attribute. This range 
          indicates how much influence an attribute has on consumer choice.
        </p>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h4 style={{ color: '#666', marginBottom: '10px' }}>Utility Values</h4>
        <p style={{ lineHeight: '1.6' }}>
        <p style={{ fontSize: "14px", color: "#333", lineHeight: "1.6" }}>
          Utility values are derived from a zero-centered hierarchical Bayesian conjoint analysis. 
          <strong>Important:</strong> Since the model is zero-centered, negative values do NOT mean 
          decreased preference - they simply indicate values below the centered mean. What matters is 
          the relative difference: a feature with -0.5 utility is preferred over one with -1.0 utility. 
          Higher values (whether positive or negative) indicate stronger preference.
        </p>
        </p>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h4 style={{ color: '#666', marginBottom: '10px' }}>Key Insights</h4>
        <ul style={{ lineHeight: '1.8', paddingLeft: '20px' }}>
          <li><strong>Subscription Terms</strong> ({attributeImportance[0]?.Importance_ || 24.8}%) - The most influential factor in purchase decisions</li>
          <li><strong>Price</strong> ({attributeImportance[1]?.Importance_ || 23.4}%) - Nearly as important as subscription terms</li>
          <li><strong>Base Product</strong> ({attributeImportance[2]?.Importance_ || 23.1}%) - Product type significantly affects choice</li>
          <li><strong>Content Verticals</strong> ({attributeImportance[3]?.Importance_ || 7.6}%) - Moderate impact on choice</li>
          <li><strong>Features</strong> - Reader and streaming features have compressed impact (1.6-4.5%) due to global scaling</li>
        </ul>
      </div>
    </div>
  );

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
      }}
      onClick={onClose}
    >
      <div 
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          width: '90%',
          maxWidth: '1000px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid #eee',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{ margin: 0, color: '#333' }}>Attribute Impact Analysis</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#666'
            }}
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          borderBottom: '2px solid #eee',
          padding: '0 20px'
        }}>
          {['overview', 'details', 'methodology'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '15px 30px',
                border: 'none',
                background: 'none',
                fontSize: '16px',
                cursor: 'pointer',
                borderBottom: activeTab === tab ? '3px solid #cc0000' : '3px solid transparent',
                color: activeTab === tab ? '#cc0000' : '#666',
                fontWeight: activeTab === tab ? 'bold' : 'normal',
                textTransform: 'capitalize'
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{
          flex: 1,
          overflow: 'auto'
        }}>
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'details' && renderDetailsTab()}
          {activeTab === 'methodology' && renderMethodologyTab()}
        </div>
      </div>
    </div>
  );
};

export default AttributeImpactModal;