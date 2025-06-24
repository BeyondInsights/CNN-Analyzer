// components/ReportConfigModal.tsx
import React from 'react';
import { ReportType, OutputType } from '@/lib/types';
import styles from '@/app/page.module.css';

interface ReportConfigModalProps {
  visible: boolean;
  currentReportType: ReportType;
  currentOutputType: OutputType;
  onReportTypeChange: (type: ReportType) => void;
  onOutputTypeChange: (type: OutputType) => void;
  onClose: () => void;
}

export default function ReportConfigModal({
  visible,
  currentReportType,
  currentOutputType,
  onReportTypeChange,
  onOutputTypeChange,
  onClose
}: ReportConfigModalProps) {
  if (!visible) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2>Configure Report</h2>
          <button className={styles.closeModal} onClick={onClose}>×</button>
        </div>
        <div>
          <div className={styles.reportTypeSection}>
            <h3>Report Type:</h3>
            <label className={styles.radioOption}>
              <input 
                type="radio" 
                name="reportType" 
                value="tiered" 
                checked={currentReportType === 'tiered'}
                onChange={(e) => onReportTypeChange(e.target.value as ReportType)}
              />
              Tiered Bundles
            </label>
            <label className={styles.radioOption}>
              <input 
                type="radio" 
                name="reportType" 
                value="independent"
                checked={currentReportType === 'independent'}
                onChange={(e) => onReportTypeChange(e.target.value as ReportType)}
              />
              Independent Products
            </label>
          </div>
          
          <div className={styles.reportTypeSection}>
            <h3>Output Type:</h3>
            <label className={styles.radioOption}>
              <input 
                type="radio" 
                name="outputType" 
                value="percentage"
                checked={currentOutputType === 'percentage'}
                onChange={(e) => onOutputTypeChange(e.target.value as OutputType)}
              />
              Take Rates (%)
            </label>
            <label className={styles.radioOption}>
              <input 
                type="radio" 
                name="outputType" 
                value="count"
                checked={currentOutputType === 'count'}
                onChange={(e) => onOutputTypeChange(e.target.value as OutputType)}
              />
              Population Counts (#)
            </label>
            <label className={styles.radioOption}>
              <input 
                type="radio" 
                name="outputType" 
                value="revenue"
                checked={currentOutputType === 'revenue'}
                onChange={(e) => onOutputTypeChange(e.target.value as OutputType)}
              />
              Revenue ($)
            </label>
          </div>
        </div>
        <div className={styles.modalButtons}>
          <button className={styles.btnSecondary} onClick={onClose}>Cancel</button>
          <button className={styles.btnPrimary} onClick={onClose}>Generate Report</button>
        </div>
      </div>
    </div>
  );
}