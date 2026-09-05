'use client';

import { clearThemePreview } from '@/app/admin/settings/settingsStore';
import { useState } from 'react';

export function ThemePreviewBanner() {
  const [isClearing, setIsClearing] = useState(false);

  const handleExit = async () => {
    setIsClearing(true);
    await clearThemePreview();
    window.location.reload();
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      backgroundColor: '#0f172a',
      color: '#ffffff',
      padding: '12px 24px',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      zIndex: 999999,
      fontFamily: 'system-ui, sans-serif'
    }}>
      <span style={{ fontWeight: 600, fontSize: '14px' }}>Theme Preview Mode Active</span>
      <button 
        onClick={handleExit}
        disabled={isClearing}
        style={{
          backgroundColor: '#ef4444',
          color: 'white',
          border: 'none',
          padding: '6px 12px',
          borderRadius: '4px',
          cursor: 'pointer',
          fontWeight: 600,
          fontSize: '13px',
          opacity: isClearing ? 0.7 : 1
        }}
      >
        {isClearing ? 'Exiting...' : 'Exit Preview'}
      </button>
    </div>
  );
}
