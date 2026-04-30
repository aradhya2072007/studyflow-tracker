import React from 'react';

export default function ToastContainer({ toasts }) {
  return (
    <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 999, display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 320 }}>
      {toasts.map(t => (
        <div key={t.id} className="fade-in" style={{
          background: t.type === 'success' ? 'linear-gradient(135deg,#059669,#10b981)' : t.type === 'warning' ? 'linear-gradient(135deg,#d97706,#fbbf24)' : 'var(--glass)',
          backdropFilter: 'blur(16px)',
          border: `1px solid ${t.type === 'success' ? 'rgba(16,185,129,.3)' : t.type === 'warning' ? 'rgba(245,158,11,.3)' : 'var(--border)'}`,
          borderRadius: 14, padding: '12px 16px',
          fontSize: 13, fontWeight: 500,
          color: t.type === 'success' || t.type === 'warning' ? 'white' : 'var(--text)',
          boxShadow: '0 4px 20px rgba(0,0,0,.12)',
          lineHeight: 1.4,
        }}>
          {t.message}
        </div>
      ))}
    </div>
  );
}
