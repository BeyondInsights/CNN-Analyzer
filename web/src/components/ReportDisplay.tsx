// src/components/ReportDisplay.tsx
import React from 'react';
import type { ReportData, ProductSetupConfig } from '@/lib/types';

interface ReportDisplayProps {
  reportData: ReportData | null;
  activeProducts: ProductSetupConfig[];
  priceSensitivityData?: any; // Or use proper type if you have one
}

export default function ReportDisplay({ reportData, activeProducts, priceSensitivityData }: ReportDisplayProps) {
  if (!reportData) return null;

  // Filter out ANY PRODUCT from activeProducts for tiered reports
  const filteredProducts = (reportData.reportType === 'tiered' || (reportData.reportType as any) === 'bundle')
    ? activeProducts.filter(p => p.product && p.product.toUpperCase() !== 'ANY PRODUCT')
    : activeProducts;

  // Define styles
  const tableStyle: React.CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '14px',
    fontFamily: 'Arial, sans-serif',
    marginTop: '20px'
  };

  const cellStyle: React.CSSProperties = {
    border: '1px solid #ddd',
    padding: '8px',
    textAlign: 'left'
  };

  const headerStyle: React.CSSProperties = {
    ...cellStyle,
    backgroundColor: '#f0f0f0',
    fontWeight: 'bold'
  };

  const subHeaderStyle: React.CSSProperties = {
    ...cellStyle,
    backgroundColor: '#f8f8f8',
    fontWeight: 'bold',
    fontStyle: 'italic'
  };

  const valueStyle: React.CSSProperties = {
    ...cellStyle,
    textAlign: 'right'
  };

  // Generate column headers based on report type
  const columnHeaders = reportData.reportType === 'tiered' || (reportData.reportType as any) === 'bundle'
    ? ['ANY PRODUCT', ...filteredProducts.map((p, i) => {
        const productName = p.product || `UNNAMED PRODUCT ${i + 1}`;
        return `PRODUCT ${i + 1}: ${productName.toUpperCase()}`;
      })]
    : filteredProducts.map((p, i) => {
        const productName = p.product || `UNNAMED PRODUCT ${i + 1}`;
        return `PRODUCT ${i + 1}: ${productName.toUpperCase()}`;
      });

  // Make sure we have the right number of columns
  const expectedColumns = reportData.reportType === 'tiered' || (reportData.reportType as any) === 'bundle'
    ? filteredProducts.length + 1  // +1 for ANY PRODUCT
    : filteredProducts.length;

  // If mismatch, log error
  if (reportData.overallShare.length !== expectedColumns) {
    if (DEBUG_MODE) console.error('Column mismatch:', {
      dataColumns: reportData.overallShare.length,
      expectedColumns,
      filteredProductsCount: filteredProducts.length,
      columnHeaders
    });
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={tableStyle}>
        <tbody>
          {/* Report Type Header */}
          <tr>
            <td colSpan={columnHeaders.length + 1} style={headerStyle}>
              REPORT TYPE: {reportData.reportType === 'tiered' ? 'Tiered Bundles' : 
                           (reportData.reportType as any) === 'bundle' ? 'Bundle Analysis' : 
                           'Matrix (Independent Products)'}
            </td>
          </tr>

          {/* Column Headers */}
          <tr>
            <td style={headerStyle}></td>
            {columnHeaders.map((header, idx) => (
              <td key={idx} style={headerStyle}>{header}</td>
            ))}
          </tr>

          {/* Estimated Take Rates Row */}
          <tr>
            <td style={subHeaderStyle}>Estimated Take Rates</td>
            {reportData.overallShare.map((share, idx) => (
              <td key={idx} style={valueStyle}>
                {reportData.outputType === 'percentage' ? `${share.toFixed(1)}%` : share.toLocaleString()}
              </td>
            ))}
          </tr>

          {/* Take rate within TAM - REMOVED THIS ROW AS IT'S REDUNDANT */}

          {/* Population Size */}
          <tr>
            <td style={cellStyle}>Population Size</td>
            {reportData.overallShare.map((share, idx) => {
              if (reportData.outputType === 'count') {
                return <td key={idx} style={valueStyle}>#{share.toLocaleString()}</td>;
              } else if (reportData.outputType === 'percentage') {
                const tam = 105624640;
                const count = Math.round(share / 100 * tam);
                return <td key={idx} style={valueStyle}>#{count.toLocaleString()}</td>;
              } else {
                return <td key={idx} style={valueStyle}>N/A</td>;
              }
            })}
          </tr>

          {/* Estimated Yr 1 Revenue */}
          <tr>
            <td style={cellStyle}>Estimated Yr 1 Revenue</td>
            {reportData.overallShare.map((share, idx) => {
              if (reportData.outputType === 'revenue') {
                return <td key={idx} style={valueStyle}>${share.toLocaleString()}</td>;
              } else {
                // For tiered reports, first column is ANY PRODUCT
                if ((reportData.reportType === 'tiered' || (reportData.reportType as any) === 'bundle') && idx === 0) {
                  // ANY PRODUCT revenue = sum of all individual product revenues
                  let totalRev = 0;
                  for (let i = 0; i < filteredProducts.length; i++) {
                    const product = filteredProducts[i];
                    if (product && product.monthlyRate && i + 1 < reportData.overallShare.length) {
                      const tam = 105624640;
                      const productShare = reportData.overallShare[i + 1]; // +1 because ANY PRODUCT is at index 0
                      const subs = reportData.outputType === 'percentage' ? productShare / 100 * tam : productShare;
                      totalRev += subs * product.monthlyRate * 12;
                    }
                  }
                  return <td key={idx} style={valueStyle}>${Math.round(totalRev).toLocaleString()}</td>;
                }
                
                // For individual products
                const productIndex = (reportData.reportType === 'tiered' || (reportData.reportType as any) === 'bundle') ? idx - 1 : idx;
                const product = filteredProducts[productIndex];
                
                if (!product || !product.monthlyRate || product.monthlyRate === 0) {
                  if (DEBUG_MODE) console.warn(`No monthly rate for product at index ${productIndex}:`, product);
                  return <td key={idx} style={valueStyle}>$0</td>;
                }
                
                const tam = 105624640;
                const subs = reportData.outputType === 'percentage' ? share / 100 * tam : share;
                const rev = Math.round(subs * product.monthlyRate * 12);
                return <td key={idx} style={valueStyle}>${rev.toLocaleString()}</td>;
              }
            })}
          </tr>

          {/* Key Sub-Groups Section */}
          <tr>
            <td colSpan={columnHeaders.length + 1} style={{ ...subHeaderStyle, paddingTop: '12px' }}>
              TAKE RATES AMONG KEY SUB-GROUPS
            </td>
          </tr>

          {/* Gender Section */}
          <tr>
            <td style={subHeaderStyle}>Male</td>
            {(() => {
              const segment = reportData.segmentShares.find(s => s.segmentName === 'Male');
              return segment ? segment.shares.map((share, idx) => (
                <td key={idx} style={valueStyle}>
                  {reportData.outputType === 'percentage' ? `${share.toFixed(1)}%` : share.toLocaleString()}
                </td>
              )) : columnHeaders.map((_, idx) => (
                <td key={idx} style={valueStyle}>0.0%</td>
              ));
            })()}
          </tr>
          <tr>
            <td style={subHeaderStyle}>Female</td>
            {(() => {
              const segment = reportData.segmentShares.find(s => s.segmentName === 'Female');
              return segment ? segment.shares.map((share, idx) => (
                <td key={idx} style={valueStyle}>
                  {reportData.outputType === 'percentage' ? `${share.toFixed(1)}%` : share.toLocaleString()}
                </td>
              )) : columnHeaders.map((_, idx) => (
                <td key={idx} style={valueStyle}>0.0%</td>
              ));
            })()}
          </tr>

          {/* Age Section */}
          <tr>
            <td style={{ ...subHeaderStyle, paddingTop: '8px' }}>AGE</td>
            {columnHeaders.map((_, idx) => <td key={idx} style={cellStyle}></td>)}
          </tr>
          {['18-34', '35-54', '55-74'].map(age => {
            const segment = reportData.segmentShares.find(s => s.segmentName === age);
            return (
              <tr key={age}>
                <td style={cellStyle}>{age}</td>
                {segment ? segment.shares.map((share, idx) => (
                  <td key={idx} style={valueStyle}>
                    {reportData.outputType === 'percentage' ? `${share.toFixed(1)}%` : share.toLocaleString()}
                  </td>
                )) : columnHeaders.map((_, idx) => (
                  <td key={idx} style={valueStyle}>0.0%</td>
                ))}
              </tr>
            );
          })}

          {/* Linear TV Section */}
          <tr>
            <td style={{ ...subHeaderStyle, paddingTop: '8px' }}>Have Linear TV</td>
            {(() => {
              const segment = reportData.segmentShares.find(s => s.segmentName === 'Have Linear TV');
              return segment ? segment.shares.map((share, idx) => (
                <td key={idx} style={valueStyle}>
                  {reportData.outputType === 'percentage' ? `${share.toFixed(1)}%` : share.toLocaleString()}
                </td>
              )) : columnHeaders.map((_, idx) => (
                <td key={idx} style={valueStyle}>0.0%</td>
              ));
            })()}
          </tr>

          {/* Digital News Subscriber Section */}
          <tr>
            <td style={{ ...subHeaderStyle, paddingTop: '8px' }}>Subscribe to a Digital News Product</td>
            {(() => {
              const segment = reportData.segmentShares.find(s => s.segmentName === 'Digital News Subscriber');
              return segment ? segment.shares.map((share, idx) => (
                <td key={idx} style={valueStyle}>
                  {reportData.outputType === 'percentage' ? `${share.toFixed(1)}%` : share.toLocaleString()}
                </td>
              )) : columnHeaders.map((_, idx) => (
                <td key={idx} style={valueStyle}>0.0%</td>
              ));
            })()}
          </tr>

          {/* CNN Engagement Section */}
          <tr>
            <td style={{ ...subHeaderStyle, paddingTop: '8px' }}>CNN Engagement</td>
            {columnHeaders.map((_, idx) => <td key={idx} style={cellStyle}></td>)}
          </tr>
          {['Regularly Access CNN', 'Occasionally Access CNN', 'Rarely Access CNN'].map(access => {
            const segment = reportData.segmentShares.find(s => s.segmentName === access);
            const displayName = access === 'Regularly Access CNN' ? 'Regularly Access' :
                               access === 'Occasionally Access CNN' ? 'Occasionally Access' :
                               'Rarely Access';
            return (
              <tr key={access}>
                <td style={cellStyle}>{displayName}</td>
                {segment ? segment.shares.map((share, idx) => (
                  <td key={idx} style={valueStyle}>
                    {reportData.outputType === 'percentage' ? `${share.toFixed(1)}%` : share.toLocaleString()}
                  </td>
                )) : columnHeaders.map((_, idx) => (
                  <td key={idx} style={valueStyle}>0.0%</td>
                ))}
               </tr>
          );
        })}
            
        </tbody>
      </table>
    </div>
  );
}