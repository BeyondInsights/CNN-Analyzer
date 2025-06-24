import React from 'react';
import styles from './EnhancedProductProfiles.module.css';

interface ProductProfile {
  productName: string;
  respondentIds: number[];
  demographics: {
    age: { [key: string]: number };
    income: { [key: string]: number };
    gender: { [key: string]: number };
    education: { [key: string]: number };
    politicalAffiliation: { [key: string]: number };
  };
}

interface EnhancedProductProfilesProps {
  isVisible: boolean;
  onClose: () => void;
  productProfiles: ProductProfile[];
  totalRespondents: number;
}

const EnhancedProductProfiles: React.FC<EnhancedProductProfilesProps> = ({
  isVisible,
  onClose,
  productProfiles,
  totalRespondents
}) => {
  if (!isVisible) return null;

  const renderDemographicChart = (
    data: { [key: string]: number },
    totalSubscribers: number,
    category: string
  ) => {
    const sortedData = Object.entries(data).sort((a, b) => b[1] - a[1]);
    
    return (
      <div className={styles.demographicSection}>
        <h4>{category}</h4>
        <div className={styles.chartContainer}>
          {sortedData.map(([key, value]) => {
            const percentage = (value / totalSubscribers * 100).toFixed(1);
            const populationPercentage = getPopulationPercentage(category, key);
            
            return (
              <div key={key} className={styles.chartRow}>
                <div className={styles.chartLabel}>
                  <span>{key}</span>
                  <span className={styles.percentage}>{percentage}%</span>
                </div>
                <div className={styles.chartBars}>
                  <div className={styles.barContainer}>
                    <div 
                      className={styles.subscriberBar}
                      style={{ width: `${percentage}%` }}
                    />
                    <div 
                      className={styles.populationBar}
                      style={{ width: `${populationPercentage}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className={styles.legend}>
          <div className={styles.legendItem}>
            <span className={styles.subscriberDot}></span>
            <span>Subscribers</span>
          </div>
          <div className={styles.legendItem}>
            <span className={styles.populationDot}></span>
            <span>TAM Population</span>
          </div>
        </div>
      </div>
    );
  };

  // Mock population percentages - in real app, these would come from your data
  const getPopulationPercentage = (category: string, key: string): number => {
    const populationData: { [key: string]: { [key: string]: number } } = {
      age: {
        '18-24': 12,
        '25-34': 18,
        '35-44': 17,
        '45-54': 18,
        '55-64': 17,
        '65+': 18
      },
      income: {
        '<$25k': 15,
        '$25k-$50k': 22,
        '$50k-$75k': 18,
        '$75k-$100k': 15,
        '$100k-$150k': 18,
        '>$150k': 12
      },
      gender: {
        'Male': 49,
        'Female': 51
      },
      education: {
        'High School': 28,
        'Some College': 29,
        'Bachelor\'s': 33,
        'Graduate': 10
      },
      politicalAffiliation: {
        'Democrat': 35,
        'Republican': 33,
        'Independent': 32
      }
    };
    
    return populationData[category]?.[key] || 0;
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>Product Profiles - TAM Segment Analysis</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>
        
        <div className={styles.content}>
          {productProfiles.length === 0 ? (
            <p className={styles.noData}>No product profiles available. Run a simulation first.</p>
          ) : (
            productProfiles.map((profile, index) => (
              <div key={index} className={styles.productSection}>
                <div className={styles.productHeader}>
                  <h3>{profile.productName}</h3>
                  <span className={styles.subscriberCount}>
                    {profile.respondentIds.length} subscribers ({(profile.respondentIds.length / totalRespondents * 100).toFixed(1)}% of sample)
                  </span>
                </div>
                
                <div className={styles.demographicsGrid}>
                  {renderDemographicChart(profile.demographics.age, profile.respondentIds.length, 'Age')}
                  {renderDemographicChart(profile.demographics.income, profile.respondentIds.length, 'Income')}
                  {renderDemographicChart(profile.demographics.gender, profile.respondentIds.length, 'Gender')}
                  {renderDemographicChart(profile.demographics.education, profile.respondentIds.length, 'Education')}
                </div>
                
                <div className={styles.insights}>
                  <h4>Key Insights</h4>
                  <ul>
                    {generateInsights(profile).map((insight, i) => (
                      <li key={i}>{insight}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))
          )}
        </div>
        
        <div className={styles.footer}>
          <button className={styles.closeButtonFooter} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper function to generate insights
const generateInsights = (profile: ProductProfile): string[] => {
  const insights: string[] = [];
  
  // Age insights
  const topAge = Object.entries(profile.demographics.age)
    .sort((a, b) => b[1] - a[1])[0];
  if (topAge) {
    insights.push(`Strongest appeal to ${topAge[0]} age group`);
  }
  
  // Income insights
  const highIncome = Object.entries(profile.demographics.income)
    .filter(([key]) => key.includes('>$100k') || key.includes('$100k-$150k') || key.includes('>$150k'))
    .reduce((sum, [, value]) => sum + value, 0);
  const totalIncome = Object.values(profile.demographics.income).reduce((sum, val) => sum + val, 0);
  
  if (highIncome / totalIncome > 0.4) {
    insights.push('Over-indexes on high-income households');
  }
  
  // Gender insights
  if (profile.demographics.gender['Male'] > profile.demographics.gender['Female'] * 1.2) {
    insights.push('Skews male audience');
  } else if (profile.demographics.gender['Female'] > profile.demographics.gender['Male'] * 1.2) {
    insights.push('Skews female audience');
  }
  
  return insights;
};

export default EnhancedProductProfiles;