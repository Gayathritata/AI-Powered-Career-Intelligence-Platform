// pages/Profile.jsx
// Displays the exact uploaded resume text cleanly as requested.

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const Profile = () => {
  const navigate = useNavigate();

  const [resumeData] = useState(() => {
    try {
      const savedParsed = sessionStorage.getItem('careercast_parsed_resume') || localStorage.getItem('careercast_parsed_resume');
      if (savedParsed) return JSON.parse(savedParsed);

      const savedActive = sessionStorage.getItem('careercast_active_analysis') || localStorage.getItem('careercast_active_analysis');
      if (savedActive) return JSON.parse(savedActive);
    } catch (e) {
      console.warn('Error reading stored resume data:', e);
    }
    return null;
  });

  const [copied, setCopied] = useState(false);

  const resumeText = resumeData?.rawText || resumeData?.text || '';

  const handleCopyText = () => {
    if (resumeText) {
      navigator.clipboard.writeText(resumeText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!resumeData || !resumeText.trim()) {
    return (
      <>
        <Navbar />
        <div className="bg-mesh" />
        <main className="container" style={{ paddingTop: 48, paddingBottom: 60 }}>
          <div className="glass-card fade-in-up" style={{ maxWidth: 540, margin: '0 auto', padding: 48, textAlign: 'center' }}>
            <div style={{ fontSize: 54, marginBottom: 16 }}>📄</div>
            <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 10 }}>No Resume Uploaded Yet</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: 15 }}>
              Upload your resume or paste resume text to view your complete candidate profile here.
            </p>
            <button onClick={() => navigate('/upload')} className="btn-primary" style={{ padding: '12px 28px', fontSize: 15 }}>
              🚀 Upload Resume Now
            </button>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="bg-mesh" />

      <main className="container" style={{ paddingTop: 40, paddingBottom: 60 }}>
        {/* Page Header */}
        <div className="fade-in-up" style={{ textAlign: 'center', marginBottom: 32 }}>
          <div className="badge badge-primary" style={{ marginBottom: 12 }}>
            <span>📄</span> Extracted Candidate Resume
          </div>
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800, marginBottom: 8 }}>
            Candidate <span className="gradient-text">Resume</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 15, maxWidth: 600, margin: '0 auto' }}>
            Exact text content extracted directly from your uploaded resume file.
          </p>
        </div>

        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          
          {/* CONTROL BAR CARD */}
          <div className="glass-card fade-in-up" style={{
            padding: '24px 32px',
            marginBottom: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 16,
            borderColor: 'rgba(99, 102, 241, 0.35)'
          }}>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 800, margin: 0, color: '#fff' }}>
                {resumeData.name || 'Candidate Profile'}
              </h2>
              {(resumeData.predictedCareer || resumeData.title) && (
                <div style={{ fontSize: 14, color: '#60a5fa', fontWeight: 700, marginTop: 4 }}>
                  🎯 Predicted Career: {resumeData.predictedCareer || resumeData.title}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handleCopyText}
                className="btn-secondary"
                style={{ padding: '10px 18px', fontSize: 14 }}
              >
                {copied ? '✅ Copied to Clipboard!' : '📋 Copy Resume Text'}
              </button>

              <button
                type="button"
                onClick={() => navigate('/results')}
                className="btn-primary"
                style={{ padding: '10px 20px', fontSize: 14 }}
              >
                🎯 View AI Recommendations
              </button>
            </div>
          </div>

          {/* RAW RESUME TEXT DISPLAY CARD */}
          <div className="glass-card fade-in-up" style={{ padding: 36, position: 'relative' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 18,
              paddingBottom: 14,
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <span style={{ fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: '#34d399' }}>
                EXACT RESUME CONTENT
              </span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {resumeText.length} characters
              </span>
            </div>

            <div style={{
              background: 'rgba(15, 23, 42, 0.65)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 12,
              padding: 24,
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 15,
              lineHeight: 1.75,
              color: '#e2e8f0',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              maxHeight: 700,
              overflowY: 'auto'
            }}>
              {resumeText}
            </div>
          </div>

        </div>
      </main>
    </>
  );
};

export default Profile;
