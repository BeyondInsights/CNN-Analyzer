import React, { useState } from 'react';

interface PasswordProtectProps {
  onAuthenticated: (email: string) => void;
}

export default function PasswordProtect({ onAuthenticated }: PasswordProtectProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password === 'BEYONDInsightsRules!') {
      onAuthenticated('authenticated@beyondinsights.com');
    } else {
      setError('Invalid password');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <img 
            src="https://i.imgur.com/AdWCvzX.png" 
            alt="Beyond Insights Logo" 
            style={{ height: '60px', marginBottom: '20px' }}
          />
          <h2 style={{ color: '#333', marginBottom: '10px' }}>CNN Digital News Simulator</h2>
          <p style={{ color: '#666', fontSize: '14px' }}>Enter password to access</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '16px'
              }}
            />
          </div>
          
          {error && (
            <div style={{
              color: '#dc3545',
              marginBottom: '20px',
              padding: '10px',
              backgroundColor: '#f8d7da',
              borderRadius: '4px',
              fontSize: '14px',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}
          
          <button
            type="submit"
            style={{
              width: '100%',
              padding: '12px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Access Simulator
          </button>
        </form>
        
        <div style={{
          marginTop: '30px',
          textAlign: 'center',
          fontSize: '12px',
          color: '#999'
        }}>
          Powered by Beyond Insights
        </div>
      </div>
    </div>
  );
}
