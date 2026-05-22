import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        {toasts.map(toast => (
          <div
            key={toast.id}
            onClick={() => removeToast(toast.id)}
            style={{
              background: toast.type === 'error' ? 'var(--danger)' : toast.type === 'warning' ? 'var(--warning)' : 'var(--success)',
              color: 'white',
              padding: '12px 16px',
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 500,
              boxShadow: 'var(--shadow-lg)',
              cursor: 'pointer',
              maxWidth: 320,
              animation: 'toastIn 0.25s ease',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span>
              {toast.type === 'error' ? '✕' : toast.type === 'warning' ? '⚠' : '✓'}
            </span>
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
