"use client";

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useEffect } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import type { ProductSetupConfig, BaseProductName, ProductPricingType, ProductDiscountType } from '@/lib/types';

interface ProductCardProps {
  productConfig: ProductSetupConfig;
}

const PRODUCT_TYPES = ['CNN Reader', 'CNN Streaming', 'CNN All-Access'] as const;

const pricingTable = {
  'CNN Reader': {
    0: { min: 5.0, max: 15.0, default: 10.0 },
    1: { min: 7.0, max: 18.0, default: 12.0 },
    2: { min: 10.0, max: 22.0, default: 15.0 },
    3: { min: 12.0, max: 25.0, default: 18.0 }
  },
  'CNN Streaming': {
    0: { min: 8.0, max: 20.0, default: 14.0 },
    1: { min: 10.0, max: 25.0, default: 17.0 },
    2: { min: 13.0, max: 30.0, default: 21.0 },
    3: { min: 16.0, max: 35.0, default: 25.0 }
  },
  'CNN All-Access': {
    0: { min: 15.0, max: 35.0, default: 25.0 },
    1: { min: 18.0, max: 40.0, default: 29.0 },
    2: { min: 22.0, max: 45.0, default: 33.0 },
    3: { min: 25.0, max: 50.0, default: 37.0 }
  }
};

const toBaseProductName = (productType: string): BaseProductName => productType as BaseProductName;
const toProductSetupConfigName = (baseProduct: BaseProductName | ""): string => baseProduct || "";

