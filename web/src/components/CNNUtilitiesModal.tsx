import React, { useState } from 'react';

interface CNNUtilitiesModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const CNNUtilitiesModal: React.FC<CNNUtilitiesModalProps> = ({ isVisible, onClose }) => {
  const [activeTab, setActiveTab] = useState('story');

  if (!isVisible) return null;

  const renderStoryTab = () => (
    <div style={{ padding: '30px', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h2 style={{ color: '#cc0000', marginBottom: '10px' }}>CNN's Digital Transformation Strategy</h2>
        <p style={{ fontSize: '18px', color: '#666' }}>Capturing the evolving news consumer across all platforms</p>
      </div>

      {/* Key Insight Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <div style={{ 
          backgroundColor: '#f8f9fa', 
          padding: '25px', 
          borderRadius: '10px',
          borderLeft: '4px solid #28a745'
        }}>
          <h3 style={{ color: '#28a745', marginBottom: '10px' }}>All-Access Dominates</h3>
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#333' }}>87/100</div>
          <p style={{ color: '#666', marginTop: '10px' }}>
            Comprehensive offering across linear, streaming &amp; digital wins
          </p>
        </div>

        <div style={{ 
          backgroundColor: '#f8f9fa', 
          padding: '25px', 
          borderRadius: '10px',
          borderLeft: '4px solid #dc3545'
        }}>
          <h3 style={{ color: '#dc3545', marginBottom: '10px' }}>Portfolio Strategy</h3>
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#333' }}>3 Tiers</div>
          <p style={{ color: '#666', marginTop: '10px' }}>
            Reader (62), All-Access (87), and Verticals (61) capture full TAM
          </p>
        </div>

        <div style={{ 
          backgroundColor: '#f8f9fa', 
          padding: '25px', 
          borderRadius: '10px',
          borderLeft: '4px solid #17a2b8'
        }}>
          <h3 style={{ color: '#17a2b8', marginBottom: '10px' }}>Unique Differentiator</h3>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#333' }}>Lifestyle Verticals</div>
          <p style={{ color: '#666', marginTop: '10px' }}>
            Entertainment &amp; Wellness content sets CNN apart
          </p>
        </div>
      </div>

      {/* The Story */}
      <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <h3 style={{ color: '#333', marginBottom: '20px' }}>The Strategic Imperative</h3>
        
        <div style={{ marginBottom: '30px' }}>
          <h4 style={{ color: '#cc0000', marginBottom: '10px' }}>1. The Platform Evolution</h4>
          <p style={{ lineHeight: '1.8', color: '#555', marginBottom: '15px' }}>
            As linear TV continues to erode, CNN must evolve beyond traditional cable distribution. 
            The data reveals a clear path: <strong>comprehensive multi-platform access is the winning strategy</strong>.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ backgroundColor: '#28a745', height: '30px', borderRadius: '5px', position: 'relative' }}>
                <span style={{ position: 'absolute', left: '10px', top: '5px', color: 'white' }}>All-Access: Linear + Streaming + Digital (87)</span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
            <div style={{ flex: 0.75 }}>
              <div style={{ backgroundColor: '#17a2b8', height: '30px', borderRadius: '5px', position: 'relative' }}>
                <span style={{ position: 'absolute', left: '10px', top: '5px', color: 'white' }}>Reader: Digital-first audience (62)</span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
            <div style={{ flex: 0.7 }}>
              <div style={{ backgroundColor: '#ffc107', height: '30px', borderRadius: '5px', position: 'relative' }}>
                <span style={{ position: 'absolute', left: '10px', top: '5px', color: '#333' }}>Standalone Verticals: Entry points (61)</span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ flex: 0.57 }}>
              <div style={{ backgroundColor: '#dc3545', height: '30px', borderRadius: '5px', position: 'relative' }}>
                <span style={{ position: 'absolute', left: '10px', top: '5px', color: 'white' }}>Streaming-only: Struggles alone (50)</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '30px' }}>
          <h4 style={{ color: '#cc0000', marginBottom: '10px' }}>2. Portfolio Captures Full TAM</h4>
          <p style={{ lineHeight: '1.8', color: '#555' }}>
            While streaming-only struggles (50 score), CNN's tiered portfolio strategy enables capture of the entire addressable market:
          </p>
          <ul style={{ lineHeight: '2', color: '#555', marginTop: '10px' }}>
            <li><strong>Digital Natives:</strong> CNN Reader at $3.99-$7.99 provides text-first experience</li>
            <li><strong>Cord-Cutters:</strong> All-Access at $12-15 delivers streaming + digital + linear</li>
            <li><strong>Interest-Based:</strong> Standalone Verticals at $1.99-$3.99 create low-friction entry</li>
            <li><strong>Bundle Strategy:</strong> 76.8% market reach with 3-product portfolio vs 50% streaming-only</li>
          </ul>
        </div>

        <div>
          <h4 style={{ color: '#cc0000', marginBottom: '10px' }}>3. Lifestyle Verticals Complete the Differentiation</h4>
          <p style={{ lineHeight: '1.8', color: '#555' }}>
            Beyond platform diversity, CNN's unique positioning comes from content competitors don't offer:
          </p>
          <ul style={{ lineHeight: '2', color: '#555', marginTop: '10px' }}>
            <li><strong>Entertainment Tracker (0.430 utility)</strong> - Highest-value vertical, unique to CNN</li>
            <li><strong>Meditation &amp; Mindfulness (0.226)</strong> - Wellness content broadens appeal beyond news junkies</li>
            <li><strong>Personal Finance (0.124)</strong> - Practical value for everyday decisions</li>
            <li><strong>Traditional news + Lifestyle</strong> = Expanded TAM beyond typical news consumers</li>
          </ul>
        </div>
      </div>
    </div>
  );

  const renderDataTab = () => (
    <div style={{ padding: '30px' }}>
      <h3 style={{ marginBottom: '20px', color: '#333' }}>Detailed Utility Scores</h3>
      
      {/* Base Products */}
      <div style={{ marginBottom: '40px' }}>
        <h4 style={{ color: '#666', marginBottom: '15px' }}>Base Product Scores (Actual Utilities)</h4>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ddd' }}>
              <th style={{ padding: '12px', textAlign: 'left' }}>Product</th>
              <th style={{ padding: '12px', textAlign: 'right' }}>Utility</th>
              <th style={{ padding: '12px', textAlign: 'right' }}>Score/100</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Strategic Position</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '12px' }}>CNN All-Access</td>
              <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold', color: '#28a745' }}>+1.230</td>
              <td style={{ padding: '12px', textAlign: 'right' }}>87</td>
              <td style={{ padding: '12px' }}>Premium flagship</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '12px' }}>CNN Reader</td>
              <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold' }}>+0.007</td>
              <td style={{ padding: '12px', textAlign: 'right' }}>62</td>
              <td style={{ padding: '12px' }}>Core offering</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '12px' }}>CNN Standalone Vertical</td>
              <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold' }}>0.000</td>
              <td style={{ padding: '12px', textAlign: 'right' }}>61</td>
              <td style={{ padding: '12px' }}>Entry point</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '12px' }}>CNN Streaming</td>
              <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold', color: '#dc3545' }}>-0.018</td>
              <td style={{ padding: '12px', textAlign: 'right' }}>50</td>
              <td style={{ padding: '12px' }}>Needs bundling</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Vertical Rankings */}
      <div style={{ marginBottom: '40px' }}>
        <h4 style={{ color: '#666', marginBottom: '15px' }}>All Content Verticals - Ranked by Utility</h4>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ddd' }}>
              <th style={{ padding: '8px', textAlign: 'left' }}>Vertical</th>
              <th style={{ padding: '8px', textAlign: 'right' }}>Utility</th>
              <th style={{ padding: '8px', textAlign: 'right' }}>Relative %</th>
              <th style={{ padding: '8px', textAlign: 'left' }}>Category</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid #eee', backgroundColor: '#e8f5e9' }}>
              <td style={{ padding: '8px' }}>Entertainment Tracker</td>
              <td style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>+0.430</td>
              <td style={{ padding: '8px', textAlign: 'right' }}>100%</td>
              <td style={{ padding: '8px', color: '#28a745' }}>Top Lifestyle</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #eee', backgroundColor: '#e8f5e9' }}>
              <td style={{ padding: '8px' }}>Meditation &amp; Mindfulness</td>
              <td style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>+0.226</td>
              <td style={{ padding: '8px', textAlign: 'right' }}>52%</td>
              <td style={{ padding: '8px', color: '#28a745' }}>Wellness</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '8px' }}>Personal Finance</td>
              <td style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>+0.124</td>
              <td style={{ padding: '8px', textAlign: 'right' }}>29%</td>
              <td style={{ padding: '8px' }}>Practical</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '8px' }}>Fitness</td>
              <td style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>+0.122</td>
              <td style={{ padding: '8px', textAlign: 'right' }}>28%</td>
              <td style={{ padding: '8px' }}>Health</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '8px' }}>Expert Buying Guide</td>
              <td style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>+0.107</td>
              <td style={{ padding: '8px', textAlign: 'right' }}>25%</td>
              <td style={{ padding: '8px' }}>Consumer</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '8px' }}>Weather &amp; Natural</td>
              <td style={{ padding: '8px', textAlign: 'right' }}>+0.074</td>
              <td style={{ padding: '8px', textAlign: 'right' }}>17%</td>
              <td style={{ padding: '8px', color: '#6c757d' }}>Utility</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '8px' }}>Longevity</td>
              <td style={{ padding: '8px', textAlign: 'right' }}>+0.051</td>
              <td style={{ padding: '8px', textAlign: 'right' }}>12%</td>
              <td style={{ padding: '8px', color: '#6c757d' }}>Niche</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '8px' }}>Beauty</td>
              <td style={{ padding: '8px', textAlign: 'right' }}>+0.032</td>
              <td style={{ padding: '8px', textAlign: 'right' }}>7%</td>
              <td style={{ padding: '8px', color: '#6c757d' }}>Niche</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '8px' }}>Travel</td>
              <td style={{ padding: '8px', textAlign: 'right' }}>+0.031</td>
              <td style={{ padding: '8px', textAlign: 'right' }}>7%</td>
              <td style={{ padding: '8px', color: '#6c757d' }}>Niche</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '8px' }}>Home</td>
              <td style={{ padding: '8px', textAlign: 'right' }}>+0.022</td>
              <td style={{ padding: '8px', textAlign: 'right' }}>5%</td>
              <td style={{ padding: '8px', color: '#6c757d' }}>Lowest</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Feature Rankings */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        <div>
          <h4 style={{ color: '#666', marginBottom: '15px' }}>Top Reader Features</h4>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #ddd' }}>
                <th style={{ padding: '8px', textAlign: 'left' }}>Feature</th>
                <th style={{ padding: '8px', textAlign: 'right' }}>Utility</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '8px' }}>Podcast Club</td>
                <td style={{ padding: '8px', textAlign: 'right' }}>+0.073</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '8px' }}>Reality Check</td>
                <td style={{ padding: '8px', textAlign: 'right' }}>+0.053</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '8px' }}>Local News</td>
                <td style={{ padding: '8px', textAlign: 'right' }}>+0.051</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '8px' }}>AI Anchor</td>
                <td style={{ padding: '8px', textAlign: 'right' }}>+0.050</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div>
          <h4 style={{ color: '#666', marginBottom: '15px' }}>Top Streaming Features</h4>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #ddd' }}>
                <th style={{ padding: '8px', textAlign: 'left' }}>Feature</th>
                <th style={{ padding: '8px', textAlign: 'right' }}>Utility</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '8px' }}>24/7 Live News</td>
                <td style={{ padding: '8px', textAlign: 'right' }}>+0.217</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '8px' }}>Catch Up Channel</td>
                <td style={{ padding: '8px', textAlign: 'right' }}>+0.186</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '8px' }}>Library OnDemand</td>
                <td style={{ padding: '8px', textAlign: 'right' }}>+0.184</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '8px' }}>Daily Video Brief</td>
                <td style={{ padding: '8px', textAlign: 'right' }}>+0.173</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderBundlesTab = () => (
    <div style={{ padding: '30px' }}>
      <h3 style={{ marginBottom: '20px', color: '#333' }}>Optimal Bundle Configurations</h3>
      
      {/* Strategic Context */}
      <div style={{ backgroundColor: '#f0f8ff', padding: '20px', borderRadius: '10px', marginBottom: '30px', border: '1px solid #cce5ff' }}>
        <h4 style={{ color: '#004085', marginBottom: '10px' }}>Strategic Context: Beyond Linear TV</h4>
        <p style={{ color: '#004085', lineHeight: '1.8' }}>
          With linear TV viewership declining, CNN's multi-platform strategy positions it uniquely in the market. 
          The All-Access bundle combining linear + streaming + digital delivers 87/100 utility score, while 
          streaming-only languishes at 50/100. The portfolio approach below captures different audience segments 
          across the TAM.
        </p>
      </div>

      {/* Market Assumptions Disclaimer */}
      <div style={{ backgroundColor: '#e7f3ff', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #b3d9ff' }}>
      <p style={{ margin: 0, fontSize: '14px', color: '#004085' }}>
          <strong>Important:</strong> These results assume a fully informed market where all consumers are equally aware of each product offering. 
          Real-world performance may vary based on marketing effectiveness and brand awareness. You can adjust market awareness factors 
          using the "Market Factors" button in the simulator to model different scenarios.
      </p>
    </div>
      
      {/* Premium Bundles Row */}
      <h4 style={{ color: '#666', marginBottom: '15px', marginTop: '20px' }}>Premium Bundles</h4>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        {/* Value Seeker Bundle */}
        <div style={{ 
          backgroundColor: '#f8f9fa', 
          padding: '20px', 
          borderRadius: '10px',
          border: '2px solid #28a745'
        }}>
          <h4 style={{ color: '#28a745', marginBottom: '15px' }}>All Access Value</h4>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#333', marginBottom: '10px' }}>
            Score: 78/100
          </div>
          <div style={{ marginBottom: '15px' }}>
            <div style={{ fontWeight: 'bold', color: '#666' }}>Configuration:</div>
            <ul style={{ marginTop: '5px', paddingLeft: '20px', color: '#555' }}>
              <li>Base: All-Access</li>
              <li>Verticals: Entertainment Tracker (simple start)</li>
              <li>Features: Podcast + 24/7 Live</li>
              <li>Price: $7.99/month</li>
              <li>Terms: Annual (with discount)</li>
            </ul>
          </div>
          <div style={{ 
            backgroundColor: '#28a745', 
            color: 'white', 
            padding: '10px', 
            borderRadius: '5px', 
            textAlign: 'center' 
          }}>
            Best Value for Most Users
          </div>
        </div>

        {/* Premium Power User */}
        <div style={{ 
          backgroundColor: '#f8f9fa', 
          padding: '20px', 
          borderRadius: '10px',
          border: '2px solid #17a2b8'
        }}>
          <h4 style={{ color: '#17a2b8', marginBottom: '15px' }}>All Access Premium</h4>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#333', marginBottom: '10px' }}>
            Score: 92/100
          </div>
          <div style={{ marginBottom: '15px' }}>
            <div style={{ fontWeight: 'bold', color: '#666' }}>Configuration:</div>
            <ul style={{ marginTop: '5px', paddingLeft: '20px', color: '#555' }}>
              <li>Base: All-Access</li>
              <li>Verticals: Top 3 (Entertainment Tracker, Meditation, Personal Finance)</li>
              <li>Features: Top 5 each category</li>
              <li>Price: $14.99/month</li>
              <li>Terms: 50% off first 3 months</li>
            </ul>
          </div>
          <div style={{ 
            backgroundColor: '#17a2b8', 
            color: 'white', 
            padding: '10px', 
            borderRadius: '5px', 
            textAlign: 'center' 
          }}>
            Maximum Feature Set
          </div>
        </div>
      </div>

      {/* Streaming Options Row */}
      <h4 style={{ color: '#666', marginBottom: '15px' }}>Streaming Solutions</h4>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        {/* Streaming Basic */}
        <div style={{ 
          backgroundColor: '#f8f9fa', 
          padding: '20px', 
          borderRadius: '10px',
          border: '2px solid #6c757d'
        }}>
          <h4 style={{ color: '#6c757d', marginBottom: '15px' }}>Streaming Basic</h4>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#333', marginBottom: '10px' }}>
            Score: 60/100
          </div>
          <div style={{ marginBottom: '15px' }}>
            <div style={{ fontWeight: 'bold', color: '#666' }}>Configuration:</div>
            <ul style={{ marginTop: '5px', paddingLeft: '20px', color: '#555' }}>
              <li>Base: CNN Streaming</li>
              <li>Verticals: Entertainment Tracker only</li>
              <li>Features: 24/7 Live + Catch Up</li>
              <li>Price: $4.99/month</li>
              <li>Terms: Monthly (flexibility)</li>
            </ul>
          </div>
          <div style={{ 
            backgroundColor: '#6c757d', 
            color: 'white', 
            padding: '10px', 
            borderRadius: '5px', 
            textAlign: 'center' 
          }}>
            Live News Focus
          </div>
        </div>

        {/* Streaming Enhanced */}
        <div style={{ 
          backgroundColor: '#f8f9fa', 
          padding: '20px', 
          borderRadius: '10px',
          border: '2px solid #5a6268'
        }}>
          <h4 style={{ color: '#5a6268', marginBottom: '15px' }}>Streaming Enhanced</h4>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#333', marginBottom: '10px' }}>
            Score: 70/100
          </div>
          <div style={{ marginBottom: '15px' }}>
            <div style={{ fontWeight: 'bold', color: '#666' }}>Configuration:</div>
            <ul style={{ marginTop: '5px', paddingLeft: '20px', color: '#555' }}>
              <li>Base: CNN Streaming</li>
              <li>Verticals: Entertainment Tracker + Meditation</li>
              <li>Features: All streaming features</li>
              <li>Price: $8.99/month</li>
              <li>Terms: Annual with 30% off</li>
            </ul>
          </div>
          <div style={{ 
            backgroundColor: '#5a6268', 
            color: 'white', 
            padding: '10px', 
            borderRadius: '5px', 
            textAlign: 'center' 
          }}>
            Better with Multi-Platform
          </div>
          <p style={{ fontSize: '12px', color: '#666', marginTop: '10px', fontStyle: 'italic' }}>
            Note: Streaming-only scores 50/100 - needs bundling to succeed
          </p>
        </div>
      </div>

      {/* Entry Points Row */}
      <h4 style={{ color: '#666', marginBottom: '15px' }}>Entry Points &amp; Standalone Verticals</h4>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        {/* Reader Entry */}
        <div style={{ 
          backgroundColor: '#f8f9fa', 
          padding: '20px', 
          borderRadius: '10px',
          border: '2px solid #ffc107'
        }}>
          <h4 style={{ color: '#ff9800', marginBottom: '15px' }}>Reader Digital-First</h4>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#333', marginBottom: '10px' }}>
            Score: 62/100
          </div>
          <div style={{ marginBottom: '15px' }}>
            <div style={{ fontWeight: 'bold', color: '#666' }}>Configuration:</div>
            <ul style={{ marginTop: '5px', paddingLeft: '20px', color: '#555' }}>
              <li>Base: CNN Reader</li>
              <li>Verticals: Personal Finance</li>
              <li>Features: Podcast Club + Reality Check</li>
              <li>Price: $5.99/month</li>
              <li>Terms: Monthly (flexibility)</li>
            </ul>
          </div>
          <div style={{ 
            backgroundColor: '#ffc107', 
            color: '#333', 
            padding: '10px', 
            borderRadius: '5px', 
            textAlign: 'center' 
          }}>
            Digital Native Entry
          </div>
        </div>

        {/* Entertainment Tracker Vertical */}
        <div style={{ 
          backgroundColor: '#f8f9fa', 
          padding: '20px', 
          borderRadius: '10px',
          border: '2px solid #20c997'
        }}>
          <h4 style={{ color: '#20c997', marginBottom: '15px' }}>Entertainment Tracker Standalone</h4>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#333', marginBottom: '10px' }}>
            Score: 75/100
          </div>
          <div style={{ marginBottom: '15px' }}>
            <div style={{ fontWeight: 'bold', color: '#666' }}>Configuration:</div>
            <ul style={{ marginTop: '5px', paddingLeft: '20px', color: '#555' }}>
              <li>Base: Standalone Vertical</li>
              <li>Vertical: Entertainment Tracker</li>
              <li>Features: N/A</li>
              <li>Price: $3.99/month</li>
              <li>Terms: Monthly</li>
            </ul>
          </div>
          <div style={{ 
            backgroundColor: '#20c997', 
            color: 'white', 
            padding: '10px', 
            borderRadius: '5px', 
            textAlign: 'center' 
          }}>
            Top Lifestyle Vertical
          </div>
        </div>

        {/* Meditation Vertical */}
        <div style={{ 
          backgroundColor: '#f8f9fa', 
          padding: '20px', 
          borderRadius: '10px',
          border: '2px solid #6f42c1'
        }}>
          <h4 style={{ color: '#6f42c1', marginBottom: '15px' }}>Meditation &amp; Mindfulness</h4>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#333', marginBottom: '10px' }}>
            Score: 68/100
          </div>
          <div style={{ marginBottom: '15px' }}>
            <div style={{ fontWeight: 'bold', color: '#666' }}>Configuration:</div>
            <ul style={{ marginTop: '5px', paddingLeft: '20px', color: '#555' }}>
              <li>Base: Standalone Vertical</li>
              <li>Vertical: Meditation &amp; Mindfulness</li>
              <li>Features: N/A</li>
              <li>Price: $2.99/month</li>
              <li>Terms: Both options</li>
            </ul>
          </div>
          <div style={{ 
            backgroundColor: '#6f42c1', 
            color: 'white', 
            padding: '10px', 
            borderRadius: '5px', 
            textAlign: 'center' 
          }}>
            Wellness Entry Point
          </div>
        </div>
      </div>

      {/* Key Insights */}
      <div style={{ marginTop: '40px', padding: '20px', backgroundColor: '#e8f4f8', borderRadius: '10px' }}>
        <h4 style={{ color: '#333', marginBottom: '15px' }}>Strategic Bundle Insights</h4>
        <ul style={{ lineHeight: '2', color: '#555' }}>
          <li><strong>Linear TV erosion demands multi-platform strategy</strong> - All-Access (87) vastly outperforms streaming-only (50)</li>
          <li><strong>Portfolio approach captures full TAM</strong> - Reader, All-Access, and Verticals address different segments</li>
          <li><strong>CNN's unique position</strong> - Only provider offering linear + streaming + digital in one package</li>
          <li><strong>Streaming struggles standalone</strong> - Must be bundled with digital/linear or enhanced with verticals</li>
          <li><strong>Lifestyle verticals expand addressable market</strong> - Entertainment (0.430) and Meditation (0.226) attract non-news audiences</li>
          <li><strong>3 verticals optimal</strong> - Entertainment + Meditation + Finance achieves 76.8% market reach</li>
          <li><strong>Price elasticity -1.08</strong> - Lower prices significantly expand market (sweet spot $12-15 for All-Access)</li>
          <li><strong>Entry strategy works</strong> - $1.99-3.99 verticals create low-friction path to higher tiers</li>
          <li><strong>Annual terms critical</strong> - Discounts for commitment boost adoption significantly</li>
        </ul>
      </div>

      {/* Vertical Strategy Box */}
      <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#fff3cd', borderRadius: '10px', border: '1px solid #ffeaa7' }}>
        <h4 style={{ color: '#856404', marginBottom: '15px' }}>CNN's Differentiated Vertical Strategy</h4>
        <div style={{ marginBottom: '20px' }}>
          <p style={{ color: '#856404', lineHeight: '1.8' }}>
            While competitors focus on traditional news categories, CNN's lifestyle verticals expand the addressable market 
            beyond typical news consumers. This creates multiple entry points and upsell opportunities:
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <h5 style={{ color: '#856404', marginBottom: '10px' }}>High-Value Standalone Verticals:</h5>
            <ul style={{ lineHeight: '1.8', color: '#856404' }}>
              <li><strong>Entertainment Tracker</strong> - 0.430 utility (#1 overall)</li>
              <li><strong>Meditation &amp; Mindfulness</strong> - 0.226 utility (wellness trend)</li>
              <li><strong>Personal Finance</strong> - 0.124 utility (practical value)</li>
              <li><strong>Fitness</strong> - 0.122 utility (health focus)</li>
            </ul>
          </div>
          <div>
            <h5 style={{ color: '#856404', marginBottom: '10px' }}>Bundle Enhancement Only:</h5>
            <ul style={{ lineHeight: '1.8', color: '#856404' }}>
              <li><strong>Weather</strong> - 0.074 utility (commodity content)</li>
              <li><strong>Beauty</strong> - 0.032 utility (niche appeal)</li>
              <li><strong>Travel</strong> - 0.031 utility (seasonal interest)</li>
              <li><strong>Home</strong> - 0.022 utility (lowest performer)</li>
            </ul>
          </div>
        </div>
        <div style={{ marginTop: '15px', padding: '15px', backgroundColor: '#fff', borderRadius: '5px' }}>
          <p style={{ color: '#856404', fontWeight: 'bold', marginBottom: '5px' }}>Key Insight:</p>
          <p style={{ color: '#856404', fontSize: '14px' }}>
            Entertainment Tracker's 0.430 utility is 6x higher than Weather (0.074) - lifestyle content 
            drives significantly more value than traditional news adjacencies.
          </p>
        </div>
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
          borderRadius: '12px',
          width: '95%',
          maxWidth: '1200px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
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
            <h2 style={{ margin: 0, color: '#333' }}>CNN Multi-Platform Strategy Analysis</h2>
            <p style={{ margin: '5px 0 0 0', color: '#666' }}>Portfolio approach to capture evolving news consumption patterns</p>
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
            { id: 'story', label: 'Strategic Overview', color: '#cc0000' },
            { id: 'data', label: 'Utility Analysis', color: '#17a2b8' },
            { id: 'bundles', label: 'Product Configurations', color: '#28a745' }
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
          {activeTab === 'story' && renderStoryTab()}
          {activeTab === 'data' && renderDataTab()}
          {activeTab === 'bundles' && renderBundlesTab()}
        </div>
      </div>
    </div>
  );
};

export default CNNUtilitiesModal;