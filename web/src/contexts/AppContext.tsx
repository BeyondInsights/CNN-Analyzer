// File: src/contexts/AppContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { ProductSetupConfig, MarketFactors, SimulationOptions, ReportData, PricingConfig as LibPricingConfig, ReportType, OutputType } from '@/lib/types';
import { INITIAL_PRODUCT_CONFIG } from '@/lib/constants'; // Import for default config

// Types for clarity
export interface FeaturesList {
  baseProducts: string[];
  reader: string[];
  streaming: string[];
  vertical: string[];
}

export interface PricingConfig {
  minPrice: number;
  maxPrice: number;
}

export interface UiTemplates {
  cardHeaderColor: string;
  buttonColor: string;
  supportsReader: boolean;
  supportsStreaming: boolean;
}

// Interface for the object that describes the product being edited in the feature modal
export interface EditingProductInfo {
  id: number;
  featureType: 'reader' | 'streaming' | 'vertical';
}

export interface AppContextType {
  featuresList: FeaturesList;
  pricingConfig: PricingConfig;
  uiTemplates: UiTemplates;
  updateProductSetupConfig: (slot: number, data: Partial<ProductSetupConfig>) => void;
  openFeatureModal: (id: number, featureType: 'reader' | 'streaming' | 'vertical') => void;
  isFeatureModalOpen: boolean;
  closeFeatureModal: () => void;
  currentEditingProduct: EditingProductInfo | null; 
  productConfigs: Record<number, ProductSetupConfig>; 
  addSelectedFeaturesToProduct: (productId: number, featureType: 'reader' | 'streaming' | 'vertical', features: string[]) => void; 
  showBrandedAlert: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
  // For ProfileSelectModal
  isProfileSelectModalOpen: boolean;
  openProfileSelectModal: () => void;
  closeProfileSelectModal: () => void;
  profileProducts: ProductSetupConfig[]; 
  setSelectedProfileProductsData: (products: ProductSetupConfig[]) => void; 
  finalSelectedProfileProducts: ProductSetupConfig[]; 
  // Added for ReportConfigModal
  isReportConfigModalOpen: boolean;
  openReportConfigModal: () => void;
  closeReportConfigModal: () => void;
  reportSettings: { reportType: ReportType; outputType: OutputType };
  setReportSettings: (settings: { reportType: ReportType; outputType: OutputType }) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}

interface AppContextProviderProps {
  children: React.ReactNode;
}

