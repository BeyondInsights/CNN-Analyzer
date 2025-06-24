'use client';

import React, { useState, useEffect } from 'react';
import attributeData from '@/data/attributeUtilities.json';

// Define types for our data structure to ensure type safety
interface Attribute {
  id: string;
  displayName: string;
  levelCount: number;
  importance: string;
  type: 'standard' | 'expandable_pricing' | 'expandable_feature';
  levels?: string[];
  tiers?: Tier[];
  subcategories?: Subcategory[];
}

interface Tier {
  id: string;
  displayName: string;
  baseProduct: string;
  levelCount: number;
}

interface Subcategory {
    id: string;
    displayName: string;
}

const AttributeImpactView: React.FC = () => {
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [expandedAttributeId, setExpandedAttributeId] = useState<string | null>(null);

  useEffect(() => {
    // Load the attribute list from the imported JSON
    setAttributes(attributeData.attributeList);
  }, []);

  const handleAttributeClick = (attribute: Attribute) => {
    if (attribute.type === 'standard') {
        // For standard types, we don't need to expand, but you could show details here
        if (DEBUG_MODE) console.log(`Standard attribute clicked: ${attribute.displayName}`);
        setExpandedAttributeId(null); // Ensure nothing is expanded
    } else {
        // For expandable types, toggle the view
        setExpandedAttributeId(prevId => (prevId === attribute.id ? null : attribute.id));
    }
  };

  const renderExpandedView = (attribute: Attribute) => {
    if (expandedAttributeId !== attribute.id) {
      return null;
    }

    // Render based on the type of the expanded attribute
    switch (attribute.type) {
      case 'expandable_pricing':
        return (
          <div className="expanded-details">
            <h4>{attribute.displayName} Tiers</h4>
            <ul>
              {attribute.tiers?.map(tier => (
                <li key={tier.id}>{tier.displayName} ({tier.levelCount} levels)</li>
              ))}
            </ul>
          </div>
        );
      case 'expandable_feature':
         return (
          <div className="expanded-details">
            <h4>{attribute.displayName} Subcategories</h4>
            <ul>
              {attribute.subcategories?.map(sub => (
                <li key={sub.id}>{sub.displayName}</li>
              ))}
            </ul>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="attribute-impact-container">
      <h2>Attribute Impact Analysis</h2>
      <div className="attribute-list">
        {attributes.map(attr => (
          <div key={attr.id} className="attribute-item">
            <button onClick={() => handleAttributeClick(attr)} className="attribute-button">
              {attr.displayName}
            </button>
            {renderExpandedView(attr)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AttributeImpactView;
