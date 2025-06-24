'use client';
const DEBUG_MODE = false;

import React, { useState, useEffect } from 'react';
import { auth } from '@/lib/firebaseClient';
import { loadPrimaryDataFiles } from '@/lib/simulatorClient'; // Changed from secureSimulatorClient
import { onAuthStateChanged } from 'firebase/auth';
import { signInAnonymously } from 'firebase/auth';
import marketModalStyles from '@/components/MarketFactorsModal.module.css';
import AttributeImpactModal from '@/components/AttributeImpactModal';
import CNNUtilitiesModal from '@/components/CNNUtilitiesModal';
import PasswordProtect from '@/components/cnn-analyzer/PasswordProtect'; // Fixed import path
import styles from './page.module.css';
import AboutModelModal from '@/components/AboutModelModal';

import readerFeatureDescriptionsData from '@/data/readerFeatureDescriptions.json';
import streamingFeatureDescriptionsData from '@/data/streamingFeatureDescriptions.json';
import verticalDescriptionsData from '@/data/verticalDescriptions.json';
import coreProductDescriptionsData from '@/data/coreProductDescriptions.json';
import MarketFactorsModal from '@/components/MarketFactorsModal';
import BrandedNotification from '@/components/BrandedNotification';
import SimulationPromptModal from '@/components/SimulationPromptModal';
import EnhancedProductProfiles from '@/components/EnhancedProductProfiles';
import PriceSensitivityControl from '@/components/PriceSensitivityControl';

// Import components
import ReportDisplay from '@/components/ReportDisplay';
import { runServerSimulation } from './actions';

// Type definitions (keeping all your existing types)
interface CardData {
  product: string;
  readerFeatures: string[];
  streamingFeatures: string[];
  verticals: string[];
  monthlyRate: number;
  pricingType: string;
  discount: string;
}

interface MarketFactors {
  baseConversion: number;
  awareness: number;
  distribution: number;
  competitive: number;
  marketing: number;
  yearOneAdoption: number;
  awarenessWeight: number;
  distributionWeight: number;
  competitiveWeight: number;
  marketingWeight: number;
  yearOneWeight: number;
  enablePriceSensitivity: boolean;
  priceThreshold: number;
  lowPriceMultiplier: number;
  highPriceMultiplier: number;
}

type ReportType = 'tiered' | 'independent';
type OutputType = 'percentage' | 'count' | 'revenue';

interface ReportData {
  reportType: ReportType;
  outputType: OutputType;
  overallShare: number[];
  segmentShares: {
    segmentName: string;
    shares: number[];
  }[];
}

interface ProductProfileData {
  productName: string;
  description: string;
  targetAudience: string;
  keyFeatures: string[];
  pricing: {
    monthlyRate: number;
    annualRate: number;
    pricingType: string;
    discount: string;
  };
  configuration: {
    readerFeatures: string[];
    streamingFeatures: string[];
    verticals: string[];
  };
}

interface SensitivityPoint {
  productName: string;
  basePrice: number;
  pricePoints: {
    priceVariation: number;
    price: number;
    adoptionRate: number;
  }[];
}

interface SimulationOptions {
  takeThreshold: number;
  drnFactor: number;
  allocationMethod: 'proportional' | 'max';
  enablePriceTiers?: boolean;
  priceThreshold?: number;
  lowPriceMultiplier?: number;
  highPriceMultiplier?: number;
  usePiecewisePricing?: boolean;
  marketWeights?: {
    awareness: number;
    distribution: number;
    competitive: number;
    marketing: number;
    yearOneAdoption: number;
  };
}

interface InputConfig {
  products: any[];
  reportType: ReportType;
  outputType: OutputType;
  marketFactors: MarketFactors;
  simulationOptions: SimulationOptions;
}

export default function Page() {
  // Constants
  const MAX_PRODUCTS = 8;
  
  // Updated pricing ranges to match attached file
  const pricingRanges = {
    'CNN Reader': {
      0: { prices: [3.99, 6.99, 9.99, 14.99], min: 3.99, max: 14.99, default: 6.99 },
      1: { prices: [5.49, 8.49, 11.49, 16.99], min: 5.49, max: 16.99, default: 8.49 },
      2: { prices: [6.99, 10.99, 14.99, 19.49], min: 6.99, max: 19.49, default: 10.99 },
      3: { prices: [8.49, 12.99, 16.99, 21.99], min: 8.49, max: 21.99, default: 12.99 }
    },
    'CNN Streaming': {
      0: { prices: [4.99, 8.49, 11.99, 16.99], min: 4.99, max: 16.99, default: 8.49 },
      1: { prices: [6.49, 9.99, 13.99, 17.99], min: 6.49, max: 17.99, default: 9.99 },
      2: { prices: [7.99, 11.99, 15.99, 21.49], min: 7.99, max: 21.49, default: 11.99 },
      3: { prices: [9.49, 13.99, 17.99, 24.99], min: 9.49, max: 24.99, default: 13.99 }
    },
    'CNN All-Access': {
      0: { prices: [5.99, 11.99, 17.99, 24.99], min: 5.99, max: 24.99, default: 11.99 },
      1: { prices: [7.99, 12.99, 18.99, 25.99], min: 7.99, max: 25.99, default: 12.99 },
      2: { prices: [9.99, 14.99, 21.49, 30.49], min: 9.99, max: 30.49, default: 14.99 },
      3: { prices: [11.99, 16.99, 23.99, 34.99], min: 11.99, max: 34.99, default: 16.99 }
    },
    'CNN Standalone Vertical': { prices: [1.99, 3.99, 5.99, 7.99], min: 1.99, max: 7.99, default: 3.99 }
  };

  // ============ STATIC DATA (Already loaded from imports) ============
  const AVAILABLE_FEATURES_LISTS = {
    reader: Object.keys(readerFeatureDescriptionsData),
    streaming: Object.keys(streamingFeatureDescriptionsData),
    vertical: Object.keys(verticalDescriptionsData),
  };

  // ============ FIREBASE STORAGE DATA ============
  const [primaryData, setPrimaryData] = useState<any>(null);
  const [dataError, setDataError] = useState<string | null>(null);
  const [isDataLoading, setIsDataLoading] = useState(false);

  // Initialize card setup
  const initialCardSetup = (): Record<number, CardData> => {
    const setup: Record<number, CardData> = {};
    for (let i = 1; i <= MAX_PRODUCTS; i++) {
      setup[i] = {
        product: '',
        readerFeatures: [],
        streamingFeatures: [],
        verticals: [],
        monthlyRate: 10,
        pricingType: '',
        discount: ''
      };
    }
    return setup;
  };
  
  // Define DEFAULT_MARKET_FACTORS here - BEFORE STATE DECLARATIONS
  const DEFAULT_MARKET_FACTORS: MarketFactors = {
    baseConversion: 1.0,
    awareness: 70,
    distribution: 85,
    competitive: 90,
    marketing: 80,
    yearOneAdoption: 65,
    awarenessWeight: 30,
    distributionWeight: 25,
    competitiveWeight: 10,
    marketingWeight: 15,
    yearOneWeight: 20,
    enablePriceSensitivity: true,
    priceThreshold: 12,
    lowPriceMultiplier: 1.3,
    highPriceMultiplier: 0.8
  };
  
  // ============ STATE DECLARATIONS ============
  const [cardDataState, setCardDataState] = useState<Record<number, CardData>>(initialCardSetup());
  const [activeProductsState, setActiveProductsState] = useState<Set<number>>(new Set([1, 2, 3, 4]));
  const [currentModalDataState, setCurrentModalDataState] = useState<{ cardNum: number; type: 'reader' | 'streaming' | 'vertical' } | null>(null);
  const [currentReportTypeState, setCurrentReportTypeState] = useState<ReportType>('tiered');
  const [currentOutputTypeState, setCurrentOutputTypeState] = useState<OutputType>('percentage');
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());
  const [userId, setUserId] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false); // Not loading
  const [isPasswordAuthenticated, setIsPasswordAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState<string>('');

  // Modal states
  const [featureModalVisible, setFeatureModalVisible] = useState(false);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [sensitivityModalVisible, setSensitivityModalVisible] = useState(false);
  const [showAboutModel, setShowAboutModel] = useState(false);
  const [isMarketSizingModalVisible, setIsMarketSizingModalVisible] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [showNotification, setShowNotification] = useState(false);
  const [notificationType, setNotificationType] = useState<'success' | 'error' | 'info'>('success');
  
  const showBrandedAlert = (title: string, message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotificationMessage(`${title}: ${message}`);
    setNotificationType(type);
    setShowNotification(true);
  };
  
  // New states for CNN Utilities and Attribute Impact
  const [showCNNUtilities, setShowCNNUtilities] = useState(false);
  const [showAttributeImpact, setShowAttributeImpact] = useState(false);

  // Report display states
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isReportOverlay, setIsReportOverlay] = useState(true);
  const [isSimulating, setIsSimulating] = useState(false);
  const [profileData, setProfileData] = useState<ProductProfileData[]>([]);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(false);
  const [sensitivityData, setSensitivityData] = useState<SensitivityPoint[]>([]);
  const [isAnalyzingSensitivity, setIsAnalyzingSensitivity] = useState(false);
  const [includePriceSensitivity, setIncludePriceSensitivity] = useState(false);
  
  // Market factors
  const [marketFactors, setMarketFactors] = useState<MarketFactors>(DEFAULT_MARKET_FACTORS);
  
  // Add these state variables with your other market factors states:
  const [priceSensitivityEnabled, setPriceSensitivityEnabled] = useState(false);
  const [priceThresholdAdjustment, setPriceThresholdAdjustment] = useState(0);
  const [lowPriceMultiplier, setLowPriceMultiplier] = useState(1.3);
  const [highPriceMultiplier, setHighPriceMultiplier] = useState(0.8);
  const [priceThreshold, setPriceThreshold] = useState(DEFAULT_MARKET_FACTORS.priceThreshold);
  
  // Review modals states
  const [isReviewCoreProductsModalVisible, setIsReviewCoreProductsModalVisible] = useState(false);
  const [activeProductTab, setActiveProductTab] = useState('reader');
  const [isReviewFeaturesModalVisible, setIsReviewFeaturesModalVisible] = useState(false);
  const [isReviewVerticalsModalVisible, setIsReviewVerticalsModalVisible] = useState(false);
  const [activeReviewTab, setActiveReviewTab] = useState<'reader' | 'streaming'>('reader');
  const [selectedReviewVertical, setSelectedReviewVertical] = useState<string>('');
  const [verticalDescription, setVerticalDescription] = useState<string>('');
  const [verticalFeaturesForReview, setVerticalFeaturesForReview] = useState<string[]>([]);

  // Market factors modal
  const [isMarketFactorsModalVisible, setIsMarketFactorsModalVisible] = useState(false);

  // Market factor weights
  const [awarenessWeight, setAwarenessWeight] = useState(30);
  const [distributionWeight, setDistributionWeight] = useState(25);
  const [competitiveWeight, setCompetitiveWeight] = useState(10);
  const [marketingWeight, setMarketingWeight] = useState(15);
  const [yearOneWeight, setYearOneWeight] = useState(20);
  const [showAdvancedMarketSettings, setShowAdvancedMarketSettings] = useState(false);

  // ============ PASSWORD AUTH HANDLER ============
  const handlePasswordAuthenticated = (email: string) => {
    setUserEmail(email);
    setIsPasswordAuthenticated(true);
  };

  // ============ FIREBASE AUTH EFFECT ============

