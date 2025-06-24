'use client';

import React, { useState, useEffect } from 'react';
import attributeData from '@/components/attributeImportance.json';

// ...existing type definitions and component setup...

const AttributeImpactView: React.FC = () => {
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [expandedAttributeId, setExpandedAttributeId] = useState<string | null>(null);

  useEffect(() => {
-    setAttributes(attributeData.attributeList);
+    // attributeImportance.json exports an array directly
+    setAttributes(attributeData as any);
  }, []);

  // ...existing handlers and render logic...
};

export default AttributeImpactView;
