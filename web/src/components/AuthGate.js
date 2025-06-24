// File: src/components/AuthGate.js
'use client';

import { useState } from 'react';
import PasswordProtect from '@/components/PasswordProtect';

/**
 * Simplified AuthGate - Only uses BEYOND Insights password protection
 * Removed Netlify Identity to eliminate double login
 */
export default function AuthGate({ children }) {
  // Full site pause flag
  if (process.env.NEXT_PUBLIC_PAUSE === 'true') {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-100">
        <h1 className="text-2xl font-bold">Site is temporarily paused.</h1>
      </div>
    );
  }

  // Bypass all auth in development for local testing
  if (process.env.NODE_ENV === 'development') {
    return <>{children}</>;
  }

  // Only use password protection - no Netlify Identity
  const [authenticated, setAuthenticated] = useState(false);
  
  if (!authenticated) {
    return <PasswordProtect onAuthenticated={() => setAuthenticated(true)} />;
  }

  // Authenticated: render app
  return <>{children}</>;
}