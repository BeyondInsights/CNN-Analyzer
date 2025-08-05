import React from 'react';
import { X, HelpCircle } from 'lucide-react';

interface HowToUseGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HowToUseGuide({ isOpen, onClose }: HowToUseGuideProps) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        maxWidth: '800px',
        maxHeight: '80vh',
        overflow: 'auto',
        padding: '24px',
        position: 'relative'
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '24px'
          }}
        >
          <X />
        </button>

        <h2 style={{ marginBottom: '24px', color: '#cc0000' }}>
          <HelpCircle style={{ display: 'inline', marginRight: '8px' }} />
          How to Use the CNN Subscription Simulator
        </h2>

        <div style={{ lineHeight: '1.6' }}>
          <h3 style={{ color: '#333', marginTop: '20px' }}>🎯 Quick Start</h3>
          <ol>
            <li><strong>Select Products:</strong> Click the numbered buttons (Product 1-8) to include/exclude from simulation</li>
            <li><strong>Configure Each Product:</strong> Choose base product type, add features, and set pricing</li>
            <li><strong>Run Simulation:</strong> Click the green "Run Simulation" button</li>
            <li><strong>Review Results:</strong> Analyze take rates by demographic segments</li>
          </ol>

          <h3 style={{ color: '#333', marginTop: '24px' }}>📦 Setting Up Products</h3>
          <div style={{ marginLeft: '20px' }}>
            <h4>1. Choose Base Product Type:</h4>
            <ul>
              <li><strong>CNN Reader:</strong> Digital articles and premium content</li>
              <li><strong>CNN Streaming:</strong> Live and on-demand video</li>
              <li><strong>CNN All-Access:</strong> Combined Reader + Streaming</li>
              <li><strong>CNN Standalone Vertical:</strong> Single topic focus (e.g., CNN Fitness)</li>
            </ul>

            <h4>2. Add Features:</h4>
            <ul>
              <li>Click "+ Add" buttons to select reader/streaming features</li>
              <li>Verticals: Max 3 per product (except Standalone which gets 1)</li>
              <li>More features generally increase appeal but consider pricing</li>
            </ul>

            <h4>3. Configure Pricing:</h4>
            <ul>
              <li><strong>Monthly Only:</strong> Simple month-to-month</li>
              <li><strong>Annual Only:</strong> Year commitment required</li>
              <li><strong>Both:</strong> Customer choice + select annual discount</li>
              <li>Use slider to adjust monthly price within ranges</li>
            </ul>
          </div>

          <h3 style={{ color: '#333', marginTop: '24px' }}>📊 Report Types</h3>
          <div style={{ backgroundColor: '#f5f5f5', padding: '15px', borderRadius: '4px' }}>
            <p><strong>Tiered Bundles (Default):</strong></p>
            <ul>
              <li>Products compete - customers choose ONE</li>
              <li>Shows "ANY PRODUCT" total plus individual products</li>
              <li>Use when products are alternatives to each other</li>
            </ul>
            
            <p style={{ marginTop: '10px' }}><strong>Independent Products:</strong></p>
            <ul>
              <li>Products don't compete - customers might buy multiple</li>
              <li>Each product evaluated separately</li>
              <li>Use for add-on or complementary products</li>
            </ul>
          </div>

          <h3 style={{ color: '#333', marginTop: '24px' }}>⚙️ Market Factors</h3>
          <p>Adjust real-world constraints that affect adoption:</p>
          <ul>
            <li><strong>Awareness (70%):</strong> How many people know about the product</li>
            <li><strong>Distribution (85%):</strong> Technical/payment accessibility</li>
            <li><strong>Competition (90%):</strong> Market position vs alternatives</li>
            <li><strong>Marketing (80%):</strong> Effectiveness of promotion</li>
            <li><strong>Year One (65%):</strong> First-year adoption curve</li>
          </ul>
          <p style={{ color: '#666', fontSize: '14px' }}>
            💡 <em>Current settings are optimistic. Try 50-60% for conservative estimates.</em>
          </p>

          <h3 style={{ color: '#333', marginTop: '24px' }}>📈 Price Sensitivity Analysis</h3>
          <p>Shows how take rates change with price variations (-30% to +30%):</p>
          <ul>
            <li>Helps identify optimal price points</li>
            <li>Shows elasticity (how sensitive customers are to price)</li>
            <li>Run after main simulation for deeper insights</li>
          </ul>

          <h3 style={{ color: '#333', marginTop: '24px' }}>💡 Pro Tips</h3>
          <div style={{ backgroundColor: '#fff3cd', padding: '15px', borderRadius: '4px' }}>
            <ul style={{ marginBottom: 0 }}>
              <li><strong>Benchmark Test:</strong> Try CNN Streaming at $5.99 with 60% market factors = ~0.15% (matches CNN+ reality)</li>
              <li><strong>Bundle Strategy:</strong> If All-Access is cheaper than individuals, it should dominate</li>
              <li><strong>Demographics:</strong> 35-54 age group typically shows highest conversion</li>
              <li><strong>Standalone Verticals:</strong> Expect 0.3-0.8% take rates even at low prices</li>
              <li><strong>Download Results:</strong> Click "Download Report" for CSV export</li>
            </ul>
          </div>

          <h3 style={{ color: '#333', marginTop: '24px' }}>❓ Understanding Results</h3>
          <ul>
            <li><strong>Take Rates:</strong> Percentage of TAM (105M households) that would subscribe</li>
            <li><strong>Population Size:</strong> Actual subscriber counts</li>
            <li><strong>Revenue:</strong> Annual revenue based on monthly prices</li>
            <li><strong>Segments:</strong> Breakdown by demographics, showing which groups convert best</li>
          </ul>
        </div>

        <div style={{ 
          marginTop: '30px', 
          paddingTop: '20px', 
          borderTop: '1px solid #ddd',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ color: '#666', fontSize: '14px' }}>
            Model calibrated using CNN+ historical data and conjoint analysis (n=2,158)
          </span>
          <button
            onClick={onClose}
            style={{
              padding: '8px 20px',
              backgroundColor: '#cc0000',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
}
