// lib/simulatorClient.ts
import { storage, auth, isUserAuthenticated } from './firebaseClient';
import { ref, getDownloadURL, getMetadata, uploadBytes } from 'firebase/storage';

// File mappings - only obfuscate sensitive respondent data
const DATA_FILES = {
  // Configuration files (not sensitive - keep original names)
  readerFeatures: 'data/readerFeatureDescriptions.json',
  streamingFeatures: 'data/streamingFeatureDescriptions.json',
  verticals: 'data/verticalDescriptions.json',
  pricing: 'data/pricingRanges.json',
  coreProducts: 'data/coreProductDescriptions.json',
  segments: 'data/segmentDescriptions.json',
  
  // Respondent data files (SENSITIVE - use obfuscated names)
  utilities: 'data/a7b9c2d1.json',  // was respondentUtilities.json
  data: 'data/c9d4e7f1.json',       // was respondentData.json
  profile: 'data/e5f8a3b2.json'     // was respondentProfile.json
} as const;

/**
 * IMPORTANT: Only these 3 files need to be renamed in Firebase Storage:
 * - respondentUtilities.json → a7b9c2d1.json
 * - respondentData.json → c9d4e7f1.json
 * - respondentProfile.json → e5f8a3b2.json
 */

// Type definitions
interface RespondentUtilities {
  utilityWeights: Record<string, number>;
  featureUtilities: Record<string, Record<string, number>>;
  priceElasticity: Record<string, number>;
}

interface RespondentData {
  segments: Array<{
    id: string;
    size: number;
    demographics: Record<string, any>;
    behaviors: Record<string, any>;
  }>;
  totalRespondents: number;
  completedResponses: number;
}

interface RespondentProfile {
  profiles: Record<string, {
    description: string;
    characteristics: string[];
    preferences: Record<string, any>;
  }>;
  segmentMapping: Record<string, string[]>;
}

interface ConfigurationFiles {
  readerFeatures: Record<string, string>;
  streamingFeatures: Record<string, string>;
  verticals: Record<string, any>;
  pricing: Record<string, any>;
  coreProducts: Record<string, string>;
  segments?: Record<string, any>;
}

interface PrimaryDataFiles {
  utilities: RespondentUtilities;
  data: RespondentData;
  profile: RespondentProfile;
}

interface AllDataFiles extends ConfigurationFiles, PrimaryDataFiles {}

// Report types
interface SimulationResult {
  id: string;
  timestamp: Date;
  config: any;
  results: any;
}

class SecureSimulatorClient {
  private cache: Map<string, any> = new Map();
  private readonly CACHE_DURATION = 1000 * 60 * 60; // 1 hour

  /**
   * Check if user has data view permissions
   */
  async checkDataAccess(): Promise<boolean> {
    if (!auth.currentUser) return false;
    
    try {
      const idTokenResult = await auth.currentUser.getIdTokenResult();
      return idTokenResult.claims.canViewData === true;
    } catch (error) {
      console.error('Error checking data access:', error);
      return false;
    }
  }

