
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { useAppContext, EditingProductInfo } from '../../contexts/AppContext'; // Added EditingProductInfo
import { AVAILABLE_FEATURES } from '@/lib/constants';
import type { ProductSetupConfig } from '@/lib/types';

export default function FeatureModal() {
  const { 
    isFeatureModalOpen, 
    closeFeatureModal, 
    currentEditingProduct, // This is now EditingProductInfo | null
    productConfigs,
    addSelectedFeaturesToProduct,
    showBrandedAlert
  } = useAppContext();
  
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);

  const product: ProductSetupConfig | null | undefined = useMemo(() => 
    currentEditingProduct ? productConfigs[currentEditingProduct.id] : null,
    [currentEditingProduct, productConfigs]
  );

  const availableFeaturesForType = useMemo(() => {
    if (!currentEditingProduct || !product) return [];
    
    let existingFeatures: string[] = [];
    const featureType = currentEditingProduct.featureType;

    if (featureType === 'reader') {
      existingFeatures = product.readerFeatures || []; // Changed to readerFeatures
    } else if (featureType === 'streaming') {
      existingFeatures = product.streamingFeatures || []; // Changed to streamingFeatures
    } else if (featureType === 'vertical') {
      existingFeatures = product.verticals || []; // Changed to verticals
    }
    
    return AVAILABLE_FEATURES[featureType].filter(f => !existingFeatures.includes(f));
  }, [currentEditingProduct, product]);

  useEffect(() => {
    if (isFeatureModalOpen) {
      setSelectedFeatures([]); // Reset selections when modal opens
    }
  }, [isFeatureModalOpen]);

  const handleToggleFeature = (feature: string) => {
    setSelectedFeatures(prev =>
      prev.includes(feature) ? prev.filter(f => f !== feature) : [...prev, feature]
    );
  };

  const handleSelectAll = () => {
    if (!currentEditingProduct || !product) return;
    if (currentEditingProduct.featureType === 'vertical') {
      showBrandedAlert("Action Not Allowed: Select All is not available for verticals due to the 3-item limit.", "warning");
      return;
    }
    setSelectedFeatures(availableFeaturesForType);
  };

  const handleSubmit = () => {
    if (!currentEditingProduct || !product) return;
    
    const featureType = currentEditingProduct.featureType;
    let currentFeatureList: string[] = [];
    if (featureType === 'reader') {
      currentFeatureList = product.readerFeatures || []; // Changed to readerFeatures
    } else if (featureType === 'streaming') {
      currentFeatureList = product.streamingFeatures || []; // Changed to streamingFeatures
    } else if (featureType === 'vertical') {
      currentFeatureList = product.verticals || []; // Changed to verticals
    }
    const currentCount = currentFeatureList.length;

    if (featureType === 'vertical' && (currentCount + selectedFeatures.length > 3)) {
      showBrandedAlert(`Maximum Reached: You can only add ${3-currentCount} more vertical(s). Please deselect some.`, "warning");
      return;
    }

    const combinedFeatures = Array.from(new Set([...currentFeatureList, ...selectedFeatures]));
    const finalFeatures = featureType === 'vertical' ? combinedFeatures.slice(0, 3) : combinedFeatures;

    addSelectedFeaturesToProduct(currentEditingProduct.id, featureType, finalFeatures);
    closeFeatureModal();
    showBrandedAlert(`Features Updated: Features for Product ${currentEditingProduct.id} have been updated.`, "success");
  };
  
   if (!currentEditingProduct) return null; 

  const title = `Select ${currentEditingProduct.featureType.charAt(0).toUpperCase() + currentEditingProduct.featureType.slice(1)} Features for Product ${currentEditingProduct.id}`;

  return (
    <Dialog open={isFeatureModalOpen} onOpenChange={(isOpen) => !isOpen && closeFeatureModal()}>
      <DialogContent className="sm:max-w-xl md:max-w-4xl lg:max-w-5xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {availableFeaturesForType.length === 0 && selectedFeatures.length === 0 ? (
          <p className="p-4 text-center text-muted-foreground">No more features available to add for this category, or all available are already selected.</p>
        ) : (
          <>
            {currentEditingProduct.featureType !== 'vertical' && (
              <div className="my-2 text-right">
                <Button variant="outline" size="sm" onClick={handleSelectAll} disabled={availableFeaturesForType.length === 0}>
                  Select All Available
                </Button>
              </div>
            )}
            <ScrollArea className="pr-4" style={{maxHeight: '60vh'}}> 
              <div className="space-y-2">
                {availableFeaturesForType.map((feature, index) => (
                  <div
                    key={feature}
                    className={`flex items-center space-x-2 p-2 rounded-md border cursor-pointer hover:bg-muted/50 ${selectedFeatures.includes(feature) ? 'bg-muted' : ''}`}
                    onClick={() => handleToggleFeature(feature)}
                  >
                    <Checkbox
                      id={`feature-${index}`}
                      checked={selectedFeatures.includes(feature)}
                      onCheckedChange={() => handleToggleFeature(feature)}
                    />
                    <Label htmlFor={`feature-${index}`} className="flex-1 cursor-pointer">{index + 1}. {feature}</Label>
                  </div>
                ))}
                {selectedFeatures.length > 0 && availableFeaturesForType.length === 0 && (
                    <p className='text-sm text-muted-foreground p-2'>All available features for this type have been selected to add.</p>
                )}
              </div>
            </ScrollArea>
          </>
        )}
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleSubmit} disabled={selectedFeatures.length === 0}>
            Add Selected Features
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
