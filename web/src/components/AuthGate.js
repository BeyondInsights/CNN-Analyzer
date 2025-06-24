// File: src/components/AuthGate.js
'use client';

import { useState, useEffect } from 'react';
import netlifyIdentity from 'netlify-identity-widget';

/**
 * Wraps children and blocks access until Netlify Identity login
 *
 * To work locally, specify your Netlify site URL via an env var:
 *   NEXT_PUBLIC_IDENTITY_URL=https://binspire.netlify.app
 */
export default function AuthGate({ children }) {
  const [user, setUser] = useState(null);
  const [initDone, setInitDone] = useState(false);

  useEffect(() => {
    // Initialize the widget against your Netlify Identity endpoint
    // Fallbacks to window.location origin if no env var provided
    const identityUrl =
      process.env.NEXT_PUBLIC_IDENTITY_URL ||
      `${window.location.origin}/.netlify/identity`;
    netlifyIdentity.init({ APIUrl: identityUrl });
    // Customize the widget when it opens
    netlifyIdentity.on('open', () => {
      // Change header text
      const header = document.querySelector('.login h3');
      if (header) header.textContent = 'BEYOND Insights Sign In';
      // Inject a logo above the form
      const modalBody = document.querySelector('.login-container');
      if (modalBody && !document.getElementById('beyond-logo')) {
        const logo = document.createElement('img');
        logo.src = '/logo-beyond.png'; // place your logo in public/
        logo.id = 'beyond-logo';
        logo.style.width = '120px';
        logo.style.margin = '0 auto 16px';
        modalBody.insertBefore(logo, modalBody.firstChild);
      }
    });

    // Immediately set user & mark init done
    const currentUser = netlifyIdentity.currentUser();
    setUser(currentUser);
    setInitDone(true);

    // Listen for login / logout events
    netlifyIdentity.on('login', (usr) => {
      setUser(usr);
      netlifyIdentity.close();
    });
    netlifyIdentity.on('logout', () => setUser(null));

    return () => {
      netlifyIdentity.off('login');
      netlifyIdentity.off('logout');
    };
  }, []);

  if (!initDone) {
    return <div className="p-6 text-center">Loading authentication…</div>;
  }

  if (!user) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
        <button
          onClick={() => netlifyIdentity.open()}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg"
        >
          Login or Sign Up
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
