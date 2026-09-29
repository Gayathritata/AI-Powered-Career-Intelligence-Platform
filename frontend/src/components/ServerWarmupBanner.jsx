// components/ServerWarmupBanner.jsx
// Proactive Backend Warm-up & Cold-Start Status Banner

import React, { useEffect, useState, useRef } from 'react';
import api from '../services/api';

const ServerWarmupBanner = () => {
  const [status, setStatus] = useState('checking'); // 'checking' | 'online' | 'warming' | 'ready' | 'error'
  const [attemptCount, setAttemptCount] = useState(0);
  const maxAttempts = 8;
  const pollTimerRef = useRef(null);
  const heartbeatTimerRef = useRef(null);

  // Silent background ping function
  const checkHealth = async () => {
    try {
      const res = await api.get('/health', { timeout: 8000 });
      if (res.status === 200) {
        return true;
      }
    } catch (e) {
      return false;
    }
    return false;
  };

  const startPolling = () => {
    if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    let attempts = 0;
    setStatus('warming');

    pollTimerRef.current = setInterval(async () => {
      attempts += 1;
      setAttemptCount(attempts);
      const isOk = await checkHealth();
      if (isOk) {
        clearInterval(pollTimerRef.current);
        setStatus('ready');
        setTimeout(() => setStatus('online'), 4000);
      } else if (attempts >= maxAttempts) {
        clearInterval(pollTimerRef.current);
        setStatus('error');
      }
    }, 4000);
  };

  useEffect(() => {
    // Initial health check on application launch
    (async () => {
      const ok = await checkHealth();
      if (ok) {
        setStatus('online');
      } else {
        startPolling();
      }
    })();

    // Setup 10-minute heartbeat ping to reset Render 15-minute sleep timer while tab is open
    heartbeatTimerRef.current = setInterval(() => {
      checkHealth();
    }, 10 * 60 * 1000);

    // Event listeners for Axios interceptor cold start events
    const handleColdStartEvent = (e) => {
      setStatus('warming');
      if (e.detail?.attempt) {
        setAttemptCount(e.detail.attempt);
      }
    };

    const handleResolvedEvent = () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      setStatus('ready');
      setTimeout(() => setStatus('online'), 4000);
    };

    const handleFailedEvent = () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      setStatus('error');
    };

    window.addEventListener('careercast_cold_start', handleColdStartEvent);
    window.addEventListener('careercast_cold_start_resolved', handleResolvedEvent);
    window.addEventListener('careercast_cold_start_failed', handleFailedEvent);

    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      if (heartbeatTimerRef.current) clearInterval(heartbeatTimerRef.current);
      window.removeEventListener('careercast_cold_start', handleColdStartEvent);
      window.removeEventListener('careercast_cold_start_resolved', handleResolvedEvent);
      window.removeEventListener('careercast_cold_start_failed', handleFailedEvent);
    };
  }, []);

  if (status === 'online' || status === 'checking') {
    return null;
  }

  return (
    <div
      style={{
        position: 'relative',
        zIndex: 9999,
        background:
          status === 'ready'
            ? 'linear-gradient(90deg, #10b981, #059669)'
            : status === 'error'
            ? 'linear-gradient(90deg, #dc2626, #991b1b)'
            : 'linear-gradient(90deg, #4f46e5, #0284c7)',
        color: '#ffffff',
        padding: '10px 16px',
        fontSize: '13px',
        fontWeight: 600,
        textAlign: 'center',
        boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        flexWrap: 'wrap',
      }}
    >
      {status === 'warming' && (
        <>
          <span
            className="spinner"
            style={{
              width: 14,
              height: 14,
              borderColor: 'rgba(255,255,255,0.3)',
              borderTopColor: '#fff',
            }}
          />
          <span>
            ⚡ <strong>Render Backend Cold Start:</strong> Waking up cloud server (~20–30s delay). Auto-retrying request (Attempt {attemptCount > 0 ? attemptCount : 1}/{maxAttempts})...
          </span>
        </>
      )}

      {status === 'ready' && (
        <span>
          ✅ <strong>Backend Connected!</strong> Cloud server is active and ready for fast responses.
        </span>
      )}

      {status === 'error' && (
        <>
          <span>
            ⚠️ <strong>Backend Connection Issue:</strong> Cloud server took longer than expected to respond.
          </span>
          <button
            onClick={() => {
              setStatus('warming');
              setAttemptCount(1);
              startPolling();
            }}
            style={{
              background: '#ffffff',
              color: '#991b1b',
              border: 'none',
              borderRadius: '6px',
              padding: '4px 10px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            🔄 Retry Warmup
          </button>
        </>
      )}
    </div>
  );
};

export default ServerWarmupBanner;
