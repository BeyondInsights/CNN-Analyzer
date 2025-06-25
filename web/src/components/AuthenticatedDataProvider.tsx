'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { auth } from '@/lib/firebaseClient';
import { loadClientData, clearDataCache } from '@/lib/clientDataLoader';

interface AuthenticatedDataProviderProps {
  isPasswordAuthenticated: boolean;
  userEmail: string;
  onDataLoaded: (data: any) => void;
  onError: (error: string) => void;
  children: React.ReactNode;
}

export default function AuthenticatedDataProvider({ 
  isPasswordAuthenticated, 
  userEmail, 
  onDataLoaded, 
  onError,
  children 
}: AuthenticatedDataProviderProps) {
  const [isFirebaseAuthenticated, setIsFirebaseAuthenticated] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Firebase Auth Effect
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsFirebaseAuthenticated(!!user);
      if (user) {
        console.log('Firebase user authenticated:', user.email || 'anonymous');
      } else {
        console.log('Firebase user not authenticated');
        clearDataCache(); // Clear cache when user logs out
      }
    });

    return () => unsubscribe();
  }, []);

  // Firebase Authentication after Password Auth
  useEffect(() => {
    if (isPasswordAuthenticated && !isFirebaseAuthenticated && !isLoading) {
      const authenticateFirebase = async () => {
        setIsLoading(true);
        try {
          console.log('Authenticating with Firebase...');
          await signInAnonymously(auth);
          console.log('Firebase authentication successful');
        } catch (error) {
          console.error('Firebase authentication failed:', error);
          onError('Failed to authenticate with Firebase. Please try again.');
        } finally {
          setIsLoading(false);
        }
      };

      authenticateFirebase();
    }
  }, [isPasswordAuthenticated, isFirebaseAuthenticated, isLoading, onError]);

  // Data Loading after Firebase Auth
  useEffect(() => {
    if (isFirebaseAuthenticated && !isDataLoaded && !isLoading) {
      const loadData = async () => {
        setIsLoading(true);
        
        try {
          console.log('Loading data from Firebase Storage...');
          const data = await loadClientData();
          onDataLoaded(data);
          setIsDataLoaded(true);
          console.log('Data loaded successfully');
        } catch (error) {
          console.error('Failed to load data:', error);
          onError(error instanceof Error ? error.message : 'Failed to load data');
        } finally {
          setIsLoading(false);
        }
      };

      loadData();
    }
  }, [isFirebaseAuthenticated, isDataLoaded, isLoading, onDataLoaded, onError]);

  // Loading States
  if (!isFirebaseAuthenticated || isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            {!isFirebaseAuthenticated ? 'Authenticating...' : 'Loading Data...'}
          </h2>
          <p className="text-gray-600">
            {!isFirebaseAuthenticated 
              ? 'Connecting to Firebase...' 
              : 'Loading data from secure storage...'}
          </p>
        </div>
      </div>
    );
  }

  if (!isDataLoaded) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-yellow-500 text-6xl mb-4">⏳</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Preparing Data...</h2>
          <p className="text-gray-600">Please wait while we load your data.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
