import { ProductSetupConfig } from '../lib/types';

export const VALID_VERTICALS = [
  'D1_1', 'D1_2', 'D1_3', 'D1_4',
  'D2_1', 'D2_2', 'D2_3', 'D2_4',
  'B1', 'B2'
];

export function validateProductData(products: ProductSetupConfig[]): string[] {
  const errors: string[] = [];
  
  products.forEach((product, index) => {
    if (!product.product || product.product.trim().length === 0) {
      errors.push(`Product ${index + 1}: Missing product name`);
    }
    
    if (!product.monthlyRate || product.monthlyRate <= 0) {
      errors.push(`${product.product || 'Unknown product'}: Invalid monthly rate`);
    }
    
    const hasReaderFeatures = product.readerFeatures && product.readerFeatures.length > 0;
    const hasStreamingFeatures = product.streamingFeatures && product.streamingFeatures.length > 0;
    
    if (!hasReaderFeatures && !hasStreamingFeatures) {
      errors.push(`${product.product || 'Unknown product'}: No features selected`);
    }
    
    if (product.verticals) {
      product.verticals.forEach((v: string) => {
        if (!VALID_VERTICALS.includes(v)) {
          errors.push(`${product.product || 'Unknown product'}: Invalid vertical "${v}"`);
        }
      });
    }
  });
  
  return errors;
}
