'use client';

import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { firestore } from '@/lib/firebaseClient';
import { runServerSimulation, testDataLoading } from '@/app/actions';
import AboutModelModal from '@/components/AboutModelModal';
import MarketFactorsModal from '@/components/MarketFactorsModal';
import type { 
  RespondentWithParams, 
  ProductSetupConfig, 
  MarketFactors, 
  SimulationOptions, 
  SimulationResults,
  ReportType,
  OutputType,
  ReportData
} from '@/lib/types';

export default function SimulatorSection() {
  const [loading, setLoading] = useState(false);
  const [respondents, setRespondents] = useState<RespondentWithParams[]>([]);
  const [results, setResults] = useState<SimulationResults | null>(null);
  const [showMarketFactors, setShowMarketFactors] = useState(false);
  const [showAboutModel, setShowAboutModel] = useState(false);
  
  // Report configuration
  const [reportType, setReportType] = useState<ReportType>('independent');
  const [outputType, setOutputType] = useState<OutputType>('percentage');
  
  // Product configurations
  const [products, setProducts] = useState<ProductSetupConfig[]>([
    {
      product: "CNN Reader",
      monthlyRate: 9.99,
      verticals: [],
      readerFeatures: [],
      streamingFeatures: [],
      isActive: true,
      pricingType: 'monthly',
      discount: 'none'
    },
    {
      product: "CNN Streaming",
      monthlyRate: 14.99,
      verticals: [],
      readerFeatures: [],
      streamingFeatures: [],
      isActive: true,
      pricingType: 'monthly',
      discount: 'none'
    },
    {
      product: "CNN All-Access",
      monthlyRate: 19.99,
      verticals: [],
      readerFeatures: [],
      streamingFeatures: [],
      isActive: true,
      pricingType: 'monthly',
      discount: 'none'
    }
  ]);

  // Simulation options
  const [simulationOptions, setSimulationOptions] = useState<SimulationOptions>({
    takeThreshold: 0.15,
    drnFactor: 1.0,
    allocationMethod: 'proportional',
    enablePriceTiers: false,
    priceThreshold: 12,
    lowPriceMultiplier: 1.3,
    highPriceMultiplier: 0.8
  });

  // Market factors
  const [marketFactors, setMarketFactors] = useState<MarketFactors>({
    baseConversion: 1.0,
    awareness: 70,
    distribution: 85,
    competitive: 90,
    marketing: 80,
    yearOneAdoption: 65
  });

  // Simulation state
  const [simulationState, setSimulationState] = useState<'idle' | 'validating' | 'running' | 'complete' | 'error'>('idle');

  // Load respondent data on mount
  useEffect(() => {
    loadRespondentData();
  }, []);

  const loadRespondentData = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(firestore, 'userProfiles'));
      
      if (snapshot.empty) {
        if (DEBUG_MODE) console.warn('No respondent profiles found');
        setRespondents([]);
        return;
      }

      const respondentData: RespondentWithParams[] = snapshot.docs.map(doc => {
        const data = doc.data();
        
        // Determine age group
        const ageGroup = data.Age_18_34 ? "18-34" : 
                        data.Age_35_54 ? "35-54" : 
                        data.Age_55_74 ? "55-74" : 
                        data.Age_75_Plus ? "75+" : "Unknown";
        
        // Determine CNN access frequency
        const cnnAccessFrequency = data.Regularly_Access_CNN ? "Regular CNN User" :
                                  data.Occasionally_Access_CNN ? "Occasional CNN User" :
                                  data.Rarely_Access_CNN ? "Rare CNN User" : "Non-CNN User";
        
        return {
          respondentId: data.Respondent_ID?.toString() || doc.id,
          weight: data.Weight || 1,
          gender: data.Gender || 'Unknown',
          ageGroup,
          hasLinearTV: data.Have_Linear_TV === 1,
          digitalNewsSubscriber: data.Digital_News_Subscriber === 1,
          cnnAccessFrequency,
          parameters: {
            base: {
              reader: data.Base_Reader || 0,
              streaming: data.Base_Streaming || 0,
              allAccess: data.Base_AllAccess || 0,
              standalone: data.Base_Standalone || 0
            },
            price: {
              linear: data.Price_Linear || 0,
              squared: data.Price_Squared || 0
            },
            features: {
              reader: data.readerFeatures || {},
              streaming: data.streamingFeatures || {}
            }
          }
        };
      });

      setRespondents(respondentData);
      if (DEBUG_MODE) console.log(`Loaded ${respondentData.length} respondents from Firebase`);
    } catch (error) {
      if (DEBUG_MODE) console.error('Error loading respondent data:', error);
    } finally {
      setLoading(false);
    }
  };

  const runSimulation = async () => {
    try {
      setSimulationState('validating');
      
      // Get only active products
      const activeProducts = products.filter(p => p.isActive);
      
      if (activeProducts.length === 0) {
        alert('Please select at least one product');
        setSimulationState('idle');
        return;
      }

      // Note: respondents might be empty if Firebase hasn't loaded yet
      // The server will fall back to JSON data
      if (DEBUG_MODE) console.log(`Running simulation with ${respondents.length} Firebase respondents`);

      setSimulationState('running');
      
      // Call server action WITH respondent data
      const result = await runServerSimulation(
      activeProducts,
      reportType,
      outputType,
      marketFactors,
      simulationOptions
    );

      if (result) {
        // Convert ReportData to SimulationResults format if needed
        const simulationResults: SimulationResults = {
          overallTakeRates: result.overallShare,
          segmentTakeRates: result.segmentShares.reduce((acc, segment) => {
            acc[segment.name] = segment.shares;
            return acc;
          }, {} as Record<string, number[]>),
          productNames: activeProducts.map(p => p.product),
          reportType: result.reportType,
          outputType: result.outputType
        };
        
        setResults(simulationResults);
        setSimulationState('complete');
      } else {
        if (DEBUG_MODE) console.error('No results returned from simulation');
        throw new Error('No results returned from simulation');
      }
    } catch (error) {
      if (DEBUG_MODE) console.error('Simulation error:', error);
      if (DEBUG_MODE) console.error('Error details:', {
        activeProductsCount: activeProducts.length,
        respondentsCount: respondents.length,
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      });
      alert(`Simulation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setSimulationState('error');
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">CNN Product Simulator</h1>
        
        {/* Control buttons */}
        <div className="flex gap-4 mb-4">
          <button
            onClick={runSimulation}
            disabled={simulationState === 'running' || loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {simulationState === 'running' ? 'Running...' : 'Run Simulation'}
          </button>
          
          <button
            onClick={() => setShowMarketFactors(true)}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Market Factors
          </button>
          
          <button
            onClick={() => setShowAboutModel(true)}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            About Model
          </button>
          
          <button
            onClick={async () => {
              const result = await testDataLoading();
              if (DEBUG_MODE) console.log('Data loading test:', result);
              alert(`Data loading test: ${result.success ? 'Success' : 'Failed'}\n\nCheck console for details.`);
            }}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Test Data Loading
          </button>
        </div>

        {/* Report configuration */}
        <div className="flex gap-4 mb-4">
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value as ReportType)}
            className="px-3 py-2 border rounded"
          >
            <option value="independent">Independent Products</option>
            <option value="tiered">Tiered Bundles</option>
          </select>
          
          <select
            value={outputType}
            onChange={(e) => setOutputType(e.target.value as OutputType)}
            className="px-3 py-2 border rounded"
          >
            <option value="percentage">Take Rates (%)</option>
            <option value="count">Subscriber Count</option>
            <option value="revenue">Revenue ($)</option>
          </select>
        </div>

        {/* Status display */}
        <div className="text-sm text-gray-600">
          {loading ? 'Loading respondent data...' : `${respondents.length} respondents loaded`}
        </div>
      </div>

      {/* Product configuration section */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3">Products</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product, index) => (
            <div key={index} className="p-4 border rounded">
              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  checked={product.isActive}
                  onChange={(e) => {
                    const updated = [...products];
                    updated[index].isActive = e.target.checked;
                    setProducts(updated);
                  }}
                  className="mr-2"
                />
                <h3 className="font-medium">{product.product}</h3>
              </div>
              <div className="text-sm text-gray-600">
                ${product.monthlyRate}/month
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Results display */}
      {results && simulationState === 'complete' && (
        <div className="mt-6 p-4 bg-gray-50 rounded">
          <h2 className="text-xl font-semibold mb-3">Results</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">Overall Take Rates</h3>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {results.productNames.map((name, idx) => (
                  <div key={name} className="text-sm">
                    <span className="font-medium">{name}:</span> {results.overallTakeRates[idx].toFixed(2)}%
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showMarketFactors && (
        <MarketFactorsModal
          marketFactors={marketFactors}
          onUpdate={setMarketFactors}
          onClose={() => setShowMarketFactors(false)}
        />
      )}
      
      {showAboutModel && (
        <AboutModelModal onClose={() => setShowAboutModel(false)} />
      )}
    </div>
  );
}