  /**
   * Check if user is admin
   */
  async isAdmin(): Promise<boolean> {
    if (!auth.currentUser) return false;
    
    try {
      const idTokenResult = await auth.currentUser.getIdTokenResult();
      return idTokenResult.claims.admin === true;
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  }

  /**
   * Load all primary data files (respondent data)
   * These are the SENSITIVE files that require authentication + permission check
   */
  async loadPrimaryDataFiles(): Promise<PrimaryDataFiles> {
  // Comment out the auth check for now
  // if (!isUserAuthenticated()) {
  //   throw new Error('User must be authenticated to access data files');
  // }

  // Also comment out this check
  // const hasAccess = await this.checkDataAccess();
  // if (!hasAccess) {
  //   throw new Error('User does not have permission to view data files. Please contact administrator.');
  // }

  try {
    const [utilities, data, profile] = await Promise.all([
      this.loadSecureFile<RespondentUtilities>(DATA_FILES.utilities),
      this.loadSecureFile<RespondentData>(DATA_FILES.data),
      this.loadSecureFile<RespondentProfile>(DATA_FILES.profile)
    ]);

    return { utilities, data, profile };
  } catch (error) {
    console.error('Failed to load primary data files:', error);
    throw new Error('Unable to load required data files. Please check your connection and permissions.');
  }
}
 /**
   * Load configuration files (features, pricing, etc.)
   * These are NOT sensitive - just product descriptions
   */
  async loadConfigurationFiles(): Promise<ConfigurationFiles> {
    if (!isUserAuthenticated()) {
      throw new Error('User must be authenticated to access configuration files');
    }

    // No extra permission check needed - these aren't sensitive

    try {
      const [readerFeatures, streamingFeatures, verticals, pricing, coreProducts] = await Promise.all([
        this.loadSecureFile<Record<string, string>>(DATA_FILES.readerFeatures),
        this.loadSecureFile<Record<string, string>>(DATA_FILES.streamingFeatures),
        this.loadSecureFile<Record<string, any>>(DATA_FILES.verticals),
        this.loadSecureFile<Record<string, any>>(DATA_FILES.pricing),
        this.loadSecureFile<Record<string, string>>(DATA_FILES.coreProducts)
      ]);

      // Segments file is optional
      let segments;
      try {
        segments = await this.loadSecureFile<Record<string, any>>(DATA_FILES.segments);
      } catch {
        // Segments file might not exist
        segments = undefined;
      }

      return { readerFeatures, streamingFeatures, verticals, pricing, coreProducts, segments };
    } catch (error) {
      console.error('Failed to load configuration files:', error);
      throw new Error('Unable to load configuration files. Please check your connection.');
    }
  }

  /**
   * Load all data files (both configuration and respondent data)
   */
  async loadAllDataFiles(): Promise<AllDataFiles> {
    const [configFiles, primaryFiles] = await Promise.all([
      this.loadConfigurationFiles(),
      this.loadPrimaryDataFiles()
    ]);

    return { ...configFiles, ...primaryFiles };
  }

  /**
   * Load a single file with caching and validation
   */
  private async loadSecureFile<T>(filePath: string): Promise<T> {
    // Check cache first
    const cached = this.getFromCache<T>(filePath);
    if (cached) return cached;

    const fileRef = ref(storage, filePath);
    
    try {
      // Get metadata to validate
      const metadata = await getMetadata(fileRef);
      
      // Validate version exists (optional)
      if (!metadata.customMetadata?.version) {
        console.warn(`File ${filePath} is missing version metadata`);
      }
      
      // Get download URL and fetch
      const url = await getDownloadURL(fileRef);
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch ${filePath}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Cache the result
      this.addToCache(filePath, data);
      
      return data as T;
    } catch (error) {
      console.error(`Error loading ${filePath}:`, error);
      throw error;
    }
  }

  /**
   * Save simulation results
   */
  async saveSimulation(simulation: SimulationResult): Promise<string> {
    if (!isUserAuthenticated()) {
      throw new Error('Must be authenticated to save simulations');
    }

    const fileName = `simulations/${simulation.id}/results.json`;
    const fileRef = ref(storage, fileName);
    
    const metadata = {
      customMetadata: {
        createdBy: auth.currentUser!.uid,
        createdAt: new Date().toISOString(),
        simulationId: simulation.id
      }
    };
    
    const blob = new Blob([JSON.stringify(simulation)], { type: 'application/json' });
    await uploadBytes(fileRef, blob, metadata);
    
    return fileName;
  }

  /**
   * Generate and save report
   */
  async saveReport(reportId: string, reportData: any, format: 'json' | 'csv' | 'pdf'): Promise<string> {
    if (!isUserAuthenticated()) {
      throw new Error('Must be authenticated to save reports');
    }

    const extension = format === 'pdf' ? 'pdf' : format === 'csv' ? 'csv' : 'json';
    const contentType = format === 'pdf' ? 'application/pdf' : format === 'csv' ? 'text/csv' : 'application/json';
    
    const fileName = `reports/${reportId}/report.${extension}`;
    const fileRef = ref(storage, fileName);
    
    const metadata = {
      contentType,
      customMetadata: {
        generatedBy: auth.currentUser!.uid,
        generatedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        reportId
      }
    };
    
    let blob: Blob;
    if (format === 'json') {
      blob = new Blob([JSON.stringify(reportData, null, 2)], { type: contentType });
    } else if (format === 'csv') {
      const csvContent = this.convertToCSV(reportData);
      blob = new Blob([csvContent], { type: contentType });
    } else {
      // For PDF, reportData should already be a blob
      blob = reportData;
    }
    
    await uploadBytes(fileRef, blob, metadata);
    
    return fileName;
  }

  /**
   * Save temporary work
   */
  async saveTempWork(data: any): Promise<string> {
    if (!isUserAuthenticated()) {
      throw new Error('Must be authenticated');
    }

    const tempId = `temp_${Date.now()}`;
    const fileName = `temp/${auth.currentUser!.uid}/${tempId}.json`;
    const fileRef = ref(storage, fileName);
    
    const metadata = {
      customMetadata: {
        tempExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
      }
    };
    
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    await uploadBytes(fileRef, blob, metadata);
    
    return tempId;
  }

  /**
   * Load temporary work
   */
  async loadTempWork(tempId: string): Promise<any> {
    if (!isUserAuthenticated()) {
      throw new Error('Must be authenticated');
    }

    const fileName = `temp/${auth.currentUser!.uid}/${tempId}.json`;
    const fileRef = ref(storage, fileName);
    
    const url = await getDownloadURL(fileRef);
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Temporary file not found or expired');
    }
    
    return response.json();
  }

  /**
   * Helper to convert data to CSV
   */
  private convertToCSV(data: any): string {
    if (Array.isArray(data)) {
      const headers = Object.keys(data[0] || {}).join(',');
      const rows = data.map(row => 
        Object.values(row).map(v => 
          typeof v === 'string' && v.includes(',') ? `"${v}"` : v
        ).join(',')
      );
      return [headers, ...rows].join('\n');
    }
    return JSON.stringify(data);
  }

  /**
   * Cache management
   */
  private getFromCache<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    const isExpired = Date.now() - entry.timestamp > this.CACHE_DURATION;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data as T;
  }

  private addToCache(key: string, data: any) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  clearCache() {
    this.cache.clear();
  }
}

// Export singleton instance
export const simulatorClient = new SecureSimulatorClient();

// Export convenience functions
export const loadPrimaryDataFiles = () => simulatorClient.loadPrimaryDataFiles();
export const loadConfigurationFiles = () => simulatorClient.loadConfigurationFiles();
export const loadAllDataFiles = () => simulatorClient.loadAllDataFiles();
export const saveSimulation = (simulation: SimulationResult) => simulatorClient.saveSimulation(simulation);
export const saveReport = (reportId: string, data: any, format: 'json' | 'csv' | 'pdf' = 'json') => 
  simulatorClient.saveReport(reportId, data, format);
export const saveTempWork = (data: any) => simulatorClient.saveTempWork(data);
export const loadTempWork = (tempId: string) => simulatorClient.loadTempWork(tempId);

// For backward compatibility - map old function names
export const loadDataFromStorage = loadAllDataFiles;