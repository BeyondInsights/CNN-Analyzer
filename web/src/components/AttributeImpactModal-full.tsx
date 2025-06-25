import React, { useState } from 'react';

interface AttributeImpactModalProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function AttributeImpactModal({ isVisible, onClose }: AttributeImpactModalProps) {
  const [activeTab, setActiveTab] = useState('features');

  if (!isVisible) return null;

  const renderFeaturesTab = () => (
    <div style={{ padding: '30px' }}>
      <h3 style={{ marginBottom: '20px', color: '#333' }}>Feature Impact Analysis</h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '30px' }}>
        {/* Reader Features */}
        <div>
          <h4 style={{ color: '#17a2b8', marginBottom: '15px' }}>Reader Features - Ranked by Utility Impact</h4>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #ddd' }}>
                <th style={{ padding: '10px', textAlign: 'left' }}>Feature</th>
                <th style={{ padding: '10px', textAlign: 'right' }}>Utility</th>
                <th style={{ padding: '10px', textAlign: 'right' }}>Impact</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #eee', backgroundColor: '#e8f5e9' }}>
                <td style={{ padding: '10px' }}>Podcast Club</td>
                <td style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold', color: '#28a745' }}>+0.073</td>
                <td style={{ padding: '10px', textAlign: 'right' }}>High</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '10px' }}>Reality Check</td>
                <td style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold' }}>+0.053</td>
                <td style={{ padding: '10px', textAlign: 'right' }}>Medium</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '10px' }}>Local News Integration</td>
                <td style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold' }}>+0.051</td>
                <td style={{ padding: '10px', textAlign: 'right' }}>Medium</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '10px' }}>AI News Anchor</td>
                <td style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold' }}>+0.050</td>
                <td style={{ padding: '10px', textAlign: 'right' }}>Medium</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '10px' }}>Interactive Articles</td>
                <td style={{ padding: '10px', textAlign: 'right' }}>+0.047</td>
                <td style={{ padding: '10px', textAlign: 'right' }}>Low</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '10px' }}>Personalized Digest</td>
                <td style={{ padding: '10px', textAlign: 'right' }}>+0.046</td>
                <td style={{ padding: '10px', textAlign: 'right' }}>Low</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '10px' }}>Breaking News Alerts</td>
                <td style={{ padding: '10px', textAlign: 'right' }}>+0.042</td>
                <td style={{ padding: '10px', textAlign: 'right' }}>Low</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '10px' }}>Deep Dive Investigations</td>
                <td style={{ padding: '10px', textAlign: 'right' }}>+0.041</td>
                <td style={{ padding: '10px', textAlign: 'right' }}>Low</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Streaming Features */}
        <div>
          <h4 style={{ color: '#dc3545', marginBottom: '15px' }}>Streaming Features - Ranked by Utility Impact</h4>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #ddd' }}>
                <th style={{ padding: '10px', textAlign: 'left' }}>Feature</th>
                <th style={{ padding: '10px', textAlign: 'right' }}>Utility</th>
                <th style={{ padding: '10px', textAlign: 'right' }}>Impact</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #eee', backgroundColor: '#e8f5e9' }}>
                <td style={{ padding: '10px' }}>24/7 Live News Channel</td>
                <td style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold', color: '#28a745' }}>+0.217</td>
                <td style={{ padding: '10px', textAlign: 'right' }}>Very High</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #eee', backgroundColor: '#e8f5e9' }}>
                <td style={{ padding: '10px' }}>Catch Up Channel</td>
                <td style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold', color: '#28a745' }}>+0.186</td>
                <td style={{ padding: '10px', textAlign: 'right' }}>High</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #eee', backgroundColor: '#e8f5e9' }}>
                <td style={{ padding: '10px' }}>Video Library OnDemand</td>
                <td style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold', color: '#28a745' }}>+0.184</td>
                <td style={{ padding: '10px', textAlign: 'right' }}>High</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '10px' }}>Daily Video Brief</td>
                <td style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold' }}>+0.173</td>
                <td style={{ padding: '10px', textAlign: 'right' }}>Medium</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '10px' }}>Multiple Camera Angles</td>
                <td style={{ padding: '10px', textAlign: 'right' }}>+0.099</td>
                <td style={{ padding: '10px', textAlign: 'right' }}>Low</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '10px' }}>Interactive Maps & Data</td>
                <td style={{ padding: '10px', textAlign: 'right' }}>+0.097</td>
                <td style={{ padding: '10px', textAlign: 'right' }}>Low</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '10px' }}>Behind the Scenes</td>
                <td style={{ padding: '10px', textAlign: 'right' }}>+0.096</td>
                <td style={{ padding: '10px', textAlign: 'right' }}>Low</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '10px' }}>Exclusive Interviews</td>
                <td style={{ padding: '10px', textAlign: 'right' }}>+0.086</td>
                <td style={{ padding: '10px', textAlign: 'right' }}>Low</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Key Insights */}
      <div style={{ backgroundColor: '#f0f8ff', padding: '20px', borderRadius: '10px', marginBottom: '20px' }}>
        <h4 style={{ color: '#004085', marginBottom: '15px' }}>Key Feature Insights</h4>
        <ul style={{ lineHeight: '1.8', color: '#004085' }}>
          <li><strong>Live streaming dominates:</strong> 24/7 Live News (+0.217) is the highest-value streaming feature</li>
          <li><strong>Content accessibility matters:</strong> Catch Up Channel (+0.186) and OnDemand Library (+0.184) rank highly</li>
          <li><strong>Audio content wins for Reader:</strong> Podcast Club (+0.073) is the top reader feature</li>
          <li><strong>Fact-checking has value:</strong> Reality Check (+0.053) shows strong utility</li>
          <li><strong>Streaming features generally higher impact:</strong> Top streaming features outperform top reader features</li>
        </ul>
      </div>
    </div>
  );

  const renderVerticalsTab = () => (
    <div style={{ padding: '30px' }}>
      <h3 style={{ marginBottom: '20px', color: '#333' }}>Content Vertical Impact Analysis</h3>
      
      <div style={{ marginBottom: '30px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ddd' }}>
              <th style={{ padding: '12px', textAlign: 'left' }}>Vertical</th>
              <th style={{ padding: '12px', textAlign: 'right' }}>Utility Impact</th>
              <th style={{ padding: '12px', textAlign: 'right' }}>Relative Value</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Strategic Category</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Standalone Viability</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid #eee', backgroundColor: '#e8f5e9' }}>
              <td style={{ padding: '12px', fontWeight: 'bold' }}>Entertainment Tracker</td>
              <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold', color: '#28a745' }}>+0.430</td>
              <td style={{ padding: '12px', textAlign: 'right' }}>100%</td>
              <td style={{ padding: '12px', color: '#28a745' }}>Premium Lifestyle</td>
              <td style={{ padding: '12px', color: '#28a745' }}>★★★★★ Excellent</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #eee', backgroundColor: '#e8f5e9' }}>
              <td style={{ padding: '12px', fontWeight: 'bold' }}>Meditation & Mindfulness</td>
              <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold', color: '#28a745' }}>+0.226</td>
              <td style={{ padding: '12px', textAlign: 'right' }}>53%</td>
              <td style={{ padding: '12px', color: '#28a745' }}>Wellness</td>
              <td style={{ padding: '12px', color: '#28a745' }}>★★★★☆ Very Good</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '12px' }}>Personal Finance</td>
              <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold' }}>+0.124</td>
              <td style={{ padding: '12px', textAlign: 'right' }}>29%</td>
              <td style={{ padding: '12px' }}>Practical</td>
              <td style={{ padding: '12px', color: '#ffc107' }}>★★★☆☆ Good</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '12px' }}>Fitness</td>
              <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold' }}>+0.122</td>
              <td style={{ padding: '12px', textAlign: 'right' }}>28%</td>
              <td style={{ padding: '12px' }}>Health</td>
              <td style={{ padding: '12px', color: '#ffc107' }}>★★★☆☆ Good</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '12px' }}>Expert Buying Guide</td>
              <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold' }}>+0.107</td>
              <td style={{ padding: '12px', textAlign: 'right' }}>25%</td>
              <td style={{ padding: '12px' }}>Consumer</td>
              <td style={{ padding: '12px', color: '#ffc107' }}>★★★☆☆ Good</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '12px' }}>Weather & Natural Disasters</td>
              <td style={{ padding: '12px', textAlign: 'right' }}>+0.074</td>
              <td style={{ padding: '12px', textAlign: 'right' }}>17%</td>
              <td style={{ padding: '12px', color: '#6c757d' }}>Utility</td>
              <td style={{ padding: '12px', color: '#dc3545' }}>★★☆☆☆ Bundle Only</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '12px' }}>Longevity</td>
              <td style={{ padding: '12px', textAlign: 'right' }}>+0.051</td>
              <td style={{ padding: '12px', textAlign: 'right' }}>12%</td>
              <td style={{ padding: '12px', color: '#6c757d' }}>Niche Health</td>
              <td style={{ padding: '12px', color: '#dc3545' }}>★★☆☆☆ Bundle Only</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '12px' }}>Beauty</td>
              <td style={{ padding: '12px', textAlign: 'right' }}>+0.032</td>
              <td style={{ padding: '12px', textAlign: 'right' }}>7%</td>
              <td style={{ padding: '12px', color: '#6c757d' }}>Niche Lifestyle</td>
              <td style={{ padding: '12px', color: '#dc3545' }}>★☆☆☆☆ Bundle Only</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '12px' }}>Travel</td>
              <td style={{ padding: '12px', textAlign: 'right' }}>+0.031</td>
              <td style={{ padding: '12px', textAlign: 'right' }}>7%</td>
              <td style={{ padding: '12px', color: '#6c757d' }}>Niche Lifestyle</td>
              <td style={{ padding: '12px', color: '#dc3545' }}>★☆☆☆☆ Bundle Only</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '12px' }}>Home</td>
              <td style={{ padding: '12px', textAlign: 'right' }}>+0.022</td>
              <td style={{ padding: '12px', textAlign: 'right' }}>5%</td>
              <td style={{ padding: '12px', color: '#6c757d' }}>Lowest</td>
              <td style={{ padding: '12px', color: '#dc3545' }}>★☆☆☆☆ Bundle Only</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Strategic Insights */}
      <div style={{ backgroundColor: '#fff3cd', padding: '20px', borderRadius: '10px', marginBottom: '20px' }}>
        <h4 style={{ color: '#856404', marginBottom: '15px' }}>Strategic Vertical Insights</h4>
        <ul style={{ lineHeight: '1.8', color: '#856404' }}>
          <li><strong>Entertainment dominates:</strong> 19x higher utility than lowest vertical (Home)</li>
          <li><strong>Lifestyle beats traditional news:</strong> Entertainment & Meditation outperform all news categories</li>
          <li><strong>Clear standalone threshold:</strong> Only verticals above +0.10 utility are viable standalone</li>
          <li><strong>Wellness trend advantage:</strong> Meditation & Fitness capture wellness market expansion</li>
          <li><strong>Bundle enhancement strategy:</strong> Lower-utility verticals add value in bundles but can't stand alone</li>
        </ul>
      </div>
    </div>
  );

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
        borderRadius: '12px',
        width: '95%',
        maxWidth: '1200px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)'
      }}>
        {/* Header */}
        <div style={{
          padding: '25px 30px',
          borderBottom: '1px solid #eee',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'linear-gradient(to right, #f8f9fa, #fff)'
        }}>
          <div>
            <h2 style={{ margin: 0, color: '#333' }}>Attribute Impact Analysis</h2>
            <p style={{ margin: '5px 0 0 0', color: '#666' }}>Feature and vertical utility impact on adoption</p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '28px',
              cursor: 'pointer',
              color: '#666',
              padding: '0 5px'
            }}
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          borderBottom: '2px solid #eee',
          padding: '0 30px',
          background: '#f8f9fa'
        }}>
          {[
            { id: 'features', label: 'Feature Impact', color: '#17a2b8' },
            { id: 'verticals', label: 'Vertical Analysis', color: '#28a745' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '15px 30px',
                border: 'none',
                background: 'none',
                fontSize: '16px',
                cursor: 'pointer',
                borderBottom: activeTab === tab.id ? `3px solid ${tab.color}` : '3px solid transparent',
                color: activeTab === tab.id ? tab.color : '#666',
                fontWeight: activeTab === tab.id ? 'bold' : 'normal',
                transition: 'all 0.3s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{
          flex: 1,
          overflow: 'auto',
          background: '#fff'
        }}>
          {activeTab === 'features' && renderFeaturesTab()}
          {activeTab === 'verticals' && renderVerticalsTab()}
        </div>
      </div>
    </div>
  );
}