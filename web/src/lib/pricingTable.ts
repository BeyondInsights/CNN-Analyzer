// src/lib/pricingTable.ts

export type BaseProductName =
  | "CNN Reader"
  | "CNN Streaming"
  | "CNN All-Access"
  | "CNN Standalone Vertical";

export interface PriceRange {
  min: number;
  max: number;
  default: number; // Added default property
}

export const pricingTable: Record<BaseProductName, Record<0 | 1 | 2 | 3, PriceRange>> = {
  "CNN Reader": {
    0: { min: 3.99,  max: 14.99, default: 6.99 },
    1: { min: 5.49,  max: 16.99, default: 8.49 },
    2: { min: 6.99,  max: 19.49, default: 10.99 },
    3: { min: 8.49,  max: 21.99, default: 12.99 },
  },

  "CNN Streaming": {
    0: { min: 4.99,  max: 16.99, default: 8.49 },
    1: { min: 6.49,  max: 17.99, default: 9.99 },
    2: { min: 7.99,  max: 21.49, default: 11.99 },
    3: { min: 9.49,  max: 24.99, default: 13.99 },
  },

  "CNN All-Access": {
    0: { min: 5.99,  max: 24.99, default: 11.99 },
    1: { min: 7.99,  max: 25.99, default: 12.99 },
    2: { min: 9.99,  max: 30.49, default: 14.99 },
    3: { min: 11.99, max: 34.99, default: 16.99 },
  },

  "CNN Standalone Vertical": {
    0: { min: 1.99,  max: 7.99,  default: 3.99  },
    1: { min: 1.99,  max: 7.99,  default: 3.99  },
    2: { min: 1.99,  max: 7.99,  default: 3.99  },
    3: { min: 1.99,  max: 7.99,  default: 3.99  },
  },
};