export function AppContextProvider({ children }: AppContextProviderProps) {
  const [featuresList, setFeaturesList] = useState<FeaturesList>({
    baseProducts: [],
    reader: [],
    streaming: [],
    vertical: []
  });
  const [pricingConfig, setPricingConfig] = useState<PricingConfig>({
    minPrice: 0,
    maxPrice: 100,
  });
  const [uiTemplates, setUiTemplates] = useState<UiTemplates>({
    cardHeaderColor: 'bg-gray-500',
    buttonColor: 'text-blue-500',
    supportsReader: true,
    supportsStreaming: true,
  });

  const [isFeatureModalOpenActual, setIsFeatureModalOpenActual] = useState<boolean>(false);
  const [currentEditingProductActual, setCurrentEditingProductActual] = useState<EditingProductInfo | null>(null); 
  const [productConfigsActual, setProductSetupConfigsActual] = useState<Record<number, ProductSetupConfig>>({});

  // State and functions for ProfileSelectModal
  const [isProfileSelectModalOpenActual, setIsProfileSelectModalOpenActual] = useState<boolean>(false);
  const [profileProductsForModalActual, setProfileProductsForModalActual] = useState<ProductSetupConfig[]>([]);
  const [finalSelectedProfileProductsActual, setFinalSelectedProfileProductsActual] = useState<ProductSetupConfig[]>([]); 

  // State and functions for ReportConfigModal
  const [isReportConfigModalOpenActual, setIsReportConfigModalOpenActual] = useState<boolean>(false);
  const [reportSettingsActual, setReportSettingsActual] = useState<{ reportType: ReportType; outputType: OutputType }>({
    reportType: 'percentage' as ReportType, // ReportType is string, so this is fine
    outputType: 'percentage' as OutputType,
  });

  const openFeatureModal = (id: number, featureType: 'reader' | 'streaming' | 'vertical') => {
    setIsFeatureModalOpenActual(true);
    setCurrentEditingProductActual({ id, featureType }); 
  };

  const appContextCloseFeatureModal = () => {
    setIsFeatureModalOpenActual(false);
    setCurrentEditingProductActual(null);
  };

  const appContextOpenProfileSelectModal = () => {
    const activeProducts = Object.values(productConfigsActual).filter(p => !p.excluded && p.product);
    setProfileProductsForModalActual(activeProducts);
    setIsProfileSelectModalOpenActual(true);
  };

  const appContextCloseProfileSelectModal = () => {
    setIsProfileSelectModalOpenActual(false);
  };

  const appContextSetSelectedProfileProductsData = (products: ProductSetupConfig[]) => { 
    setFinalSelectedProfileProductsActual(products);
  };

  const appContextOpenReportConfigModal = () => setIsReportConfigModalOpenActual(true);
  const appContextCloseReportConfigModal = () => setIsReportConfigModalOpenActual(false);
  const appContextSetReportSettings = (settings: { reportType: ReportType; outputType: OutputType }) => {
    setReportSettingsActual(settings);
  };

  const updateProductSetupConfig = (slot: number, data: Partial<ProductSetupConfig>) => {
    setProductSetupConfigsActual(prev => {
      const currentConfig = prev[slot] || { 
        ...INITIAL_PRODUCT_CONFIG, 
        id: slot.toString(),
        features: { reader: [], streaming: [] },
        pricing: { monthlyRate: 10, pricingType: 'monthly', discount: 'none' }
      };
      const updatedConfig = { ...currentConfig, ...data, id: slot.toString() };
      if (data.product === '') {
        updatedConfig.selectedReaderFeatures = [];
        updatedConfig.selectedStreamingFeatures = [];
        updatedConfig.selectedVerticals = [];
      }
      return {
        ...prev,
        [slot]: updatedConfig
      };
    });
  };

  const appContextAddSelectedFeaturesToProduct = (productId: number, featureType: 'reader' | 'streaming' | 'vertical', features: string[]) => {
    setProductSetupConfigsActual(prev => {
      const currentConfig = prev[productId] || { 
        ...INITIAL_PRODUCT_CONFIG, 
        id: productId.toString(),
        features: { reader: [], streaming: [] },
        pricing: { monthlyRate: 10, pricingType: 'monthly', discount: 'none' }
      };
      const updatedConfig = { ...currentConfig, id: productId.toString() };

      if (featureType === 'reader') {
        updatedConfig.selectedReaderFeatures = features;
      } else if (featureType === 'streaming') {
        updatedConfig.selectedStreamingFeatures = features;
      } else if (featureType === 'vertical') {
        updatedConfig.selectedVerticals = features;
      }
      return { ...prev, [productId]: updatedConfig };
    });
  };

  const appContextShowBrandedAlert = (message: string, type?: 'success' | 'error' | 'warning' | 'info') => {
    alert('[' + (type?.toUpperCase() || 'INFO') + '] ' + message);
  };

  useEffect(() => {
    // Initialize default config values
    if (DEBUG_MODE) console.log("Initializing default context values.");
    
    setProductSetupConfigsActual(prev => {
        const newConfigs = {...prev};
        let changed = false;
        for (let i = 1; i <= 8; i++) {
            if (!newConfigs[i]) {
                newConfigs[i] = { 
                  ...INITIAL_PRODUCT_CONFIG, 
                  id: i.toString(),
                  features: { reader: [], streaming: [] },
                  pricing: { monthlyRate: 10, pricingType: 'monthly', discount: 'none' }
                };
                changed = true;
            }
        }
        return changed ? newConfigs : prev;
    });
  }, []);

  return (
    <AppContext.Provider value={{
      featuresList,
      pricingConfig,
      uiTemplates,
      updateProductSetupConfig,
      openFeatureModal,
      isFeatureModalOpen: isFeatureModalOpenActual,
      closeFeatureModal: appContextCloseFeatureModal,
      currentEditingProduct: currentEditingProductActual, 
      productConfigs: productConfigsActual,
      addSelectedFeaturesToProduct: appContextAddSelectedFeaturesToProduct,
      showBrandedAlert: appContextShowBrandedAlert,
      // For ProfileSelectModal
      isProfileSelectModalOpen: isProfileSelectModalOpenActual,
      openProfileSelectModal: appContextOpenProfileSelectModal,
      closeProfileSelectModal: appContextCloseProfileSelectModal,
      profileProducts: profileProductsForModalActual, 
      setSelectedProfileProductsData: appContextSetSelectedProfileProductsData, 
      finalSelectedProfileProducts: finalSelectedProfileProductsActual, 
      // For ReportConfigModal
      isReportConfigModalOpen: isReportConfigModalOpenActual,
      openReportConfigModal: appContextOpenReportConfigModal,
      closeReportConfigModal: appContextCloseReportConfigModal,
      reportSettings: reportSettingsActual,
      setReportSettings: appContextSetReportSettings,
    }}>
      {children}
    </AppContext.Provider>
  );
}
