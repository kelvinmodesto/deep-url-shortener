import { useState } from 'react';
import './UrlShortener.css';

interface ShortenedUrl {
  id: string;
  originalUrl: string;
  shortUrl: string;
  shortCode: string;
  createdAt: string;
}

interface ApiResponse {
  success: boolean;
  data: ShortenedUrl;
  message: string;
}

// API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const UrlShortener = () => {
  const [url, setUrl] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [description, setDescription] = useState('');
  const [shortenedUrl, setShortenedUrl] = useState<ShortenedUrl | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    'unknown' | 'connected' | 'disconnected'
  >('unknown');
  const [testingConnection, setTestingConnection] = useState(false);

  const testConnection = async () => {
    setTestingConnection(true);
    try {
      const response = await fetch(`${API_BASE_URL}/ping`);
      if (response.ok) {
        console.log('✅ API connection successful');
        setConnectionStatus('connected');
        return true;
      } else {
        console.error('❌ API responded with status:', response.status);
        setConnectionStatus('disconnected');
        return false;
      }
    } catch (err) {
      console.error('❌ API connection failed:', err);
      setConnectionStatus('disconnected');
      return false;
    } finally {
      setTestingConnection(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!url) {
      setError('Please enter a URL');
      return;
    }

    setLoading(true);
    setError('');
    setShortenedUrl(null);

    try {
      // First test connection
      const connectionOk = await testConnection();
      if (!connectionOk) {
        setError(
          `Cannot connect to API server at ${API_BASE_URL}. Please ensure the server is running on port 3000.`,
        );
        return;
      }

      const requestBody: any = {
        originalUrl: url,
      };

      if (customCode.trim()) {
        requestBody.customCode = customCode.trim();
      }

      if (description.trim()) {
        requestBody.description = description.trim();
      }

      console.log('🚀 Sending request to:', `${API_BASE_URL}/api/urls`);
      console.log('📤 Request body:', requestBody);

      const response = await fetch(`${API_BASE_URL}/api/urls`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('📥 Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Response error:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data: ApiResponse = await response.json();
      console.log('📋 Response data:', data);

      if (data.success) {
        setShortenedUrl(data.data);
        setUrl('');
        setCustomCode('');
        setDescription('');
      } else {
        setError(data.message || 'Failed to shorten URL');
      }
    } catch (err: any) {
      console.error('💥 Full error:', err);
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setError(
          `Network error: Cannot reach ${API_BASE_URL}. Please check:\n• Is the API server running?\n• Is it accessible on port 3000?\n• Check browser console for CORS errors.`,
        );
      } else {
        setError(err.message || 'An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!shortenedUrl) return;

    try {
      await navigator.clipboard.writeText(shortenedUrl.shortUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  return (
    <div className="url-shortener">
      <div className="container">
        <h1>URL Shortener</h1>
        <p className="subtitle">
          Transform your long URLs into short, shareable links
        </p>

        <div className="connection-status">
          <div className={`status-indicator ${connectionStatus}`}>
            <span className="status-dot"></span>
            <span className="status-text">
              {connectionStatus === 'connected' && 'API Connected'}
              {connectionStatus === 'disconnected' && 'API Disconnected'}
              {connectionStatus === 'unknown' && 'Connection Unknown'}
            </span>
          </div>
          <button
            type="button"
            onClick={testConnection}
            disabled={testingConnection}
            className="test-connection-btn"
          >
            {testingConnection ? 'Testing...' : 'Test Connection'}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="shortener-form">
          <div className="form-group">
            <label htmlFor="url">Enter URL *</label>
            <input
              type="url"
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/very-long-url"
              className={error && !url ? 'error' : ''}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="customCode">Custom Code (optional)</label>
            <input
              type="text"
              id="customCode"
              value={customCode}
              onChange={(e) => setCustomCode(e.target.value)}
              placeholder="my-custom-link"
              pattern="[a-zA-Z0-9]+"
              title="Only alphanumeric characters allowed"
            />
            <small>Only letters and numbers allowed</small>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description (optional)</label>
            <input
              type="text"
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description for this link"
              maxLength={500}
            />
          </div>

          {error && (
            <div className="error-message">
              <div style={{ whiteSpace: 'pre-line' }}>{error}</div>
              <details style={{ marginTop: '0.5rem' }}>
                <summary style={{ cursor: 'pointer', fontSize: '0.9rem' }}>
                  Debug Info
                </summary>
                <div style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
                  API URL: {API_BASE_URL}
                  <br />
                  Time: {new Date().toLocaleTimeString()}
                </div>
              </details>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !url || !isValidUrl(url)}
            className="shorten-btn"
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Shortening...
              </>
            ) : (
              'Shorten URL'
            )}
          </button>
        </form>

        {shortenedUrl && (
          <div className="result-section">
            <h3>Your shortened URL is ready!</h3>
            <div className="result-card">
              <div className="url-info">
                <div className="url-row">
                  <label>Original URL:</label>
                  <span
                    className="original-url"
                    title={shortenedUrl.originalUrl}
                  >
                    {shortenedUrl.originalUrl}
                  </span>
                </div>
                <div className="url-row">
                  <label>Short URL:</label>
                  <div className="short-url-container">
                    <a
                      href={shortenedUrl.shortUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="short-url"
                    >
                      {shortenedUrl.shortUrl}
                    </a>
                    <button
                      onClick={copyToClipboard}
                      className={`copy-btn ${copySuccess ? 'success' : ''}`}
                      title="Copy to clipboard"
                    >
                      {copySuccess ? (
                        <>
                          <span className="checkmark">✓</span>
                          Copied!
                        </>
                      ) : (
                        <>
                          <span className="copy-icon">📋</span>
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                </div>
                <div className="url-row">
                  <label>Created:</label>
                  <span className="created-date">
                    {new Date(shortenedUrl.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="features">
          <h3>How to Use</h3>
          <div className="instructions">
            <div className="instruction-step">
              <span className="step-number">1</span>
              <div className="step-content">
                <strong>Enter your URL</strong>
                <p>
                  Paste any long URL you want to shorten (must start with
                  http:// or https://)
                </p>
              </div>
            </div>
            <div className="instruction-step">
              <span className="step-number">2</span>
              <div className="step-content">
                <strong>Customize (Optional)</strong>
                <p>
                  Add a custom short code or description to personalize your
                  link
                </p>
              </div>
            </div>
            <div className="instruction-step">
              <span className="step-number">3</span>
              <div className="step-content">
                <strong>Shorten & Share</strong>
                <p>
                  Click "Shorten URL" and copy your new short link to share
                  anywhere
                </p>
              </div>
            </div>
          </div>

          <h3>Features</h3>
          <ul>
            <li>✨ Instant URL shortening</li>
            <li>🎯 Custom short codes</li>
            <li>📊 Click tracking</li>
            <li>📋 One-click copy to clipboard</li>
            <li>📱 Mobile-friendly design</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default UrlShortener;
