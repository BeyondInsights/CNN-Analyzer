"use client";

import { useState, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { PRICING_RANGES } from '@/lib/constants';
import type { ProductSetupConfig, PricingType, DiscountType } from '@/lib/types';

interface PricingConfigProps {
  productConfig: ProductSetupConfig;
  onUpdate: (updates: Partial<ProductSetupConfig>) => void;
}

export default function PricingConfig({ productConfig, onUpdate }: PricingConfigProps) {
  // Changed 'verticals' to 'verticals' to match updated ProductSetupConfig type
  const { product, verticals = [], monthlyRate, pricingType, discount } = productConfig;
  const sliderId = `rate-slider-${productConfig.id}`;

  const pricingDetails = useMemo(() => {
    const safeDefaultRange = { min: 5, max: 50, default: 10, prices: [5, 10, 25, 50] };
    let calculatedRange = { ...safeDefaultRange };

    if (product) {
      let productSpecificRangeData;
      if (product === 'CNN Standalone Vertical') {
        // For standalone vertical, all vertical counts use the same range
        productSpecificRangeData = PRICING_RANGES[product][0];
      } else {
        // Use verticals here
        const verticalCount = verticals.length;
        const productRanges = PRICING_RANGES[product as keyof typeof PRICING_RANGES];
        if (productRanges && typeof productRanges === 'object' && !Array.isArray(productRanges)) {
          productSpecificRangeData = (productRanges as any)[verticalCount] || (productRanges as any)[0];
        }
      }

      if (productSpecificRangeData && typeof productSpecificRangeData === 'object' && 'min' in productSpecificRangeData) {
        if (typeof productSpecificRangeData.min === 'number') {
          calculatedRange.min = productSpecificRangeData.min;
        }
        if (typeof productSpecificRangeData.max === 'number') {
          calculatedRange.max = productSpecificRangeData.max;
        }
        if (typeof productSpecificRangeData.default === 'number') {
          calculatedRange.default = productSpecificRangeData.default;
        }
        if ('prices' in productSpecificRangeData && Array.isArray(productSpecificRangeData.prices)) {
          calculatedRange.prices = productSpecificRangeData.prices;
        }
      }
    }

    // Final safety net: ensure min and max are valid numbers and min <= max.
    if (typeof calculatedRange.min !== 'number' || 
        typeof calculatedRange.max !== 'number' || 
        calculatedRange.min > calculatedRange.max) {
      calculatedRange.min = safeDefaultRange.min;
      calculatedRange.max = safeDefaultRange.max;
    }
    
    // Ensure 'default' is within the final min/max range
    if (typeof calculatedRange.default !== 'number' || 
        calculatedRange.default < calculatedRange.min || 
        calculatedRange.default > calculatedRange.max) {
      calculatedRange.default = calculatedRange.min; // Fallback for default if out of bounds
    }

    return calculatedRange;
  }, [product, verticals.length]); // Use verticals in dependency array
  
  useEffect(() => {
    const { min, max } = pricingDetails; // Should always be numbers now
    let newRate = monthlyRate;
    let needsUpdate = false;

    const currentRate = parseFloat(monthlyRate as any);
    if (isNaN(currentRate)) {
        onUpdate({ monthlyRate: pricingDetails.default }); 
        return;
    }

    if (currentRate < min) {
      newRate = min;
      needsUpdate = true;
    } else if (currentRate > max) {
      newRate = max;
      needsUpdate = true;
    }

    if (needsUpdate) {
      onUpdate({ monthlyRate: newRate });
    }
  }, [pricingDetails, monthlyRate, onUpdate]);

  const handleSliderChange = (value: number[]) => {
    onUpdate({ monthlyRate: value[0] });
  };

  const handlePricingTypeChange = (type: PricingType) => {
    onUpdate({ pricingType: type, discount: type !== 'both' ? '' : discount });
  };

  const handleDiscountChange = (newDiscount: DiscountType) => {
    onUpdate({ discount: newDiscount });
  };

  const renderPricingDisplay = () => {
    const rate = monthlyRate;
    const displayRate = typeof rate === 'number' ? rate : pricingDetails.default;

    if (pricingType === 'both' && discount) {
      let year1MonthlyTotal = displayRate * 12; 
      let year1AnnualTotal = displayRate * 12;

      if (discount === 'free') year1AnnualTotal = displayRate * 9; 
      else if (discount === '30') year1AnnualTotal = displayRate * 12 * 0.7;
      else if (discount === '50') year1AnnualTotal = displayRate * 12 * 0.5;

      return (
        <table className="w-full text-xs border-collapse mt-2">
          <thead>
            <tr className="bg-muted/30">
              <th className="border p-1 text-left"></th>
              <th className="border p-1">$/mo</th>
              <th className="border p-1">Month-to-Month (Total)</th>
              <th className="border p-1">12-Mo Sub (Total)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border p-1 font-semibold">Year 1</td>
              <td className="border p-1 text-center">${displayRate.toFixed(2)}</td>
              <td className="border p-1 text-center">${year1MonthlyTotal.toFixed(2)}</td>
              <td className="border p-1 text-center">${year1AnnualTotal.toFixed(2)}</td>
            </tr>
            <tr>
              <td className="border p-1 font-semibold">Year 2</td>
              <td className="border p-1 text-center">${displayRate.toFixed(2)}</td>
              <td className="border p-1 text-center">${(displayRate * 12).toFixed(2)}</td>
              <td className="border p-1 text-center">${(displayRate * 12).toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      );
    } else if (pricingType === 'both' && !discount) {
      return (
        <div className="text-sm mt-2 p-2 text-center text-muted-foreground">
          Please select a discount to see the pricing table.
        </div>
      );
    } else if (pricingType === 'annual') {
      return (
        <div className="text-sm mt-2 space-y-1">
          <div><strong>Annual:</strong> ${(displayRate * 12).toFixed(2)}</div>
          <div className="text-muted-foreground">Inferred Monthly: ${displayRate.toFixed(2)}</div>
        </div>
      );
    } else { // Monthly
      return (
        <div className="text-sm mt-2 space-y-1">
          <div><strong>Monthly:</strong> ${displayRate.toFixed(2)}</div>
          <div className="text-muted-foreground">Inferred Annual: ${(displayRate * 12).toFixed(2)}</div>
        </div>
      );
    }
  };

  return (
    <div className="space-y-3 mt-3">
      <Label className="text-sm font-medium">Configure Pricing</Label>
      <div className="flex gap-2">
        {(['monthly', 'annual', 'both'] as PricingType[]).map(type => (
          <Button
            key={type}
            variant={pricingType === type ? 'default' : 'outline'}
            size="sm"
            onClick={() => handlePricingTypeChange(type)}
            className="flex-1 capitalize"
          >
            {type === 'monthly' ? 'Monthly Only' : type === 'annual' ? 'Annual Only' : type}
          </Button>
        ))}
      </div>

      {pricingType === 'both' && (
        <Card className="bg-muted/20 p-3">
          <CardContent className="p-0">
            <Label className="text-xs font-semibold">Select Discount for Annual Plan</Label>
            <RadioGroup value={discount} onValueChange={(value: string) => handleDiscountChange(value as DiscountType)} className="mt-2 space-y-1.5">
              {(['free', '30', '50'] as DiscountType[]).map(discOpt => (
                <div key={discOpt} className="flex items-center space-x-2">
                  <RadioGroupItem value={discOpt} id={`discount-${productConfig.id}-${discOpt}`} />
                  <Label htmlFor={`discount-${productConfig.id}-${discOpt}`} className="text-xs">
                    {discOpt === 'free' ? '3 Months Free' : `${discOpt}% off 12-Mo Sub`}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>
      )}
      
      <div className="mt-3">
        <Label htmlFor={sliderId} className="text-xs font-medium">Monthly Rate ($/mo)</Label>
        <Slider
          id={sliderId}
          min={pricingDetails.min} // Guaranteed to be a number
          max={pricingDetails.max} // Guaranteed to be a number
          step={0.01} 
          value={[typeof monthlyRate === 'number' ? monthlyRate : pricingDetails.default]} // Ensure value is also a number
          onValueChange={handleSliderChange}
          className="my-2 w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>${pricingDetails.min.toFixed(2)}/mo</span>
          <span>${pricingDetails.max.toFixed(2)}/mo</span>
        </div>
      </div>

      <div className="p-2 border rounded-md bg-background shadow-inner">
        {renderPricingDisplay()}
      </div>
    </div>
  );
}
