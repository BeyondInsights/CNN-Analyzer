'use client';

import React, { useState, useEffect } from 'react';
import attributeData from '@/components/attributeImportance.json';

// Define the Attribute type according to your JSON structure
type Attribute = {
  id: string;
  name: string;
  importance: number;
  // Add other fields as needed based on attributeImportance.json
};

// ...existing type definitions and component setup...

const AttributeImpactView: React.FC = () => {
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [expandedAttributeId, setExpandedAttributeId] = useState<string | null>(null);

  useEffect(() => {
    // attributeImportance.json exports an array directly
    setAttributes(attributeData as any);
  }, []);

  // ...existing handlers and render logic...

  return (
    <div>
      {/* Render your attributes or UI here */}
      Attribute Impact View Component
    </div>
  );
};

export default AttributeImpactView;
