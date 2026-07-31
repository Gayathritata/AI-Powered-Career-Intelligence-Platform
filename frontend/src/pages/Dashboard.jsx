// pages/Dashboard.jsx
// Direct Access Dashboard — Features immediate Resume Uploading, Quick Stats, & AI Career Workflows.

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const steps = [
  {
    icon: '📄',
    title: 'Resume Upload',
    desc: 'Upload PDF/DOCX or pick sample resume for instant parsing.',
    to: '/upload',
    cta: 'Start Upload',
    color: '#6366f1',
  },
  {
    icon: '👤',
    title: 'Profile Insights',
    desc: 'View extracted technical skills, education, and career experience.',
    to: '/profile',
    cta: 'View Profile',
    color: '#06b6d4',
  },
  {
    icon: '🎯',
    title: 'AI Recommendations',
    desc: 'Get machine learning role predictions with fit confidence scores.',
    to: '/results',
    cta: 'Explore Predictions',
    color: '#8b5cf6',
  },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [parsedData] = useState(() => {
    const saved = sessionStorage.getItem('careercast_parsed_resume');
    return saved ? JSON.parse(saved) : null;
  });

  return (
    <>
      <Navbar />
      <div className="bg-mesh" />

      <main className="container" style={{ paddingTop: 48, paddingBottom: 60 }}>
        {/* Welcome Hero */}
        <div className="fade-in-up" style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 18px',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(99,102,241,0.12)',
            border: '1px solid rgba(99,102,241,0.25)',
            marginBottom: 20,
          }}>
            <span>✨</span>
            <span style={{ fontSize: 13, color: 'var(--color-primary-light)', fontWeight: 600 }}>
              CareerCast Direct Access Dashboard
            </span>
          </div>

          <h1 style={{ fontSize: 'clamp(32px, 5vw, 54px)', fontWeight: 900, marginBottom: 16 }}>
            Welcome to <span className="gradient-text">CareerCast AI</span> 
          </h1>
          <p style={{
            fontSize: 18,
            color: 'var(--text-secondary)',
            maxWidth: 620,
            margin: '0 auto',
            lineHeight: 1.6,
          }}>
            
          </p>
        </div>

        {/* Highlighted Resume Upload Hero Box */}
        <div className="glass-card fade-in-up" style={{
          padding: 40,
          marginBottom: 48,
          border: '1px solid rgba(99, 102, 241, 0.35)',
          background: 'linear-gradient(135deg, rgba(22, 24, 38, 0.85) 0%, rgba(30, 33, 58, 0.6) 100%)',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 24,
          }}>
            <div style={{ flex: '1 1 400px' }}>
              <div className="badge badge-primary" style={{ marginBottom: 12 }}>
                <span>⚡</span> Primary Step
              </div>
              <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12 }}>
                📄 Upload Resume to Get Started
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.6, marginBottom: 20 }}>
                Upload your resume file (PDF, DOCX, TXT) or choose from pre-configured sample resumes
                to see real-time skill parsing and career matching.
              </p>
              
      

              {parsedData ? (
                <div style={{
                  padding: '14px 20px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  marginBottom: 20,
                }}>
                  <span style={{ fontSize: 24 }}>✅</span>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-success)' }}>
                      Active Resume: {parsedData.name} ({parsedData.matchScore || 94.5}% Match)
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                      Top Recommended Role: <strong>{parsedData.predictedCareer || 'Full Stack Web Developer'}</strong>
                    </div>
                  </div>
                </div>
              ) : null}

              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                <button
                  onClick={() => navigate('/upload')}
                  className="btn-primary"
                  id="dashboard-main-upload-btn"
                  style={{ padding: '14px 24px', fontSize: 15 }}
                >
                  🚀 Upload Resume Now
                </button>

              </div>
            </div>

            {/* Visual dropzone preview graphic */}
            <div
              onClick={() => navigate('/upload')}
              style={{
                flex: '0 0 280px',
                padding: 32,
                borderRadius: 'var(--radius-lg)',
                background: 'rgba(99, 102, 241, 0.06)',
                border: '2px dashed rgba(99, 102, 241, 0.3)',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
            >
              <div style={{ fontSize: 42, marginBottom: 12 }}>📤</div>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>
                Drop Resume Here
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Click to open upload workspace
              </div>
            </div>
          </div>
        </div>

        {/* Workflow 3-Step Grid */}
        <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20, textAlign: 'center' }}>
          Explore CareerCast Features
        </h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 24,
          marginBottom: 48,
        }}>
          {steps.map((step, i) => (
            <div
              key={step.title}
              className="glass-card fade-in-up"
              style={{
                padding: 32,
                animationDelay: `${i * 100}ms`,
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 52,
                  height: 52,
                  borderRadius: 14,
                  background: `${step.color}1a`,
                  border: `1px solid ${step.color}40`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 24,
                }}>
                  {step.icon}
                </div>
                <span style={{
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: 1,
                  color: step.color,
                  textTransform: 'uppercase',
                }}>
                  Module {i + 1}
                </span>
              </div>

              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
                  {step.title}
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6 }}>
                  {step.desc}
                </p>
              </div>

              <Link
                to={step.to}
                className="btn-ghost"
                style={{
                  marginTop: 'auto',
                  borderColor: `${step.color}40`,
                  color: step.color,
                  justifyContent: 'center',
                }}
              >
                {step.cta} →
              </Link>
            </div>
          ))}
        </div>
      </main>
    </>
  );
};

export default Dashboard;
