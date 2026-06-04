import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { configureSync, getConsoleSink } from '@logtape/logtape';
//import './index.css'
import './styles/global.css'
import App from './App.jsx'

// Vite browser-safe environment check
const isProduction = import.meta.env.MODE === 'production';

// Initialize LogTape synchronously 
configureSync({
  sinks: {
    console: getConsoleSink(),

    remoteSink: async (record) => {
      if (record.level === 'error' || record.level === 'fatal') {
        try {
          // Point directly to the Express backend port
          await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/client-errors`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message: record.message.join(' '), // Flatten array messages if any
              level: record.level,
              timestamp: new Date(record.timestamp).toISOString(),
            }),
          });
        } catch {
          // Silently fail to protect UI/UX stability
        }
      }
    }
  },
  loggers: [
    {
      category: ['react-app'],
      lowestLevel: isProduction ? 'warning' : 'debug',
      sinks: ['console', 'remoteSink'],
    },
    {
      // FIX: This category target stops LogTape's internal "info" welcome logs
      category: ['logtape', 'meta'],
      lowestLevel: 'warning',
      sinks: ['console'],
    },
  ],
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)