export default function ProductCard({ productConfig }: ProductCardProps) {
  const { openFeatureModal, updateProductSetupConfig, uiTemplates, pricingConfig } = useAppContext();
  
  const [currentBaseProduct, setCurrentBaseProduct] = useState<BaseProductName | "">(
    productConfig.product as BaseProductName || ""
  );
  const [currentRate, setCurrentRate] = useState(productConfig.monthlyRate || 10.0);
  const [currentPricingType, setCurrentPricingType] = useState<ProductPricingType>(
    productConfig.pricingType || 'monthly'
  );
  const [currentDiscount, setCurrentDiscount] = useState<ProductDiscountType>(
    productConfig.discount || ''
  );
  const [isExcluded, setIsExcluded] = useState(productConfig.excluded || false);
  const [currentPricingRange, setCurrentPricingRange] = useState({ min: 5.0, max: 50.0, default: 10.0 });

  // Effect to initialize pricing range based on product configuration
  useEffect(() => {
    if (productConfig?.dynamicPricing && pricingConfig) {
      if (pricingConfig.tieredPricing) {
        const tier = pricingConfig.tiers?.[0];
        if (tier) {
          setCurrentPricingRange({ min: tier.minPrice, max: tier.maxPrice, default: tier.minPrice });
        } else {
          setCurrentPricingRange({ min: pricingConfig.minPrice, max: pricingConfig.maxPrice, default: pricingConfig.minPrice });
        }
      } else {
        setCurrentPricingRange({ min: pricingConfig.minPrice, max: pricingConfig.maxPrice, default: pricingConfig.minPrice });
      }
    } else if (pricingConfig) {
      setCurrentPricingRange({ min: pricingConfig.minPrice, max: pricingConfig.maxPrice, default: pricingConfig.minPrice });
    }
  }, [productConfig, pricingConfig]);

  const handleBaseProductChange = (value: BaseProductName | "") => {
    setCurrentBaseProduct(value);
    const productForContext = toProductSetupConfigName(value);
    let newRate = currentPricingRange.default;
    if (value) {
      const vCount = Math.min((productConfig.selectedVerticals || []).length, 3) as 0 | 1 | 2 | 3;
      const range = pricingTable[value]?.[vCount];
      if (range) newRate = range.default;
    }
    setCurrentRate(newRate);
    updateProductSetupConfig(productConfig.id, { product: productForContext, monthlyRate: newRate });
  };

  const handleSliderChange = (value: number[]) => {
    setCurrentRate(value[0]);
    updateProductSetupConfig(productConfig.id, { monthlyRate: value[0] });
  };

  const handlePricingTypeBtnClick = (type: ProductPricingType) => {
    setCurrentPricingType(type);
    const newDiscount = type !== 'both' ? '' : currentDiscount;
    if (type !== 'both') setCurrentDiscount('');
    updateProductSetupConfig(productConfig.id, { pricingType: type, discount: newDiscount });
  };

  const handleDiscountRadioChange = (value: ProductDiscountType) => {
    setCurrentDiscount(value);
    updateProductSetupConfig(productConfig.id, { discount: value });
  };

  const handleExcludedChange = (checked: boolean) => {
    setIsExcluded(checked);
    updateProductSetupConfig(productConfig.id, { excluded: checked });
  };

  const headerText = productConfig.product || `PRODUCT ${productConfig.id}`;
  const cardBgColor = isExcluded ? 'bg-gray-100' : 'bg-white';
  const headerUiColor = uiTemplates?.cardHeaderColor || 'bg-red-600';

  return (
    <div className="relative">
      <Card className={`w-[320px] flex-shrink-0 shadow-lg rounded-lg border flex flex-col ${cardBgColor} ${isExcluded ? 'opacity-60' : ''}`}>
        <CardHeader className={`flex flex-row items-center justify-center p-3 rounded-t-lg text-white ${isExcluded ? 'bg-gray-400' : headerUiColor}`}>
          <CardTitle className="text-md font-semibold truncate" title={headerText}>{headerText}</CardTitle>
        </CardHeader>
        <CardContent className="p-3 space-y-3 flex-grow">
          <Select value={currentBaseProduct} onValueChange={handleBaseProductChange} disabled={isExcluded}>
            <SelectTrigger><SelectValue placeholder="Select Base Product" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="">Select Base Product</SelectItem>
              {PRODUCT_TYPES.map(ptype => (
                <SelectItem key={ptype} value={toBaseProductName(ptype)}>
                  {ptype}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {(currentBaseProduct === 'CNN Reader' || currentBaseProduct === 'CNN All-Access') && (
            <div>
              <Label className="text-xs">Reader Features ({productConfig.selectedReaderFeatures?.length || 0} selected)</Label>
              <Button variant="outline" size="sm" className="w-full mt-1 text-xs" onClick={() => openFeatureModal(productConfig.id, 'reader')} disabled={isExcluded || !currentBaseProduct}>+ Add Features</Button>
            </div>
          )}
          {(currentBaseProduct === 'CNN Streaming' || currentBaseProduct === 'CNN All-Access') && (
            <div>
              <Label className="text-xs">Streaming Features ({productConfig.selectedStreamingFeatures?.length || 0} selected)</Label>
              <Button variant="outline" size="sm" className="w-full mt-1 text-xs" onClick={() => openFeatureModal(productConfig.id, 'streaming')} disabled={isExcluded || !currentBaseProduct}>+ Add Features</Button>
            </div>
          )}
          <div>
            <Label className="text-xs">Verticals ({productConfig.selectedVerticals?.length || 0} selected)</Label>
            <Button variant="outline" size="sm" className="w-full mt-1 text-xs" onClick={() => openFeatureModal(productConfig.id, 'vertical')} disabled={isExcluded || !currentBaseProduct}>+ Add Verticals</Button>
          </div>

          <div className="pt-2">
            <Label className="text-sm font-medium">Configure Pricing</Label>
            <div className="flex gap-1 mt-1 mb-2">
              {(['monthly', 'annual', 'both'] as const).map(type => (
                <Button key={type} variant={currentPricingType === type ? 'default' : 'outline'} size="sm" onClick={() => handlePricingTypeBtnClick(type)} className="flex-1 capitalize text-xs h-8" disabled={isExcluded || !currentBaseProduct}>{type}</Button>
              ))}
            </div>

            {currentPricingType === 'both' && (
              <Card className="bg-muted/30 p-2 my-2">
                <CardContent className="p-0">
                  <Label className="text-xs font-semibold mb-1 block">Discount for Annual</Label>
                  <RadioGroup value={currentDiscount} onValueChange={handleDiscountRadioChange} className="mt-1 space-y-1">
                    {(['', 'free', '30', '50'] as ProductDiscountType[]).map(opt => (
                      <div key={opt || 'none'} className="flex items-center space-x-2">
                        <RadioGroupItem value={opt} id={`${productConfig.id}-discount-${opt || 'none'}`} disabled={isExcluded || !currentBaseProduct} />
                        <Label htmlFor={`${productConfig.id}-discount-${opt || 'none'}`} className="text-xs font-normal">
                          {opt === '' ? 'None' : opt === 'free' ? '3 Months Free' : `${opt}% Off`}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </CardContent>
              </Card>
            )}

            <Label htmlFor={`slider-${productConfig.id}`} className="text-xs">Monthly Rate: ${currentRate.toFixed(2)}</Label>
            <Slider
              id={`slider-${productConfig.id}`}
              value={[currentRate]}
              min={currentPricingRange.min}
              max={currentPricingRange.max}
              step={0.50}
              onValueChange={handleSliderChange}
              disabled={isExcluded || !currentBaseProduct}
              className="my-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>${currentPricingRange.min.toFixed(2)}</span>
              <span>${currentPricingRange.max.toFixed(2)}</span>
            </div>
            <div className="text-xs mt-2 p-3 border rounded-md bg-background">
              <div className="font-bold text-base text-foreground">Monthly: ${currentRate.toFixed(2)}</div>
              <div className="text-sm text-muted-foreground">Inferred Annual: ${(currentRate * 12).toFixed(2)}</div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="p-3 mt-auto">
          <Label htmlFor={`excluded-${productConfig.id}`} className="flex items-center space-x-2 text-xs cursor-pointer">
            <Checkbox id={`excluded-${productConfig.id}`} checked={isExcluded} onCheckedChange={handleExcludedChange} />
            <span>Exclude from Simulation</span>
          </Label>
        </CardFooter>
      </Card>
      {isExcluded && (
        <div className="absolute inset-0 bg-slate-200/70 flex items-center justify-center rounded-lg">
          <div className="text-red-600 font-bold text-xl transform -rotate-15 border-4 border-red-600 p-2 whitespace-nowrap bg-white/80">
            EXCLUDED FROM SIMULATION
          </div>
        </div>
      )}
    </div>
  );
}