"use client";
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';

interface PasswordProtectProps {
  onAuthenticated: (email: string) => void;
}

export default function PasswordProtect({ onAuthenticated }: PasswordProtectProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

const ALLOWED_EMAILS = [
  'john.bekier@beyondinsights.com',
  'rich.bowell@gmail.com',
  'andy.borinstein@beyondinsights.com',
  'elaine.sheng@beyondinsights.com',
  ];

  const handleSubmit = () => {
    setError('');
    
    const correctPassword = "BEYOND Insights Rules";
    
    if (!email) {
      setError('Please enter your email address.');
      return;
    }
    
    if (password === correctPassword) {
      onAuthenticated(email);
    } else {
      setError('Invalid credentials. Please try again.');
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 50,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      padding: '1rem'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '28rem',
        backgroundColor: 'white',
        borderRadius: '0.5rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        padding: '2rem'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <img 
            src="https://i.imgur.com/B4zCjNq.png" 
            alt="BEYOND Insights" 
            width={120} 
          height={60}
          style={{ objectFit: 'contain' }}
      />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            CNN Subscription Simulator
          </h2>
          <p style={{ color: '#666', fontSize: '0.875rem' }}>
            Please enter your credentials to access the simulator.
          </p>
        </div>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
            Email Address
          </label>
          <input
            type="email"
            placeholder="your.email@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #ddd',
              borderRadius: '0.375rem',
              fontSize: '1rem'
            }}
          />
        </div>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
            Access Password
          </label>
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #ddd',
              borderRadius: '0.375rem',
              fontSize: '1rem'
            }}
          />
        </div>
        
        {error && (
          <p style={{ color: '#dc2626', fontSize: '0.875rem', marginBottom: '1rem' }}>
            {error}
          </p>
        )}
        
        <button
          onClick={handleSubmit}
          style={{
            width: '100%',
            padding: '0.75rem',
            backgroundColor: '#CC0000',
            color: 'white',
            border: 'none',
            borderRadius: '0.375rem',
            fontSize: '1.125rem',
            fontWeight: '500',
            cursor: 'pointer',
            marginBottom: '1rem'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#AA0000'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#CC0000'}
        >
          Access Simulator
        </button>
        
        <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#666' }}>
          Authorized users only. Access attempts are logged.
        </p>
      </div>
    </div>
  );
}