useEffect(() => {
  const unsubscribe = auth.onAuthStateChanged((user) => {
    setUserId(user?.uid || null);
    setIsAuthLoading(false);
  });
  return () => unsubscribe();
}, []);

  // ============ FIREBASE STORAGE DATA LOADING ============
  useEffect(() => {
    const loadSecureData = async () => {
      if (!userId) return; // Only load if user is authenticated
      
      setIsDataLoading(true);
      setDataError(null);
      
      try {
        const data = await loadPrimaryDataFiles();
        setPrimaryData(data);
        
        // Now you have access to:
        // - data.utilities (respondentUtilities.json)
        // - data.data (respondentData.json)  
        // - data.profile (respondentProfile.json)
        
        console.log('Successfully loaded secure data from Firebase Storage');
      } catch (error) {
        console.error('Failed to load secure data:', error);
        setDataError(error instanceof Error ? error.message : 'Failed to load data');
      } finally {
        setIsDataLoading(false);
      }
    };

    // Load data when user is authenticated
    if (userId && !primaryData) {
      loadSecureData();
    }
  }, [userId, primaryData]);
  
  // ============ MARKET FACTORS SYNC EFFECT ============
  useEffect(() => {
    if (isMarketFactorsModalVisible) {
      setAwarenessWeight(marketFactors.awarenessWeight || 30);
      setDistributionWeight(marketFactors.distributionWeight || 25);
      setCompetitiveWeight(marketFactors.competitiveWeight || 10);
      setMarketingWeight(marketFactors.marketingWeight || 15);
      setYearOneWeight(marketFactors.yearOneWeight || 20);
      setPriceSensitivityEnabled(marketFactors.enablePriceSensitivity || false);
      setPriceThreshold(marketFactors.priceThreshold || 12);
      setLowPriceMultiplier(marketFactors.lowPriceMultiplier || 1.3);
      setHighPriceMultiplier(marketFactors.highPriceMultiplier || 0.8);
    }
  }, [isMarketFactorsModalVisible, marketFactors]);

  // ============ HELPER FUNCTIONS ============
  const getPricingRangeForProduct = (productType: string, verticalCount: number = 0) => {
    if (productType === 'CNN Standalone Vertical') {
      return pricingRanges['CNN Standalone Vertical'];
    }
    const ranges = pricingRanges[productType as keyof typeof pricingRanges];
    if (!ranges || typeof ranges !== 'object') return null;
    
    const verticalKey = Math.min(verticalCount, 3);
    return ranges[verticalKey as keyof typeof ranges] || ranges[0];
  };

  const toggleProduct = (productId: number) => {
    setActiveProductsState(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  const toggleCardExpansion = (cardNum: number) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cardNum)) {
        newSet.delete(cardNum);
      } else {
        newSet.add(cardNum);
      }
      return newSet;
    });
  };

  const openFeatureModal = (cardNum: number, type: 'reader' | 'streaming' | 'vertical') => {
    const card = cardDataState[cardNum];
    
    // Check vertical limit
    if (type === 'vertical' && card.product !== 'CNN Standalone Vertical' && card.verticals.length >= 3) {
      alert('Maximum 3 verticals allowed for this product type.');
      return;
    }
    
    setCurrentModalDataState({ cardNum, type });
    setFeatureModalVisible(true);
  };

  const updateCardProductType = (cardNum: number, productType: string) => {
    setCardDataState(prev => ({
      ...prev,
      [cardNum]: {
        ...prev[cardNum],
        product: productType,
        monthlyRate: productType ? getPricingRangeForProduct(productType, prev[cardNum].verticals.length)?.default || 10 : 10,
        pricingType: '',
        discount: ''
      }
    }));
    
    // Expand card when product is selected
    if (productType && !expandedCards.has(cardNum)) {
      setExpandedCards(prev => new Set([...prev, cardNum]));
    }
  };

  const updateCardFeatures = (cardNum: number, type: 'reader' | 'streaming' | 'vertical', features: string[]) => {
    setCardDataState(prev => {
      const updatedCard = { ...prev[cardNum] };
      
      if (type === 'reader') {
        updatedCard.readerFeatures = features;
      } else if (type === 'streaming') {
        updatedCard.streamingFeatures = features;
      } else {
        // Enforce 3 vertical limit
        if (updatedCard.product !== 'CNN Standalone Vertical' && features.length > 3) {
          features = features.slice(0, 3);
        }
        updatedCard.verticals = features;
        // Update pricing when verticals change
        if (updatedCard.product) {
          const pricingRange = getPricingRangeForProduct(updatedCard.product, features.length);
          if (pricingRange) {
            updatedCard.monthlyRate = pricingRange.default;
          }
        }
      }
      
      return { ...prev, [cardNum]: updatedCard };
    });
  };

  const updateCardPricing = (cardNum: number, pricingType: string, monthlyRate: number, discount: string) => {
    // Clear discount if switching away from "both"
    const finalDiscount = pricingType === 'both' ? discount : '';
    
    setCardDataState(prev => ({
      ...prev,
      [cardNum]: {
        ...prev[cardNum],
        pricingType,
        monthlyRate,
        discount: finalDiscount
      }
    }));
  };

  const clearAllCards = () => {
    if (window.confirm('Are you sure you want to clear all product configurations? This cannot be undone.')) {
      setCardDataState(initialCardSetup());
      setActiveProductsState(new Set([1, 2, 3, 4]));
      setExpandedCards(new Set());
      setReportData(null);
      setIsReportOverlay(true);
    }
  };

  // Handle running simulation click
  const handleRunSimulationClick = () => {
    const activeCount = Array.from(activeProductsState)
      .filter(id => cardDataState[id] && cardDataState[id].product)
      .length;
      
    if (activeCount === 0) {
      showBrandedAlert('Configuration Error', 'Please configure at least one product before running simulation', 'error');
      return;
    }
    
    handleSimulation();
  };

  // Main simulation function - keeping all your existing logic
  const handleSimulation = async () => {
    // Validate all active products
    for (const productId of activeProductsState) {
      const card = cardDataState[productId];
      
      if (!card.product) {
        alert(`Product ${productId}: Product is selected for simulator but no base product type has been chosen.`);
        return;
      }
      
      if (card.product === 'CNN Reader' && card.readerFeatures.length === 0) {
        alert(`Product ${productId}: CNN Reader must have at least 1 reader feature selected.`);
        return;
      }
      
      if (card.product === 'CNN Streaming' && card.streamingFeatures.length === 0) {
        alert(`Product ${productId}: CNN Streaming must have at least 1 streaming feature selected.`);
        return;
      }
      
      if (card.product === 'CNN All-Access') {
        if (card.readerFeatures.length === 0) {
          alert(`Product ${productId}: CNN All-Access must have at least 1 reader feature selected.`);
          return;
        }
        if (card.streamingFeatures.length === 0) {
          alert(`Product ${productId}: CNN All-Access must have at least 1 streaming feature selected.`);
          return;
        }
      }
      
      if (card.product === 'CNN Standalone Vertical' && card.verticals.length === 0) {
        alert(`Product ${productId}: CNN Standalone Vertical must have a vertical selected.`);
        return;
      }
      
      if (!card.pricingType) {
        alert(`Product ${productId}: Please select a pricing type (Monthly Only, Annual Only, or Both).`);
        return;
      }
    }

    setIsSimulating(true);
    
    try {
      const activeConfigured = Array.from(activeProductsState)
        .map((num) => ({
          id: num.toString(),
          product: cardDataState[num].product,
          verticals: cardDataState[num].verticals || [],
          readerFeatures: cardDataState[num].readerFeatures || [],
          streamingFeatures: cardDataState[num].streamingFeatures || [],
          monthlyRate: cardDataState[num].monthlyRate,
          annualRate: cardDataState[num].monthlyRate * 12,
          discount: cardDataState[num].discount || 'none',
          isActive: true,
          pricingType: cardDataState[num].pricingType || 'monthly'
        }))
        .filter((config) => config.product);

      if (activeConfigured.length === 0) {
        alert("Please configure at least one product before running simulation");
        setIsSimulating(false);
        return;
      }

      const simulationOptions = {
        takeThreshold: 0.15,
        drnFactor: 1.0,
        allocationMethod: 'proportional' as const,
        enablePriceTiers: marketFactors.enablePriceSensitivity,
        priceThreshold: marketFactors.priceThreshold,
        lowPriceMultiplier: marketFactors.lowPriceMultiplier,
        highPriceMultiplier: marketFactors.highPriceMultiplier,
        usePiecewisePricing: false,
        marketWeights: {
          awareness: marketFactors.awarenessWeight,
          distribution: marketFactors.distributionWeight,
          competitive: marketFactors.competitiveWeight,
          marketing: marketFactors.marketingWeight,
          yearOneAdoption: marketFactors.yearOneWeight
        }
      };

      const result = await runServerSimulation(
        activeConfigured,
        currentReportTypeState,
        currentOutputTypeState,
        marketFactors,
        simulationOptions
      );

      if (!result) {
        throw new Error("No result returned from simulation");
      }

      if (result.overallShare && result.segmentShares) {
        setReportData(result);
        setIsReportOverlay(true);
      } else {
        console.error("Unexpected result format:", result);
        alert("Received unexpected data format from server");
        return;
      }

    } catch (error) {
      console.error('Simulation error:', error);
      alert(`Error running simulation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSimulating(false);
    }
  };

  // Helper functions for profiles
  const getProductDescription = (config: any): string => {
    const descriptions: Record<string, string> = {
      'CNN Reader': 'Premium digital reading experience with exclusive articles and ad-free browsing',
      'CNN Streaming': 'Live and on-demand video content with exclusive shows and documentaries',
      'CNN All-Access': 'Complete CNN experience combining all reader and streaming benefits',
      'CNN Standalone Vertical': `Specialized content focused on ${config.verticals[0] || 'selected topic'}`
    };
    return descriptions[config.product] || 'CNN subscription product';
  };

  const getTargetAudience = (config: any): string => {
    const audiences: Record<string, string> = {
      'CNN Reader': 'News enthusiasts who prefer reading in-depth articles and analysis',
      'CNN Streaming': 'Viewers who want live coverage and video content on-demand',
      'CNN All-Access': 'Power users who want the complete CNN experience across all platforms',
      'CNN Standalone Vertical': 'Specialists and enthusiasts focused on specific topics'
    };
    return audiences[config.product] || 'CNN audience';
  };

  const getKeyFeatures = (config: any): string[] => {
    const features: string[] = [];
    
    if (config.product === 'CNN Reader' || config.product === 'CNN All-Access') {
      features.push(...config.readerFeatures.map((f: string) => `Reader: ${f}`));
    }
    
    if (config.product === 'CNN Streaming' || config.product === 'CNN All-Access') {
      features.push(...config.streamingFeatures.map((f: string) => `Streaming: ${f}`));
    }
    
    if (config.verticals.length > 0) {
      features.push(...config.verticals.map((v: string) => `Vertical: ${v}`));
    }
    
    if (config.pricingType === 'both') {
      features.push('Flexible monthly and annual pricing options');
    } else if (config.pricingType === 'annual') {
      features.push('Annual subscription for best value');
    } else {
      features.push('Month-to-month flexibility');
    }
    
    if (config.discount && config.discount !== 'none') {
      features.push(`Special discount: ${config.discount}`);
    }
    
    return features;
  };

  // Fixed handleShowProfiles function
  const handleShowProfiles = async () => {
    setIsLoadingProfiles(true);
    setProfileModalVisible(true);
    
    try {
      const activeConfigs = Array.from(activeProductsState)
        .filter(productId => cardDataState[productId].product)
        .map(productId => {
          const card = cardDataState[productId];
          return {
            id: productId.toString(),
            product: card.product,
            verticals: card.verticals || [],
            readerFeatures: card.readerFeatures || [],
            streamingFeatures: card.streamingFeatures || [],
            monthlyRate: card.monthlyRate,
            annualRate: card.monthlyRate * 12,
            discount: card.discount || 'none',
            isActive: true,
            pricingType: card.pricingType || 'monthly'
          };
        });

      if (activeConfigs.length === 0) {
        alert("Please configure at least one product to view profiles");
        setProfileModalVisible(false);
        setIsLoadingProfiles(false);
        return;
      }

      const profiles = activeConfigs.map(config => ({
        productName: config.product,
        description: getProductDescription(config),
        targetAudience: getTargetAudience(config),
        keyFeatures: getKeyFeatures(config),
        pricing: {
          monthlyRate: config.monthlyRate,
          annualRate: config.annualRate,
          pricingType: config.pricingType,
          discount: config.discount
        },
        configuration: {
          verticals: config.verticals,
          readerFeatures: config.readerFeatures,
          streamingFeatures: config.streamingFeatures
        }
      }));
      
      setProfileData(profiles);
    } catch (error) {
      console.error('Error loading profiles:', error);
      alert('Error loading product profiles. Please try again.');
      setProfileModalVisible(false);
    } finally {
      setIsLoadingProfiles(false);
    }
  };

  // Fixed handleSensitivityAnalysis function
  const handleSensitivityAnalysis = async () => {
    setIsAnalyzingSensitivity(true);
    setSensitivityModalVisible(true);
    
    try {
      const activeConfigs = Array.from(activeProductsState)
        .filter(productId => cardDataState[productId].product)
        .map(productId => {
          const card = cardDataState[productId];
          return {
            id: productId.toString(),
            product: card.product,
            basePrice: card.monthlyRate,
            verticals: card.verticals || [],
            readerFeatures: card.readerFeatures || [],
            streamingFeatures: card.streamingFeatures || []
          };
        });

      if (activeConfigs.length === 0) {
        alert("Please configure at least one product for sensitivity analysis");
        setSensitivityModalVisible(false);
        setIsAnalyzingSensitivity(false);
        return;
      }

      const priceVariations = [-30, -20, -10, 0, 10, 20, 30];
      const sensitivityResults = [];

      for (const config of activeConfigs) {
        // Use base adoption rates that align with simulation results
        let baseAdoption = 15;
        let priceElasticity = -1.2;
        
        // Set base adoption to match typical simulation results
        if (config.product === 'CNN Reader') {
          baseAdoption = 15.7; // Match your simulation result
          priceElasticity = -1.0;
        } else if (config.product === 'CNN Streaming') {
          baseAdoption = 18;
          priceElasticity = -1.5;
        } else if (config.product === 'CNN All-Access') {
          baseAdoption = 20.0; // Match your simulation result
          priceElasticity = -1.3;
        } else if (config.product === 'CNN Standalone Vertical') {
          baseAdoption = 8;
          priceElasticity = -0.8;
        }
        
        const productResults = {
          productName: config.product,
          basePrice: config.basePrice,
          pricePoints: priceVariations.map(variation => {
            const adjustedPrice = config.basePrice * (1 + variation / 100);
            const adoptionRate = baseAdoption * Math.pow((adjustedPrice / config.basePrice), priceElasticity);
            
            return {
              priceVariation: variation,
              price: adjustedPrice,
              adoptionRate: Math.max(0, Math.min(100, adoptionRate))
            };
          }),
          priceElasticity: priceElasticity // Store for insights
        };
        sensitivityResults.push(productResults);
      }
      
      setSensitivityData(sensitivityResults);
    } catch (error) {
      console.error('Error in sensitivity analysis:', error);
      alert('Error running sensitivity analysis. Please try again.');
      setSensitivityModalVisible(false);
    } finally {
      setIsAnalyzingSensitivity(false);
    }
  };

  const handleVerticalChange = (vertical: string) => {
    setSelectedReviewVertical(vertical);
    if (vertical && verticalDescriptionsData[vertical]) {
      const vertData = verticalDescriptionsData[vertical];
      setVerticalDescription(vertData.description || '');
      setVerticalFeaturesForReview(vertData.features || []);
    } else {
      setVerticalDescription('');
      setVerticalFeaturesForReview([]);
    }
  };

  const downloadReport = () => {
    if (!reportData) {
      alert('No report data to download.');
      return;
    }

    let csv = 'Segment';
    
    const activeProducts = Array.from(activeProductsState)
      .filter(id => cardDataState[id].product)
      .map(id => cardDataState[id]);
    
    activeProducts.forEach((product, idx) => {
      csv += `,Product ${idx + 1}: ${product.product}`;
    });
    csv += '\n';
    
    csv += 'Overall';
    reportData.overallShare.forEach(share => {
      csv += `,${share.toFixed(1)}%`;
    });
    csv += '\n';
    
    reportData.segmentShares.forEach(segment => {
      csv += segment.segmentName;
      segment.shares.forEach(share => {
        csv += `,${share.toFixed(1)}%`;
      });
      csv += '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cnn_simulation_report_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // ============ AUTHENTICATION CHECKS ============
  // FIRST: Check password authentication
  if (!isPasswordAuthenticated) {
    return <PasswordProtect onAuthenticated={handlePasswordAuthenticated} />;
  }
  
  // SECOND: Check Firebase authentication  
  if (!userId) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>CNN Simulator</h1>
        <p>Please sign in to access the simulator</p>
        <button 
          onClick={() => signInAnonymously(auth)}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: '#cc0000',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Sign In
        </button>
      </div>
    );
  }

  // THIRD: Check if data is loading
  
if (isDataLoading || !primaryData) {
  return (
    <div className={styles.loadingContainer}>
      <div className={styles.spinner} />
      <p>Loading secure data...</p>
    </div>
  );
}


  // FOURTH: Check for data errors
 
if (dataError) {
  return (
    <div className={styles.errorContainer}>
      <h2>Error Loading Data</h2>
      <p>{dataError}</p>
      <button onClick={() => window.location.reload()}>Retry</button>
    </div>
  );
}

  
  // ============ MAIN RENDER ============
  return (
    <div className={styles.pageContainer}>
      {/* Main Header with logos */}
      <div className={styles.mainHeader}>
        <div className={styles.logoContainer}>
          <a href="https://www.cnn.com" target="_blank" rel="noopener noreferrer">
            <img src="https://upload.wikimedia.org/wikipedia/commons/b/b1/CNN.svg" alt="CNN" style={{ height: 40 }} />
          </a>
        </div>
        <div className={styles.headerCenter}>
          <h1 className={styles.headerTitle}>
            Subscription Bundle Configurator & Simulator
          </h1>
          <p className={styles.headerSubtitle}>
            Configure products, set pricing, and simulate market response
          </p>
        </div>
        <div className={styles.poweredByContainer}>
          <span className={styles.poweredByLabel}>Powered by</span>
          <a href="https://i.imgur.com/AdWCvzX.png" target="_blank" rel="noopener noreferrer">
            <img src="https://i.imgur.com/AdWCvzX.png" alt="Beyond Insights Logo" className={styles.poweredByLogo} style={{ height: 40 }} />
          </a>
        </div>
      </div>
   
      {/* Controls Section */}
      <div className={styles.controlsSection}>
        <div className={styles.controlsLeftArea}>
          <div className={styles.headerTamInfo}>
            <div className={styles.tamDisplay}>
              TAM Universe = 105,624,640
              <button className={styles.learnMoreLink} onClick={() => setIsMarketSizingModalVisible(true)}>
                Click here to learn more
              </button>
            </div>
          </div>
          <button 
            className={styles.headerButton}
            onClick={() => setReportModalVisible(true)}
            disabled={isSimulating}
          >
            <span className={styles.iconSpacing}>📊</span> Set Report Type
          </button>
          <div className={styles.reportTypeDisplayControlsInfo}>
            Report Type: {currentReportTypeState === 'tiered' ? 'Tiered Bundles' : 'Independent Products'} | 
            Output: {currentOutputTypeState === 'percentage' ? 'Take Rates (%)' : 
                    currentOutputTypeState === 'count' ? 'Population Counts (#)' : 'Revenue ($)'}
          </div>
        </div>
        
        <div className={styles.headerButtons}>
          <button
            className={`${styles.headerButton} ${styles.clearButton}`}
            onClick={() => clearAllCards()}
            disabled={isSimulating}
          >
            <span className={styles.iconSpacing}>🗑️</span> Clear All Selections
          </button>
          
          <button
            className={`${styles.headerButton} ${styles.runSimulationButton}`}
            onClick={handleRunSimulationClick}
            disabled={isSimulating}
          >
            <span className={styles.iconSpacing}>▶️</span>
            {isSimulating ? 'Simulating...' : 'Run Simulation'}
          </button>
         
          <button
            className={styles.headerButton}
            onClick={handleSensitivityAnalysis}
            disabled={isSimulating}
          >
            <span className={styles.iconSpacing}>📊</span> Price Sensitivity Analysis
          </button>
          
          <button
            className={`${styles.headerButton} ${styles.marketFactorsButton}`}
            onClick={() => setIsMarketFactorsModalVisible(true)}
            disabled={isSimulating}
          >
            <span className={styles.iconSpacing}>⚙️</span> Market Factors
          </button>
          
          <button 
            className={styles.headerButton}
            onClick={() => setShowCNNUtilities(true)}
            disabled={isSimulating}
          >
            <span className={styles.iconSpacing}>📊</span> Bundle Strategy
          </button>
          
          <button 
            className={styles.headerButton}
            onClick={() => setShowAttributeImpact(true)}
            disabled={isSimulating}
          >
            <span className={styles.iconSpacing}>📈</span> Attribute Impact
          </button>
          
          <button
            className={`${styles.headerButton} ${styles.aboutModelButton}`}
            onClick={() => setShowAboutModel(true)}
          >
            <span className={styles.iconSpacing}>📊</span> About the Model
          </button>
          
          <button
            className={`${styles.headerButton} ${styles.reviewCoreProductsButton}`}
            onClick={() => setIsReviewCoreProductsModalVisible(true)}
          >
            <span className={styles.iconSpacing}>📰</span> Review Core Products
          </button>
          
          <button
            className={`${styles.headerButton} ${styles.reviewFeaturesButton}`}
            onClick={() => setIsReviewFeaturesModalVisible(true)}
          >
            <span className={styles.iconSpacing}>✨</span> Review Features
          </button>
          
          <button
            className={`${styles.headerButton} ${styles.reviewVerticalsButton}`}
            onClick={() => setIsReviewVerticalsModalVisible(true)}
          >
            <span className={styles.iconSpacing}>🌿</span> Review Verticals
          </button>
        </div>
        
        <h2 className={styles.controlsSectionH2}>Select Products to Include in Simulation</h2>
        <div className={styles.productToggles}>
          {Array.from({ length: MAX_PRODUCTS }, (_, i) => i + 1).map(id => (
            <button 
              key={id}
              className={`${styles.toggleBtn} ${activeProductsState.has(id) ? styles.active : ''}`}
              onClick={() => toggleProduct(id)}
              disabled={isSimulating}
            >
              Product {id}
            </button>
          ))}
        </div>
      </div>

      {/* Cards Container - Rest of your component remains the same */}
      <div className={styles.cardContainer}>
        {Array.from({ length: MAX_PRODUCTS }, (_, i) => i + 1).map(cardNum => {
          const card = cardDataState[cardNum];
          const isActive = activeProductsState.has(cardNum);
          const isExpanded = expandedCards.has(cardNum) || !!card.product;
          const pricingRange = card.product ? getPricingRangeForProduct(card.product, card.verticals.length) : null;
          
          return (
            <div key={cardNum} className={`${styles.card} ${!isActive ? styles.inactive : ''}`}>
              {!isActive && (
                <div className={styles.inactiveOverlay}>
                  EXCLUDED FROM
                  <br />
                  SIMULATOR
                </div>
              )}
              
              {isActive && !card.product && (
                <div className={styles.incompleteOverlay}>
                  ⚠️ INCOMPLETE<br />
                  Select base product
                </div>
              )}
              
              <div className={styles.cardHeader} onClick={() => toggleCardExpansion(cardNum)}>
                <span className={styles.cardHeaderText}>{card.product || `PRODUCT ${cardNum}`}</span>
                <span className={styles.cardHeaderText}>{isExpanded ? '▼' : '▶'}</span>
              </div>
              
              <select 
                className={styles.productSelect}
                value={card.product}
                onChange={(e) => updateCardProductType(cardNum, e.target.value)}
                disabled={!isActive}
              >
                <option value="">Select Base Product</option>
                <option value="CNN Reader">CNN Reader</option>
                <option value="CNN Streaming">CNN Streaming</option>
                <option value="CNN All-Access">CNN All-Access</option>
                <option value="CNN Standalone Vertical">CNN Standalone Vertical</option>
              </select>
              
              {isActive && isExpanded && card.product && (
  
                <div className={styles.content}>
                  {/* Special handling for Standalone Vertical */}
                  {card.product === 'CNN Standalone Vertical' ? (
                    <div>
                      <label className={styles.contentLabel}>Select Vertical</label>
                      <select 
                        className={styles.verticalSelectStandalone}
                        value={card.verticals[0] || ''}
  
                        onChange={(e) => updateCardFeatures(cardNum, 'vertical', e.target.value ? [e.target.value] : [])}
                      >
                        <option value="">-- Select a Vertical --</option>
                        {AVAILABLE_FEATURES_LISTS.vertical.map(v => (
                          <option key={v} value={v}>{v}</option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <>
                      {/* Reader Features */}
                      {['CNN Reader', 'CNN All-Access'].includes(card.product) && (
                        <div>
                          <label className={styles.contentLabel}>
                            Reader Features ({card.readerFeatures.length} selected)
                          </label>
                          <div className={styles.featureList}>
                            {card.readerFeatures.map(feature => (
                              <div key={feature} className={styles.featureItem}>
                                <span>{feature}</span>
                                <span 
                                  className={styles.featureRemove}
                                  onClick={() => updateCardFeatures(
                                    cardNum, 
                                    'reader', 
                                    card.readerFeatures.filter(f => f !== feature)
                                  )}
                                >
                                  ×
                                </span>
                              </div>
                            ))}
                          </div>
                          <button 
                            className={`${styles.addBtn} ${styles.addBtnReader}`}
                            onClick={() => openFeatureModal(cardNum, 'reader')}
                          >
                            + Add
                          </button>
                        </div>
                      )}
                      
                      {/* Streaming Features */}
                      {['CNN Streaming', 'CNN All-Access'].includes(card.product) && (
                        <div className={styles.featureSection}>
                          <label className={styles.contentLabel}>
                            Streaming Features ({card.streamingFeatures.length} selected)
                          </label>
                          <div className={styles.featureList}>
                            {card.streamingFeatures.map(feature => (
                              <div key={feature} className={styles.featureItem}>
                                <span>{feature}</span>
                                <span 
                                  className={styles.featureRemove}
                                  onClick={() => updateCardFeatures(
                                    cardNum, 
                                    'streaming', 
                                    card.streamingFeatures.filter(f => f !== feature)
                                  )}
                                >
                                  ×
                                </span>
                              </div>
                            ))}
                          </div>
                          <button 
                            className={`${styles.addBtn} ${styles.addBtnStreaming}`}
                            onClick={() => openFeatureModal(cardNum, 'streaming')}
                          >
                            + Add
                          </button>
                        </div>
                      )}
                      
                      {/* Verticals */}
                      <div className={styles.featureSection}>
                        <label className={styles.contentLabel}>
                          Verticals ({card.verticals.length} selected{card.product !== 'CNN Standalone Vertical' ? ' - Max 3' : ''})
                        </label>
                        <div className={styles.featureList}>
                          {card.verticals.map(vertical => (
                            <div key={vertical} className={styles.featureItem}>
                              <span>{vertical}</span>
                              <span 
                                className={styles.featureRemove}
                                onClick={() => updateCardFeatures(
                                  cardNum, 
                                  'vertical', 
                                  card.verticals.filter(v => v !== vertical)
                                )}
                              >
                                ×
                              </span>
                            </div>
                          ))}
                        </div>
                        <button 
                          className={`${styles.addBtn} ${styles.addBtnVertical}`}
                          onClick={() => openFeatureModal(cardNum, 'vertical')}
                          disabled={card.product !== 'CNN Standalone Vertical' && card.verticals.length >= 3}
                        >
                          + Add
                        </button>
                      </div>
                    </>
                  )}
                  
                  {/* Pricing Section */}
                  <div className={styles.pricingSection}>
                    <label className={styles.contentLabel}>Configure Pricing (choose Terms + Price)</label>
                    
                    <div className={styles.btnGroup}>
                      <button 
                        className={card.pricingType === 'monthly' ? styles.active : ''}
                        onClick={() => updateCardPricing(cardNum, 'monthly', card.monthlyRate, card.discount)}
                      >
                        Monthly Only
                      </button>
                      <button 
                        className={card.pricingType === 'annual' ? styles.active : ''}
                        onClick={() => updateCardPricing(cardNum, 'annual', card.monthlyRate, card.discount)}
                      >
                        Annual Only
                      </button>
                      <button 
                        className={card.pricingType === 'both' ? styles.active : ''}
                        onClick={() => updateCardPricing(cardNum, 'both', card.monthlyRate, card.discount)}
                      >
                        Both
                      </button>
                    </div>
                    
                    {card.pricingType === 'both' && (
                      <div className={styles.discountSection}>
                        <div className={styles.discountOptions}>
                          <h4>Select Discount (for Annual Term)</h4>
                          <hr />
                          <div className={styles.discountOption}>
                            <label>
                              <input 
                                type="radio"
                                name={`discount-${cardNum}`}
                                value="free"
                                checked={card.discount === 'free'}
                                onChange={() => updateCardPricing(cardNum, card.pricingType, card.monthlyRate, 'free')}
                              />
                              1 Mo or 3 Mos Free (Annual)
                            </label>
                          </div>
                          <div className={styles.discountOption}>
                            <label>
                              <input 
                                type="radio"
                                name={`discount-${cardNum}`}
                                value="30"
                                checked={card.discount === '30'}
                                onChange={() => updateCardPricing(cardNum, card.pricingType, card.monthlyRate, '30')}
                              />
                              30% off (Annual)
                            </label>
                          </div>
                          <div className={styles.discountOption}>
                            <label>
                              <input 
                                type="radio"
                                name={`discount-${cardNum}`}
                                value="50"
                                checked={card.discount === '50'}
                                onChange={() => updateCardPricing(cardNum, card.pricingType, card.monthlyRate, '50')}
                              />
                              50% off (Annual)
                            </label>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {pricingRange && (
                      <div className={styles.priceSliderContainer}>
                        <div className={styles.priceRangeLabels}>
                          <span>${pricingRange.min.toFixed(2)}</span>
                          <span>${pricingRange.max.toFixed(2)}</span>
                        </div>
                        <input 
                          type="range"
                          className={styles.priceSlider}
                          min={pricingRange.min}
                          max={pricingRange.max}
                          step="0.01"
                          value={card.monthlyRate}
                          onChange={(e) => updateCardPricing(cardNum, card.pricingType, parseFloat(e.target.value), card.discount)}
                          onInput={(e) => {
                            const value = parseFloat((e.target as HTMLInputElement).value);
                            updateCardPricing(cardNum, card.pricingType, value, card.discount);
                          }}
                        />
                        <label className={styles.priceLabel}>
                          Selected Monthly Price: <span className={styles.priceValue}>${card.monthlyRate.toFixed(2)}</span>
                        </label>
                      </div>
                    )}
                    
                    {card.pricingType && (
                      <div className={styles.pricingDisplay}>
                        <table className={styles.pricingTable}>
                          <tbody>
                            <tr className={styles.pricingTableRow}>
                              <td className={styles.pricingTableCell}>Monthly</td>
                              <td className={styles.pricingTableCellRight}>
                                ${card.monthlyRate.toFixed(2)}
                              </td>
                            </tr>
                            {(card.pricingType === 'annual' || card.pricingType === 'both') && (
                              <>
                                <tr className={styles.pricingTableRow}>
                                  <td className={styles.pricingTableCell}>Year 1 (Annual)</td>
                                  <td className={styles.pricingTableCellRight}>
                                    ${card.discount === '30' 
                                      ? (card.monthlyRate * 12 * 0.7).toFixed(2)
                                      : card.discount === '50'
                                      ? (card.monthlyRate * 12 * 0.5).toFixed(2)
                                      : card.discount === 'free'
                                      ? (card.monthlyRate * 11).toFixed(2)
                                      : (card.monthlyRate * 12).toFixed(2)
                                    }
                                    {card.discount && card.discount !== '' && (
                                      <div className={styles.discountText}>
                                        {card.discount === '30' ? '(30% discount)' : 
                                          card.discount === '50' ? '(50% discount)' : 
                                          card.discount === 'free' ? '(1 month free)' : ''}
                                      </div>
                                    )}
                                  </td>
                                </tr>
                                <tr>
                                  <td className={styles.pricingTableCell}>Year 2+ (Annual)</td>
                                  <td className={styles.pricingTableCellRight}>
                                    ${(card.monthlyRate * 12).toFixed(2)}
                                  </td>
                                </tr>
                              </>
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* All your modals remain the same */}
      {/* Feature Selection Modal */}
      {featureModalVisible && currentModalDataState && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>
                Select {currentModalDataState.type === 'reader' ? 'Reader Features' : 
                       currentModalDataState.type === 'streaming' ? 'Streaming Features' : 
                       'Verticals'}
              </h2>
              <button className={styles.closeModal} onClick={() => setFeatureModalVisible(false)}>×</button>
            </div>
            
            <div className={styles.modalContent}>
              {AVAILABLE_FEATURES_LISTS[currentModalDataState.type].map(feature => {
                const isChecked = cardDataState[currentModalDataState.cardNum][
                  currentModalDataState.type === 'reader' ? 'readerFeatures' :
                  currentModalDataState.type === 'streaming' ? 'streamingFeatures' : 
                  'verticals'
                ].includes(feature);

                return (
                  <label key={feature} className={styles.featureCheckbox}>
                    <input 
                      type="checkbox" 
                      checked={isChecked}
                      onChange={(e) => {
                        const featureKey = currentModalDataState.type === 'reader' ? 'readerFeatures' :
                                         currentModalDataState.type === 'streaming' ? 'streamingFeatures' : 
                                         'verticals';
                        const currentFeatures = cardDataState[currentModalDataState.cardNum][featureKey];
                        const newFeatures = e.target.checked 
                          ? [...currentFeatures, feature]
                          : currentFeatures.filter(f => f !== feature);
                        
                        updateCardFeatures(currentModalDataState.cardNum, currentModalDataState.type, newFeatures);
                      }}
                    />
                    {feature}
                  </label>
                );
              })}
            </div>
            
            <div className={styles.modalButtons}>
              <button 
                className={styles.btnPrimary}
                onClick={() => setFeatureModalVisible(false)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {reportModalVisible && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>Configure Report</h2>
              <button className={styles.closeModal} onClick={() => setReportModalVisible(false)}>×</button>
            </div>
            <div>
              <div className={styles.reportTypeSection}>
                <h3>Report Type:</h3>
                <label className={styles.radioOption}>
                  <input 
                    type="radio" 
                    name="reportType" 
                    value="tiered" 
                    checked={currentReportTypeState === 'tiered'}
                    onChange={(e) => setCurrentReportTypeState(e.target.value as ReportType)}
                  />
                  Tiered Bundles
                </label>
                <label className={styles.radioOption}>
                  <input 
                    type="radio" 
                    name="reportType" 
                    value="independent"
                    checked={currentReportTypeState === 'independent'}
                    onChange={(e) => setCurrentReportTypeState(e.target.value as ReportType)}
                  />
                  Independent Products
                </label>
              </div>
              
              <div className={styles.reportTypeSection}>
                <h3>Output Type:</h3>
                <label className={styles.radioOption}>
                  <input 
                    type="radio" 
                    name="outputType" 
                    value="percentage"
                    checked={currentOutputTypeState === 'percentage'}
                    onChange={(e) => setCurrentOutputTypeState(e.target.value as OutputType)}
                  />
                  Take Rates (%)
                </label>
                <label className={styles.radioOption}>
                  <input 
                    type="radio" 
                    name="outputType" 
                    value="count"
                    checked={currentOutputTypeState === 'count'}
                    onChange={(e) => setCurrentOutputTypeState(e.target.value as OutputType)}
                  />
                  Population Counts (#)
                </label>
                <label className={styles.radioOption}>
                  <input 
                    type="radio" 
                    name="outputType" 
                    value="revenue"
                    checked={currentOutputTypeState === 'revenue'}
                    onChange={(e) => setCurrentOutputTypeState(e.target.value as OutputType)}
                  />
                  Revenue ($)
                </label>
              </div>
            </div>
            <div className={styles.modalButtons}>
              <button className={styles.btnSecondary} onClick={() => setReportModalVisible(false)}>Cancel</button>
              <button className={styles.btnPrimary} onClick={() => setReportModalVisible(false)}>Generate Report</button>
            </div>
          </div>
        </div>
      )}

      {/* Report Display - Overlay Mode */}
      {reportData && isReportOverlay && (
        <div className={styles.reportOverlay}>
          <div className={styles.reportContainer}>
            <div className={styles.reportHeader}>
              <h2>Simulation Results</h2>
              <div className={styles.reportButtons}>
                <button 
                  className={styles.headerButton}
                  onClick={downloadReport}
                >
                  <span className={styles.iconSpacing}>💾</span> Download Report
                </button>
                <button 
                  className={`${styles.headerButton} ${styles.aboutModelButton}`}
                  onClick={() => setIsReportOverlay(false)}
                >
                  <span className={styles.iconSpacing}>↓</span> Minimize
                </button>
                <button 
                  onClick={() => {
                    setReportData(null);
                    setIsReportOverlay(true);
                  }}
                  className={styles.closeModal}
                >
                  ×
                </button>
              </div>
            </div>
            <div className={styles.reportContent}>
              <ReportDisplay 
                reportData={reportData} 
                activeProducts={
                  currentReportTypeState === 'tiered'
                    ? [
                        {
                          product: 'Any Product',
                          monthlyRate: 0,
                          annualRate: 0,
                          verticals: [],
                          readerFeatures: [],
                          streamingFeatures: [],
                          features: { reader: [], streaming: [] },
                          pricing: { monthlyRate: 0, pricingType: 'monthly' as any, discount: '' }
                        },
                        ...Array.from(activeProductsState)
                          .filter(id => cardDataState[id].product)
                          .map(id => ({
                            product: cardDataState[id].product,
                            monthlyRate: cardDataState[id].monthlyRate,
                            annualRate: cardDataState[id].monthlyRate * 12,
                            verticals: cardDataState[id].verticals || [],
                            readerFeatures: cardDataState[id].readerFeatures || [],
                            streamingFeatures: cardDataState[id].streamingFeatures || [],
                            features: {
                              reader: cardDataState[id].readerFeatures || [],
                              streaming: cardDataState[id].streamingFeatures || []
                            },
                            pricing: {
                              monthlyRate: cardDataState[id].monthlyRate,
                              pricingType: cardDataState[id].pricingType as any,
                              discount: cardDataState[id].discount || ''
                            }
                          }))
                      ]
                    : Array.from(activeProductsState)
                        .filter(id => cardDataState[id].product)
                        .map(id => ({
                          product: cardDataState[id].product,
                          monthlyRate: cardDataState[id].monthlyRate,
                          annualRate: cardDataState[id].monthlyRate * 12,
                          verticals: cardDataState[id].verticals || [],
                          readerFeatures: cardDataState[id].readerFeatures || [],
                          streamingFeatures: cardDataState[id].streamingFeatures || [],
                          features: {
                            reader: cardDataState[id].readerFeatures || [],
                            streaming: cardDataState[id].streamingFeatures || []
                          },
                          pricing: {
                            monthlyRate: cardDataState[id].monthlyRate,
                            pricingType: cardDataState[id].pricingType as any,
                            discount: cardDataState[id].discount || ''
                          }
                        }))
                }
              />
            </div>
          </div>
        </div>
      )}

      {/* Report Display - Minimized/Inline Mode */}
      {reportData && !isReportOverlay && (
        <div className={styles.minimizedReport}>
          <div className={styles.minimizedReportHeader}>
            <h2>Simulation Results</h2>
            <div className={styles.reportButtons}>
              <button 
                className={styles.headerButton}
                onClick={downloadReport}
              >
                <span className={styles.iconSpacing}>💾</span> Download Report
              </button>
              <button 
                className={`${styles.headerButton} ${styles.aboutModelButton}`}
                onClick={() => setIsReportOverlay(true)}
              >
                <span className={styles.iconSpacing}>↑</span> Expand
              </button>
            </div>
          </div>
          <ReportDisplay 
            reportData={reportData} 
            activeProducts={
              currentReportTypeState === 'tiered'
                ? [
                    {
                      product: 'Any Product',
                      monthlyRate: 0,
                      annualRate: 0,
                      verticals: [],
                      readerFeatures: [],
                      streamingFeatures: [],
                      features: { reader: [], streaming: [] },
                      pricing: { monthlyRate: 0, pricingType: 'monthly' as any, discount: '' }
                    },
                    ...Array.from(activeProductsState)
                      .filter(id => cardDataState[id].product)
                      .map(id => ({
                        product: cardDataState[id].product,
                        monthlyRate: cardDataState[id].monthlyRate,
                        annualRate: cardDataState[id].monthlyRate * 12,
                        verticals: cardDataState[id].verticals || [],
                        readerFeatures: cardDataState[id].readerFeatures || [],
                        streamingFeatures: cardDataState[id].streamingFeatures || [],
                        features: {
                          reader: cardDataState[id].readerFeatures || [],
                          streaming: cardDataState[id].streamingFeatures || []
                        },
                        pricing: {
                          monthlyRate: cardDataState[id].monthlyRate,
                          pricingType: cardDataState[id].pricingType as any,
                          discount: cardDataState[id].discount || ''
                        }
                      }))
                  ]
                : Array.from(activeProductsState)
                    .filter(id => cardDataState[id].product)
                    .map(id => ({
                      product: cardDataState[id].product,
                      monthlyRate: cardDataState[id].monthlyRate,
                      annualRate: cardDataState[id].monthlyRate * 12,
                      verticals: cardDataState[id].verticals || [],
                      readerFeatures: cardDataState[id].readerFeatures || [],
                      streamingFeatures: cardDataState[id].streamingFeatures || [],
                      features: {
                        reader: cardDataState[id].readerFeatures || [],
                        streaming: cardDataState[id].streamingFeatures || []
                      },
                      pricing: {
                        monthlyRate: cardDataState[id].monthlyRate,
                        pricingType: cardDataState[id].pricingType as any,
                        discount: cardDataState[id].discount || ''
                      }
                    }))
            }
          />
          
          <div className={styles.downloadButtonContainer}>
            <button 
              className={styles.headerButton}
              onClick={downloadReport}
            >
              <span className={styles.iconSpacing}>💾</span> Download Report
            </button>
          </div>
        </div>
      )}
             
      {/* Fixed Profile Modal */}
      {profileModalVisible && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.modal} ${styles.modalLarge}`}>
            <div className={styles.modalHeader}>
              <h2>Product Profiles Analysis</h2>
              <button className={styles.closeModal} onClick={() => setProfileModalVisible(false)}>×</button>
            </div>
            <div>
              {isLoadingProfiles ? (
                <div className={styles.profileLoadingState}>
                  <p>Analyzing product configurations...</p>
                </div>
              ) : (
                <div className={styles.profileContainer}>
                  {profileData.length === 0 ? (
                    <p>No product profiles to display.</p>
                  ) : (
                    profileData.map((profile, index) => (
                      <div key={index} className={styles.profileCard}>
                        <h3>{profile.productName}</h3>
                        
                        <div className={styles.profileSection}>
                          <strong>Description:</strong>
                          <p>{profile.description}</p>
                        </div>
                        
                        <div className={styles.profileSection}>
                          <strong>Target Audience:</strong>
                          <p>{profile.targetAudience}</p>
                        </div>
                        
                        <div className={styles.profileSection}>
                          <strong>Pricing Strategy:</strong>
                          <div className={styles.profilePricing}>
                            <p>• Monthly Rate: <span className={styles.profilePriceHighlight}>
                              ${profile.pricing.monthlyRate.toFixed(2)}
                            </span></p>
                            {profile.pricing.pricingType !== 'monthly' && (
                              <p>• Annual Rate: <span className={styles.profilePriceHighlight}>
                                ${profile.pricing.annualRate.toFixed(2)}
                                {profile.pricing.discount && profile.pricing.discount !== 'none' && 
                                  ` (with ${profile.pricing.discount} discount)`}
                              </span></p>
                            )}
                            <p>• Pricing Type: {profile.pricing.pricingType}</p>
                          </div>
                        </div>
                        
                        <div className={styles.profileSection}>
                          <strong>Key Features & Benefits:</strong>
                          {profile.keyFeatures.length > 0 ? (
                            <ul className={styles.profileFeatures}>
                              {profile.keyFeatures.map((feature, idx) => (
                                <li key={idx}>{feature}</li>
                              ))}
                            </ul>
                          ) : (
                            <p className={styles.emptyState}>No features configured</p>
                          )}
                        </div>
                        
                        {profile.configuration && (
                          <div className={styles.profileConfigSummary}>
                            <strong>Configuration Summary:</strong>
                            <div>
                              {profile.configuration.readerFeatures?.length > 0 && (
                                <p>• Reader Features: {profile.configuration.readerFeatures.length}</p>
                              )}
                              {profile.configuration.streamingFeatures?.length > 0 && (
                                <p>• Streaming Features: {profile.configuration.streamingFeatures.length}</p>
                              )}
                              {profile.configuration.verticals?.length > 0 && (
                                <p>• Verticals: {profile.configuration.verticals.join(', ')}</p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                  
                  {profileData.length > 1 && (
                    <div className={styles.portfolioAnalysis}>
                      <h4>Portfolio Analysis</h4>
                      <p><strong>Total Products:</strong> {profileData.length}</p>
                      <p><strong>Price Range:</strong> ${Math.min(...profileData.map(p => p.pricing.monthlyRate)).toFixed(2)} - 
                         ${Math.max(...profileData.map(p => p.pricing.monthlyRate)).toFixed(2)}/month</p>
                      <p><strong>Coverage:</strong> {
                        profileData.some(p => p.productName.includes('Reader')) && 
                        profileData.some(p => p.productName.includes('Streaming')) 
                          ? 'Full spectrum (Reader + Streaming)' 
                          : 'Partial coverage'
                      }</p>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className={`${styles.modalButtons} ${styles.modalButtonsWithBorder}`}>
              <button 
                className={styles.btnPrimary}
                onClick={() => setProfileModalVisible(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fixed Sensitivity Modal */}
      {sensitivityModalVisible && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.modal} ${styles.modalLarge}`}>
            <div className={styles.modalHeader}>
              <h2>Price Sensitivity Analysis</h2>
              <button className={styles.closeModal} onClick={() => setSensitivityModalVisible(false)}>×</button>
            </div>
            <div>
              {isAnalyzingSensitivity ? (
                <div className={styles.profileLoadingState}>
                  <p>Running price sensitivity analysis...</p>
                </div>
              ) : (
                <div className={styles.profileContainer}>
                  <p className={styles.marketFactorNote}>
                    This analysis shows how adoption rates change with price variations.
                    Negative percentages represent price decreases, positive represent increases.
                  </p>
                  
                  {sensitivityData.map((product, index) => (
                    <div key={index} className={styles.sensitivityCard}>
                      <h3>{product.productName}</h3>
                      <p>
                        Base Price: <strong>${product.basePrice.toFixed(2)}</strong>
                      </p>
                      
                      <table className={styles.sensitivityTable}>
                        <thead>
                          <tr>
                            <th>Price Change</th>
                            <th>New Price</th>
                            <th>Adoption Rate</th>
                            <th>Change vs Base</th>
                          </tr>
                        </thead>
                        <tbody>
                          {product.pricePoints.map((point, idx) => {
                            const baseAdoption = product.pricePoints.find(p => p.priceVariation === 0)?.adoptionRate || 0;
                            const changeVsBase = ((point.adoptionRate - baseAdoption) / baseAdoption * 100).toFixed(1);
                            
                            return (
                              <tr key={idx} className={`${styles.sensitivityTableRow} ${point.priceVariation === 0 ? styles.current : ''}`}>
                                <td className={styles.sensitivityTableCell}>
                                  {point.priceVariation > 0 ? '+' : ''}{point.priceVariation}%
                                  {point.priceVariation === 0 && ' (Current)'}
                                </td>
                                <td className={styles.sensitivityTableCellRight}>
                                  ${point.price.toFixed(2)}
                                </td>
                                <td className={styles.sensitivityTableCellRight}>
                                  {point.adoptionRate.toFixed(1)}%
                                </td>
                                <td className={`${styles.sensitivityTableCellRight} ${
                                  parseFloat(changeVsBase) > 0 ? styles.sensitivityPositive : 
                                  parseFloat(changeVsBase) < 0 ? styles.sensitivityNegative : ''
                                }`}>
                                  {parseFloat(changeVsBase) > 0 ? '+' : ''}{changeVsBase}%
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                      
                      <div className={styles.sensitivityInsights}>
                        <p><strong>Key Insights:</strong></p>
                        <ul>
                          <li>A 10% price decrease could increase adoption by ~{Math.abs(Math.round((Math.pow(0.9, product.priceElasticity) - 1) * 100))}%</li>
                          <li>A 10% price increase could decrease adoption by ~{Math.abs(Math.round((Math.pow(1.1, product.priceElasticity) - 1) * 100))}%</li>
                          <li>Price elasticity coefficient: {product.priceElasticity} ({Math.abs(product.priceElasticity) > 1 ? 'elastic' : 'inelastic'} demand)</li>
                        </ul>
                      </div>
                    </div>
                  ))}
                  
                  <div className={styles.sensitivityNote}>
                    <strong>Note:</strong> This is a simplified elasticity model. 
                    For more accurate results, consider running full simulations at each price point 
                    with actual market factors and consumer segments.
                  </div>
                </div>
              )}
            </div>
            <div className={`${styles.modalButtons} ${styles.modalButtonsWithBorder}`}>
              <button 
                className={styles.btnPrimary}
                onClick={() => setSensitivityModalVisible(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Market Factors Modal - Using CSS Module */}
      {isMarketFactorsModalVisible && (
        <div className={marketModalStyles.modalOverlay}>
          <div className={marketModalStyles.modalContent}>
            <button
              onClick={() => setIsMarketFactorsModalVisible(false)}
              className={marketModalStyles.closeButton}
              style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '24px' }}
            >
              ×
            </button>

            <h2 className={marketModalStyles.modalTitle}>
              Market Factors Configuration
            </h2>
            
            <p className={marketModalStyles.subtitle}>
              Adjust market realization factors to fine-tune your forecast
            </p>

            {/* Market Factors Section */}
            <div className={marketModalStyles.factorsSection}>
              <h3 className={marketModalStyles.sectionTitle}>Market Penetration Factors</h3>
              
              <div className={marketModalStyles.formGroup}>
                <div className={marketModalStyles.sliderHeader}>
                  <label className={marketModalStyles.label}>
                    Market Awareness
                    <div className={marketModalStyles.tooltip}>
                      <span className={marketModalStyles.tooltipIcon}>?</span>
                      <div className={marketModalStyles.tooltipContent}>
                        How well your target market knows about your product
                      </div>
                    </div>
                  </label>
                  <span className={marketModalStyles.value}>{marketFactors.awareness}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={marketFactors.awareness}
                  onChange={(e) => setMarketFactors(prev => ({...prev, awareness: parseInt(e.target.value)}))}
                  className={marketModalStyles.slider}
                />
              </div>

              <div className={marketModalStyles.formGroup}>
                <div className={marketModalStyles.sliderHeader}>
                  <label className={marketModalStyles.label}>
                    Distribution Reach
                    <div className={marketModalStyles.tooltip}>
                      <span className={marketModalStyles.tooltipIcon}>?</span>
                      <div className={marketModalStyles.tooltipContent}>
                        How easily customers can access your product
                      </div>
                    </div>
                  </label>
                  <span className={marketModalStyles.value}>{marketFactors.distribution}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={marketFactors.distribution}
                  onChange={(e) => setMarketFactors(prev => ({...prev, distribution: parseInt(e.target.value)}))}
                  className={marketModalStyles.slider}
                />
              </div>

              <div className={marketModalStyles.formGroup}>
                <div className={marketModalStyles.sliderHeader}>
                  <label className={marketModalStyles.label}>
                    Competitive Position
                    <div className={marketModalStyles.tooltip}>
                      <span className={marketModalStyles.tooltipIcon}>?</span>
                      <div className={marketModalStyles.tooltipContent}>
                        Your advantage compared to alternatives
                      </div>
                    </div>
                  </label>
                  <span className={marketModalStyles.value}>{marketFactors.competitive}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={marketFactors.competitive}
                  onChange={(e) => setMarketFactors(prev => ({...prev, competitive: parseInt(e.target.value)}))}
                  className={marketModalStyles.slider}
                />
              </div>

              <div className={marketModalStyles.formGroup}>
                <div className={marketModalStyles.sliderHeader}>
                  <label className={marketModalStyles.label}>
                    Marketing Effectiveness
                    <div className={marketModalStyles.tooltip}>
                      <span className={marketModalStyles.tooltipIcon}>?</span>
                      <div className={marketModalStyles.tooltipContent}>
                        How well your marketing converts to customers
                      </div>
                    </div>
                  </label>
                  <span className={marketModalStyles.value}>{marketFactors.marketing}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={marketFactors.marketing}
                  onChange={(e) => setMarketFactors(prev => ({...prev, marketing: parseInt(e.target.value)}))}
                  className={marketModalStyles.slider}
                />
              </div>

              <div className={marketModalStyles.formGroup}>
                <div className={marketModalStyles.sliderHeader}>
                  <label className={marketModalStyles.label}>
                    Year One Adoption Rate
                    <div className={marketModalStyles.tooltip}>
                      <span className={marketModalStyles.tooltipIcon}>?</span>
                      <div className={marketModalStyles.tooltipContent}>
                        Expected adoption speed in the first year
                      </div>
                    </div>
                  </label>
                  <span className={marketModalStyles.value}>{marketFactors.yearOneAdoption}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={marketFactors.yearOneAdoption}
                  onChange={(e) => setMarketFactors(prev => ({...prev, yearOneAdoption: parseInt(e.target.value)}))}
                  className={marketModalStyles.slider}
                />
              </div>
            </div>

            {/* Factor Importance Weights - Always visible now */}
            <div className={marketModalStyles.advancedSection}>
              <h3 className={marketModalStyles.sectionTitle}>Factor Importance Weights</h3>
              <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '1rem' }}>
                Adjust how much each factor impacts the final take rate
              </p>
              
              <div className={marketModalStyles.multiplierGrid}>
                <div className={marketModalStyles.formGroup}>
                  <label className={marketModalStyles.label}>
                    Awareness Weight: {awarenessWeight}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={awarenessWeight}
                    onChange={(e) => setAwarenessWeight(parseInt(e.target.value))}
                    className={marketModalStyles.slider}
                  />
                </div>

                <div className={marketModalStyles.formGroup}>
                  <label className={marketModalStyles.label}>
                    Distribution Weight: {distributionWeight}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={distributionWeight}
                    onChange={(e) => setDistributionWeight(parseInt(e.target.value))}
                    className={marketModalStyles.slider}
                  />
                </div>

                <div className={marketModalStyles.formGroup}>
                  <label className={marketModalStyles.label}>
                    Competitive Weight: {competitiveWeight}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={competitiveWeight}
                    onChange={(e) => setCompetitiveWeight(parseInt(e.target.value))}
                    className={marketModalStyles.slider}
                  />
                </div>

                <div className={marketModalStyles.formGroup}>
                  <label className={marketModalStyles.label}>
                    Marketing Weight: {marketingWeight}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={marketingWeight}
                    onChange={(e) => setMarketingWeight(parseInt(e.target.value))}
                    className={marketModalStyles.slider}
                  />
                </div>

                <div className={marketModalStyles.formGroup}>
                  <label className={marketModalStyles.label}>
                    Year One Weight: {yearOneWeight}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={yearOneWeight}
                    onChange={(e) => setYearOneWeight(parseInt(e.target.value))}
                    className={marketModalStyles.slider}
                  />
                </div>
              </div>
              
              <div style={{ 
                marginTop: '1rem', 
                padding: '0.75rem', 
                background: '#f0f0f0', 
                borderRadius: '4px',
                fontSize: '0.875rem'
              }}>
                <strong>Total Weight:</strong> {awarenessWeight + distributionWeight + competitiveWeight + marketingWeight + yearOneWeight}%
                <span style={{ color: '#666', marginLeft: '0.5rem' }}>(will be normalized)</span>
              </div>
            </div>

            {/* Price Sensitivity Section */}
            <div className={marketModalStyles.advancedSection} style={{ marginTop: '2rem' }}>
              <label className={marketModalStyles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={priceSensitivityEnabled}
                  onChange={(e) => setPriceSensitivityEnabled(e.target.checked)}
                />
                Enable Price Sensitivity Analysis
              </label>
              
              {priceSensitivityEnabled && (
                <div className={marketModalStyles.advancedContent} style={{ marginTop: '1rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                    <button
                      onClick={() => {
                        setPriceThreshold(10);
                        setLowPriceMultiplier(1.1);
                        setHighPriceMultiplier(0.9);
                      }}
                      style={{
                        flex: 1,
                        padding: '0.75rem',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        background: priceThreshold === 10 ? '#f0f0f0' : 'white',
                        cursor: 'pointer',
                        fontWeight: priceThreshold === 10 ? 'bold' : 'normal'
                      }}
                    >
                      Low Sensitivity
                    </button>
                    
                    <button
                      onClick={() => {
                        setPriceThreshold(12);
                        setLowPriceMultiplier(1.3);
                        setHighPriceMultiplier(0.8);
                      }}
                      style={{
                        flex: 1,
                        padding: '0.75rem',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        background: priceThreshold === 12 ? '#f0f0f0' : 'white',
                        cursor: 'pointer',
                        fontWeight: priceThreshold === 12 ? 'bold' : 'normal'
                      }}
                    >
                      Standard
                    </button>
                    
                    <button
                      onClick={() => {
                        setPriceThreshold(15);
                        setLowPriceMultiplier(1.5);
                        setHighPriceMultiplier(0.7);
                      }}
                      style={{
                        flex: 1,
                        padding: '0.75rem',
                        border: '1px solid #cc0000',
                        borderRadius: '4px',
                        background: priceThreshold === 15 ? '#cc0000' : 'white',
                        color: priceThreshold === 15 ? 'white' : '#333',
                        cursor: 'pointer',
                        fontWeight: priceThreshold === 15 ? 'bold' : 'normal'
                      }}
                    >
                      High Sensitivity
                    </button>
                  </div>

                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                      Price Threshold: ${priceThreshold}
                    </label>
                    <input
                      type="number"
                      min={0}
                      step={1}
                      value={priceThreshold}
                      onChange={(e) => setPriceThreshold(Number(e.target.value))}
                      style={{ 
                        width: '100%', 
                        padding: '0.5rem',
                        border: '1px solid #ddd',
                        borderRadius: '4px'
                      }}
                    />
                  </div>

                  <div className={marketModalStyles.formGroup}>
                    <label className={marketModalStyles.label}>
                      Low Price Boost: {lowPriceMultiplier.toFixed(1)}x
                    </label>
                    <input
                      type="range"
                      min="1.0"
                      max="2.0"
                      step="0.1"
                      value={lowPriceMultiplier}
                      onChange={(e) => setLowPriceMultiplier(parseFloat(e.target.value))}
                      className={marketModalStyles.slider}
                    />
                  </div>

                  <div className={marketModalStyles.formGroup}>
                    <label className={marketModalStyles.label}>
                      High Price Penalty: {highPriceMultiplier.toFixed(1)}x
                    </label>
                    <input
                      type="range"
                      min="0.5"
                      max="1.0"
                      step="0.1"
                      value={highPriceMultiplier}
                      onChange={(e) => setHighPriceMultiplier(parseFloat(e.target.value))}
                      className={marketModalStyles.slider}
                    />
                  </div>

                  <div className={marketModalStyles.example} style={{
                    marginTop: '1rem',
                    padding: '1rem',
                    background: '#e3f2fd',
                    borderRadius: '4px',
                    fontSize: '0.875rem'
                  }}>
                    <strong>Example Impact:</strong><br/>
                    • Products below ${priceThreshold}: Up to <span style={{ color: '#4caf50' }}>+{((lowPriceMultiplier - 1) * 100).toFixed(0)}%</span> adoption boost<br/>
                    • Products above ${priceThreshold}: Up to <span style={{ color: '#cc0000' }}>-{((1 - highPriceMultiplier) * 100).toFixed(0)}%</span> adoption reduction
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className={marketModalStyles.modalActions} style={{ marginTop: '2rem' }}>
              <button 
                className={`${marketModalStyles['button-base']} ${marketModalStyles.cancelButton}`}
                onClick={() => setIsMarketFactorsModalVisible(false)}
              >
                Cancel
              </button>
              <button 
                className={`${marketModalStyles['button-base']} ${marketModalStyles.applyButton}`}
                onClick={() => {
                  setMarketFactors(prev => ({
                    ...prev,
                    awarenessWeight: awarenessWeight,
                    distributionWeight: distributionWeight,
                    competitiveWeight: competitiveWeight,
                    marketingWeight: marketingWeight,
                    yearOneWeight: yearOneWeight,
                    enablePriceSensitivity: priceSensitivityEnabled,
                    priceThreshold: priceThreshold,
                    lowPriceMultiplier: lowPriceMultiplier,
                    highPriceMultiplier: highPriceMultiplier
                  }));
                  setIsMarketFactorsModalVisible(false);
                  showBrandedAlert('Success', 'Market factors updated successfully!', 'success');
                }}
              >
                Apply All Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Market Sizing Modal */}
      {isMarketSizingModalVisible && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.modal} ${styles.modalSmall}`}>
            <div className={styles.modalHeader}>
              <h2>Market Sizing Model</h2>
              <button className={styles.closeModal} onClick={() => setIsMarketSizingModalVisible(false)}>×</button>
            </div>
            <div className={styles.profileContainer}>
              <h3>Total Addressable Market (TAM)</h3>
              
              <div className={styles.tamDisplay}>
                <div className={styles.tamNumber}>105,624,640</div>
                <div className={styles.tamLabel}>Total U.S. Households</div>
              </div>
              
              <div className={styles.marketSizingAssumptions}>
                <h4>Market Definition:</h4>
                <ul>
                  <li>U.S. households with broadband internet access</li>
                  <li>Adults 18+ with discretionary income for news subscriptions</li>
                  <li>Excludes current cable news bundle subscribers</li>
                  <li>Based on 2024 U.S. Census and media consumption data</li>
                </ul>
              </div>
              
              <p className={styles.tamNote}>
                This TAM represents the maximum potential market for CNN digital subscription products. 
                Actual addressable market will be refined based on targeting and market factors.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Review Core Products Modal */}
      {isReviewCoreProductsModalVisible && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.modal} ${styles.modalLarge}`}>
            <div className={styles.modalHeader}>
              <h2>CNN Core Product Offerings</h2>
              <button className={styles.closeModal} onClick={() => setIsReviewCoreProductsModalVisible(false)}>×</button>
            </div>
            
            {/* Add tabs for navigation */}
            <div className={styles.modalTabs}>
              <button 
                className={`${styles.tabButton} ${activeProductTab === 'reader' ? styles.activeTab : ''}`}
                onClick={() => setActiveProductTab('reader')}
              >
                CNN Reader
              </button>
              <button 
                className={`${styles.tabButton} ${activeProductTab === 'streaming' ? styles.activeTab : ''}`}
                onClick={() => setActiveProductTab('streaming')}
              >
                CNN Streaming
              </button>
              <button 
                className={`${styles.tabButton} ${activeProductTab === 'allaccess' ? styles.activeTab : ''}`}
                onClick={() => setActiveProductTab('allaccess')}
              >
                CNN All-Access
              </button>
            </div>

            <div className={styles.modalContent} style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              {/* CNN Reader Tab */}
              {activeProductTab === 'reader' && coreProductDescriptionsData['CNN Reader'] && (
                <div>
                  <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <h3 style={{ color: '#17a2b8', marginBottom: '10px' }}>
                      {coreProductDescriptionsData['CNN Reader'].title}
                    </h3>
                    <p style={{ fontSize: '18px', color: '#666' }}>
                      {coreProductDescriptionsData['CNN Reader'].subtitle}
                    </p>
                  </div>
                  
                  <div style={{ backgroundColor: '#f8f9fa', padding: '25px', borderRadius: '10px', marginBottom: '30px' }}>
                    <p style={{ fontSize: '16px', lineHeight: '1.8', color: '#333' }}>
                      {coreProductDescriptionsData['CNN Reader'].description}
                    </p>
                  </div>

                  <h4 style={{ color: '#333', marginBottom: '20px' }}>Features Include:</h4>
                  
                  <div style={{ display: 'grid', gap: '20px' }}>
                    {coreProductDescriptionsData['CNN Reader'].features.map((feature, index) => (
                      <div key={index} style={{ borderLeft: '3px solid #17a2b8', paddingLeft: '20px' }}>
                        <h5 style={{ color: '#17a2b8', marginBottom: '5px' }}>{feature.name}</h5>
                        <p style={{ color: '#666' }}>{feature.description}</p>
                      </div>
                    ))}
                  </div>
                  
                  {coreProductDescriptionsData['CNN Reader'].note && (
                    <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#fff3cd', borderRadius: '8px', border: '1px solid #ffeaa7' }}>
                      <p style={{ margin: 0, color: '#856404', fontSize: '14px' }}>
                        <strong>Note:</strong> {coreProductDescriptionsData['CNN Reader'].note}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* CNN Streaming Tab */}
              {activeProductTab === 'streaming' && coreProductDescriptionsData['CNN Streaming'] && (
                <div>
                  <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <h3 style={{ color: '#dc3545', marginBottom: '10px' }}>
                      {coreProductDescriptionsData['CNN Streaming'].title}
                    </h3>
                    <p style={{ fontSize: '18px', color: '#666' }}>
                      {coreProductDescriptionsData['CNN Streaming'].subtitle}
                    </p>
                  </div>
                  
                  <div style={{ backgroundColor: '#f8f9fa', padding: '25px', borderRadius: '10px', marginBottom: '30px' }}>
                    <p style={{ fontSize: '16px', lineHeight: '1.8', color: '#333' }}>
                      {coreProductDescriptionsData['CNN Streaming'].description}
                    </p>
                  </div>

                  <h4 style={{ color: '#333', marginBottom: '20px' }}>Features Include:</h4>
                  
                  <div style={{ display: 'grid', gap: '20px' }}>
                    {coreProductDescriptionsData['CNN Streaming'].features.map((feature, index) => (
                      <div key={index} style={{ borderLeft: '3px solid #dc3545', paddingLeft: '20px' }}>
                        <h5 style={{ color: '#dc3545', marginBottom: '5px' }}>{feature.name}</h5>
                        <p style={{ color: '#666' }}>{feature.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CNN All-Access Tab */}
              {activeProductTab === 'allaccess' && coreProductDescriptionsData['CNN All-Access'] && (
                <div>
                  <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <h3 style={{ color: '#28a745', marginBottom: '10px' }}>
                      {coreProductDescriptionsData['CNN All-Access'].title}
                    </h3>
                    <p style={{ fontSize: '18px', color: '#666' }}>
                      {coreProductDescriptionsData['CNN All-Access'].subtitle}
                    </p>
                  </div>
                  
                  <div style={{ backgroundColor: '#e8f5e9', padding: '25px', borderRadius: '10px', marginBottom: '30px', border: '1px solid #28a745' }}>
                    <p style={{ fontSize: '16px', lineHeight: '1.8', color: '#333' }}>
                      {coreProductDescriptionsData['CNN All-Access'].description}
                    </p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                    <div>
                      <h4 style={{ color: '#17a2b8', marginBottom: '15px' }}>CNN Reader Features Include:</h4>
                      <ul style={{ listStyle: 'none', padding: 0 }}>
                        {coreProductDescriptionsData['CNN Reader'].features.map((feature, index) => (
                          <li key={index} style={{ marginBottom: '10px', paddingLeft: '20px', position: 'relative' }}>
                            <span style={{ position: 'absolute', left: 0, color: '#17a2b8' }}>•</span>
                            {feature.name}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 style={{ color: '#dc3545', marginBottom: '15px' }}>CNN Streaming Features Include:</h4>
                      <ul style={{ listStyle: 'none', padding: 0 }}>
                        {coreProductDescriptionsData['CNN Streaming'].features.map((feature, index) => (
                          <li key={index} style={{ marginBottom: '10px', paddingLeft: '20px', position: 'relative' }}>
                            <span style={{ position: 'absolute', left: 0, color: '#dc3545' }}>•</span>
                            {feature.name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#d4edda', borderRadius: '8px', border: '1px solid #c3e6cb' }}>
                    <p style={{ margin: 0, color: '#155724', fontSize: '16px', textAlign: 'center' }}>
                      <strong>Best Value:</strong> Get everything CNN has to offer in one comprehensive subscription
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Review Features Modal */}
      {isReviewFeaturesModalVisible && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.modal} ${styles.modalMedium}`}>
            <div className={styles.modalHeader}>
              <h2>Feature Descriptions</h2>
              <button className={styles.closeModal} onClick={() => setIsReviewFeaturesModalVisible(false)}>×</button>
            </div>
            <div className={styles.reviewSection}>
              {/* Tab Navigation */}
              <div className={styles.reviewTabs}>
                <button 
                  onClick={() => setActiveReviewTab('reader')}
                  className={`${styles.reviewTab} ${activeReviewTab === 'reader' ? styles.active : ''}`}
                >
                  Reader Features
                </button>
                <button 
                  onClick={() => setActiveReviewTab('streaming')}
                  className={`${styles.reviewTab} ${activeReviewTab === 'streaming' ? styles.active : ''}`}
                >
                  Streaming Features
                </button>
              </div>
              
              {/* Tab Content */}
              {activeReviewTab === 'reader' && (
                <div>
                  {Object.entries(readerFeatureDescriptionsData).map(([feature, description]) => (
                    <div key={feature} className={styles.featureReviewItem}>
                      <h4>{feature}</h4>
                      <p>{description}</p>
                    </div>
                  ))}
                </div>
              )}
              
              {activeReviewTab === 'streaming' && (
                <div>
                  {Object.entries(streamingFeatureDescriptionsData).map(([feature, description]) => (
                    <div key={feature} className={styles.featureReviewItem}>
                      <h4>{feature}</h4>
                      <p>{description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Review Verticals Modal */}
      {isReviewVerticalsModalVisible && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.modal} ${styles.modalMedium}`}>
            <div className={styles.modalHeader}>
              <h2>Vertical Descriptions</h2>
              <button className={styles.closeModal} onClick={() => setIsReviewVerticalsModalVisible(false)}>×</button>
            </div>
            <div className={styles.reviewSection}>
              <div>
                <label className={styles.marketFactorLabel}>
                  Select a Vertical to Review:
                </label>
                <select 
                  value={selectedReviewVertical}
                  onChange={(e) => handleVerticalChange(e.target.value)}
                  className={styles.verticalSelect}
                >
                  <option value="">-- Select a Vertical --</option>
                  {Object.keys(verticalDescriptionsData).map(vertical => (
                    <option key={vertical} value={vertical}>{vertical}</option>
                  ))}
                </select>
              </div>
              
              {selectedReviewVertical && (
                <div className={styles.verticalDetails}>
                  <h3>{selectedReviewVertical}</h3>
                  <p>{verticalDescription}</p>
                  
                  {verticalFeaturesForReview.length > 0 && (
                    <div>
                      <h4 className={styles.verticalFeatures}>Features:</h4>
                      <ul className={styles.verticalFeaturesList}>
                        {verticalFeaturesForReview.map((feature, idx) => (
                          <li key={idx}>{feature}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* About Model Modal */}
      <AboutModelModal
        isOpen={showAboutModel}
        onClose={() => setShowAboutModel(false)}
      />
      
      {/* CNN Utilities Modal */}
      <CNNUtilitiesModal 
        isVisible={showCNNUtilities}
        onClose={() => setShowCNNUtilities(false)}
      />
      
      {/* Attribute Impact Modal */}
      <AttributeImpactModal 
        isVisible={showAttributeImpact}
        onClose={() => setShowAttributeImpact(false)}
      />
 
      {/* Branded Notification Component */}
      <BrandedNotification
        message={notificationMessage}
        isVisible={showNotification}
        onClose={() => setShowNotification(false)}
        type={notificationType}
      />

      {/* Enhanced Product Profiles Modal - keep your existing profile modal too */}
      <EnhancedProductProfiles
        isVisible={profileModalVisible}
        onClose={() => setProfileModalVisible(false)}
        productProfiles={profileData}
        totalRespondents={2158}
      />
    </div>
  );
}