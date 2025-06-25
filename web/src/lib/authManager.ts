'use client';

// Simple auth token management without Firebase SDK imports
let authToken: string | null = null;

export async function getAuthToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  
  try {
    // Only import Firebase when we actually need it (runtime only)
    const { auth } = await import('@/lib/firebaseClient');
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    const token = await user.getIdToken();
    authToken = token;
    return token;
  } catch (error) {
    console.error('Failed to get auth token:', error);
    return null;
  }
}

export function setAuthToken(token: string | null) {
  authToken = token;
}

export function getCachedAuthToken(): string | null {
  return authToken;
}
