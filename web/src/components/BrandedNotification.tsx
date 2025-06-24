import React, { useEffect } from 'react';
import styles from './BrandedNotification.module.css';

interface BrandedNotificationProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  type?: 'success' | 'error' | 'info';
}

const BrandedNotification: React.FC<BrandedNotificationProps> = ({ 
  message, 
  isVisible, 
  onClose, 
  type = 'info' 
}) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000); // Auto-close after 5 seconds
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className={`${styles.notification} ${styles[type]}`}>
      <div className={styles.content}>
        <span className={styles.icon}>
          {type === 'success' && '✓'}
          {type === 'error' && '✕'}
          {type === 'info' && '🔥'}
        </span>
        <span className={styles.message}>{message}</span>
        <button className={styles.closeButton} onClick={onClose}>×</button>
      </div>
      <div className={styles.brandingBar}>
        <span className={styles.brandText}>BEYOND Insights</span>
      </div>
    </div>
  );
};

export default BrandedNotification;