// lib/secureSimulatorClient.ts
import { functions } from './firebaseClient';
import { httpsCallable } from 'firebase/functions';

// Cache with expiration and user binding
const secureCache = new Map<string, { data: any; expires: number; uid: string }>();

// Obfuscate function names
const _0x4a2b = httpsCallable(functions, 'getSecureData');
const _0x7c9e = httpsCallable(functions, 'verifyPassword');

export async function verifyUserPassword(email: string, password: string): Promise<boolean> {
  try {
    const result = await _0x7c9e({ email, password });
    return (result.data as { success: boolean }).success;
  } catch (error) {
    console.error('Verification failed');
    return false;
  }
}

export async function loadPrimaryDataFiles(): Promise<any> {
  try {
    // Check cache first (bound to user)
    const cacheKey = 'primary_data';
    const cached = secureCache.get(cacheKey);
    
    if (cached && cached.expires > Date.now()) {
      // Verify cache is for current user
      const currentUser = (window as any).__uid;
      if (cached.uid === currentUser) {
        return cached.data;
      }
    }

    // Load all data types
    const [utilities, respondent, profile] = await Promise.all([
      _0x4a2b({ fileType: 'utilities' }),
      _0x4a2b({ fileType: 'respondent' }),
      _0x4a2b({ fileType: 'profile' })
    ]);

    const data = {
      utilities: (utilities.data as { data: any }).data,
      data: (respondent.data as { data: any }).data,
      profile: (profile.data as { data: any }).data
    };

    // Cache for 30 minutes
    secureCache.set(cacheKey, {
      data,
      expires: Date.now() + 30 * 60 * 1000,
      uid: (window as any).__uid
    });

    return data;
  } catch (error: any) {
    // Clear cache on error
    secureCache.clear();
    
    if (error.code === 'resource-exhausted') {
      throw new Error('Daily access limit reached. Please try again tomorrow.');
    } else if (error.code === 'permission-denied') {
      throw new Error('Access denied. Please contact administrator.');
    } else {
      throw new Error('Unable to load data. Please try again later.');
    }
  }
}

// Prevent debugging
(function() {
  // Disable right-click
  document.addEventListener('contextmenu', e => e.preventDefault());
  
  // Detect DevTools
  let devtools = { open: false, orientation: null };
  const threshold = 160;
  
  setInterval(() => {
    if (window.outerHeight - window.innerHeight > threshold || 
        window.outerWidth - window.innerWidth > threshold) {
      if (!devtools.open) {
        devtools.open = true;
        // Clear sensitive data and redirect
        secureCache.clear();
        window.location.href = 'https://www.cnn.com';
      }
    } else {
      devtools.open = false;
    }
  }, 500);
  
  // Disable console
  Object.defineProperty(console, 'log', { value: () => {} });
  Object.defineProperty(console, 'info', { value: () => {} });
  Object.defineProperty(console, 'warn', { value: () => {} });
  Object.defineProperty(console, 'error', { value: () => {} });
})();