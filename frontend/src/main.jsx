import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Automatically route /api requests and provide resilience against cloud cold starts and rate limits
const apiUrl = import.meta.env.VITE_API_URL;
const originalFetch = window.fetch;

window.fetch = async function (input, init) {
  let targetUrl = input;
  if (typeof input === 'string' && input.startsWith('/api') && apiUrl) {
    targetUrl = `${apiUrl.replace(/\/$/, '')}${input}`;
  }

  let res;
  try {
    res = await originalFetch(targetUrl, init);
  } catch (err) {
    throw err;
  }

  // Automatic single retry for cold start (502/503/504) or rate limit (429) on cloud hosts
  if ((res.status === 429 || res.status === 502 || res.status === 503 || res.status === 504) && (!init || !init._isRetry)) {
    await new Promise((r) => setTimeout(r, 1800));
    try {
      const retryInit = { ...(init || {}), _isRetry: true };
      const retryRes = await originalFetch(targetUrl, retryInit);
      if (retryRes && retryRes.ok) {
        res = retryRes;
      }
    } catch (_) {
      // Keep original response if retry fails
    }
  }

  // Safe JSON wrapper to prevent "Unexpected token 'T', Too Many Requests is not valid JSON"
  const origJson = res.json.bind(res);
  res.json = async function () {
    const clone = res.clone();
    try {
      return await origJson();
    } catch (_) {
      try {
        const text = await clone.text();
        return {
          error: text.trim() || `HTTP ${res.status}`,
          detail: { message: text.trim() || `Server returned HTTP ${res.status}` }
        };
      } catch {
        return {
          error: `HTTP ${res.status}`,
          detail: { message: `Server returned HTTP ${res.status}` }
        };
      }
    }
  };

  return res;
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

