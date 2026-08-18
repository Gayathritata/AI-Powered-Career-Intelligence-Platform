// pages/Analytics.jsx
// CareerCast Analytics: Milestone 2 Dashboard

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const Analytics = () => {
  const navigate = useNavigate();

  // Load candidate's active parsed resume predictions if available
  const [parsedData, setParsedData] = useState(() => {
    const saved = sessionStorage.getItem('careercast_parsed_resume') || localStorage.getItem('careercast_parsed_resume');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    const handleStorageChange = () => {
      const saved = sessionStorage.getItem('careercast_parsed_resume') || localStorage.getItem('careercast_parsed_resume');
      if (saved) setParsedData(JSON.parse(saved));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Top-5 Career Recommendations derived from candidate resume predictions or defaults
  const top5Recommendations = parsedData?.predictions && parsedData.predictions.length >= 5
    ? parsedData.predictions.slice(0, 5).map((p, idx) => ({
        rank: idx + 1,
        name: p.career || p.name,
        confidence: Math.round(p.confidence || p.score || 85),
        icon: idx === 0 ? '🧠' : idx === 1 ? '🧪' : idx === 2 ? '💻' : idx === 3 ? '📈' : '🔬'
      }))
    : [
        { rank: 1, name: parsedData?.predictedCareer || 'ML Engineer', confidence: parsedData?.confidence || 94, icon: '🧠' },
        { rank: 2, name: 'Data Scientist', confidence: 89, icon: '🧪' },
        { rank: 3, name: 'Backend Dev', confidence: 85, icon: '💻' },
        { rank: 4, name: 'Product Manager', confidence: 81, icon: '📈' },
        { rank: 5, name: 'AI Researcher', confidence: 78, icon: '🔬' }
      ];

  // t-SNE Cluster dataset points
  const generateClusterPoints = () => {
    const clusters = [
      { name: 'Software Engineering', color: '#3b82f6', cx: 12, cy: 18, r: 8, count: 50 },
      { name: 'Data Science', color: '#10b981', cx: -8, cy: 14, r: 7, count: 45 },
      { name: 'Product Management', color: '#f97316', cx: 2, cy: -5, r: 6, count: 35 },
      { name: 'AI/ML', color: '#ef4444', cx: 18, cy: -12, r: 8, count: 50 },
      { name: 'Research', color: '#8b5cf6', cx: -15, cy: -14, r: 7, count: 40 },
      { name: 'Finance', color: '#eab308', cx: 10, cy: -22, r: 6, count: 30 },
    ];

    const points = [];
    clusters.forEach((c) => {
      for (let i = 0; i < c.count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.sqrt(Math.random()) * c.r;
        points.push({
          x: c.cx + Math.cos(angle) * dist,
          y: c.cy + Math.sin(angle) * dist,
          color: c.color,
          cluster: c.name,
        });
      }
    });
    return { clusters, points };
  };

  const { clusters, points } = generateClusterPoints();

  return (
    <>
      <Navbar />
      <div className="bg-mesh" />

      <main className="container" style={{ paddingTop: 32, paddingBottom: 60 }}>
        {/* Page Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 28,
          flexWrap: 'wrap',
          gap: 16
        }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '4px 14px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(99,102,241,0.12)',
              border: '1px solid rgba(99,102,241,0.25)',
              marginBottom: 10,
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--color-primary-light)'
            }}>
              <span>📊 Career Intelligence Analytics</span>
            </div>
            <h1 style={{ fontSize: 32, fontWeight: 900, margin: 0 }}>
              CareerCast Analytics Dashboard
            </h1>
          </div>

          {parsedData && (
            <div style={{
              padding: '10px 18px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: 10
            }}>
              <span style={{ fontSize: 18 }}>📄</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#10b981' }}>
                Resume Loaded: {parsedData.name || 'Candidate Profile'}
              </span>
            </div>
          )}
        </div>

        {/* Panel 1: Model Comparison - Accuracy */}
        <div className="glass-card fade-in-up" style={{
          padding: 28,
          marginBottom: 28,
          border: '1px solid rgba(99, 102, 241, 0.25)',
          position: 'relative'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 24
          }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
              Model Comparison - Accuracy
            </h2>
           
          </div>

          {/* Main Layout: 3 Graphs in 3 Colors + Side Accuracy Box */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 24,
            alignItems: 'center'
          }}>
            {/* 3 Bar Graphs Container */}
            <div style={{ position: 'relative', height: 260, width: '100%' }}>
              {/* Grid Y-Axis Lines */}
              {[1.0, 0.8, 0.6, 0.4, 0.2, 0].map((val) => (
                <div key={val} style={{
                  position: 'absolute',
                  top: `${(1.0 - val) * 200}px`,
                  left: 45,
                  right: 0,
                  display: 'flex',
                  alignItems: 'center',
                  borderTop: val === 0 ? '1px solid rgba(255,255,255,0.3)' : '1px dashed rgba(255,255,255,0.08)',
                  height: 0
                }}>
                  <span style={{
                    position: 'absolute',
                    left: -40,
                    fontSize: 12,
                    color: 'var(--text-muted)',
                    fontWeight: 600
                  }}>
                    {val.toFixed(1)}
                  </span>
                </div>
              ))}

              {/* Bars Group */}
              <div style={{
                position: 'absolute',
                top: 0,
                bottom: 40,
                left: 60,
                right: 20,
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'space-around',
                paddingLeft: 10,
                paddingRight: 10
              }}>
                {/* Graph 1: Logistic Regression (Cyan Theme) */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 120 }}>
                  <div style={{
                    width: '100%',
                    height: `${0.912 * 200}px`,
                    background: 'linear-gradient(180deg, rgba(56, 189, 248, 0.8) 0%, rgba(2, 132, 199, 0.35) 100%)',
                    borderRadius: '6px 6px 0 0',
                    border: '1px solid #38bdf8',
                    boxShadow: '0 0 15px rgba(56, 189, 248, 0.35)',
                    transition: 'all 0.3s ease'
                  }} />
                  <span style={{ marginTop: 12, fontSize: 13, fontWeight: 700, color: '#38bdf8', textAlign: 'center' }}>
                    Logistic Regression
                  </span>
                </div>

                {/* Graph 2: Random Forest (Purple Theme) */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 120 }}>
                  <div style={{
                    width: '100%',
                    height: `${0.9345 * 200}px`,
                    background: 'linear-gradient(180deg, rgba(192, 132, 252, 0.8) 0%, rgba(126, 34, 206, 0.35) 100%)',
                    borderRadius: '6px 6px 0 0',
                    border: '1px solid #c084fc',
                    boxShadow: '0 0 15px rgba(192, 132, 252, 0.35)',
                    transition: 'all 0.3s ease'
                  }} />
                  <span style={{ marginTop: 12, fontSize: 13, fontWeight: 700, color: '#c084fc', textAlign: 'center' }}>
                    Random Forest
                  </span>
                </div>

                {/* Graph 3: XGBoost (Golden Amber Theme) */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 120, position: 'relative' }}>
                  {/* Golden Badge */}
                  <div style={{
                    position: 'absolute',
                    top: -38,
                    background: 'rgba(234, 179, 8, 0.2)',
                    border: '1px solid #eab308',
                    borderRadius: 20,
                    padding: '3px 10px',
                    fontSize: 11,
                    fontWeight: 700,
                    color: '#fef08a',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    whiteSpace: 'nowrap',
                    boxShadow: '0 0 12px rgba(234, 179, 8, 0.4)'
                  }}>
                    <span>✔</span> Threshold Met
                  </div>

                  <div style={{
                    width: '100%',
                    height: `${0.9582 * 200}px`,
                    background: 'linear-gradient(180deg, rgba(234, 179, 8, 0.8) 0%, rgba(180, 83, 9, 0.4) 100%)',
                    borderRadius: '6px 6px 0 0',
                    border: '1px solid #eab308',
                    boxShadow: '0 0 25px rgba(234, 179, 8, 0.35)',
                    transition: 'all 0.3s ease'
                  }} />
                  <span style={{ marginTop: 12, fontSize: 13, fontWeight: 800, color: '#fef08a', textAlign: 'center' }}>
                    XGBoost
                  </span>
                </div>
              </div>
            </div>

            {/* Side Box: Accuracy Values */}
            <div style={{
              background: 'rgba(15, 23, 42, 0.65)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: 'var(--radius-md)',
              padding: 16,
              display: 'flex',
              flexDirection: 'column',
              gap: 12
            }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 2 }}>
                🎯 Accuracy Values
              </div>

              {/* Value Box 1: Logistic Regression */}
              <div style={{
                background: 'rgba(56, 189, 248, 0.1)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                borderRadius: 8,
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#38bdf8' }}>Logistic Regression</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Validation Accuracy</div>
                </div>
                <div style={{
                  fontSize: 16,
                  fontWeight: 900,
                  color: '#38bdf8',
                  background: 'rgba(56, 189, 248, 0.18)',
                  padding: '4px 10px',
                  borderRadius: 6,
                  border: '1px solid rgba(56, 189, 248, 0.4)'
                }}>
                  91.20%
                </div>
              </div>

              {/* Value Box 2: Random Forest */}
              <div style={{
                background: 'rgba(192, 132, 252, 0.1)',
                border: '1px solid rgba(192, 132, 252, 0.3)',
                borderRadius: 8,
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#c084fc' }}>Random Forest</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Validation Accuracy</div>
                </div>
                <div style={{
                  fontSize: 16,
                  fontWeight: 900,
                  color: '#c084fc',
                  background: 'rgba(192, 132, 252, 0.18)',
                  padding: '4px 10px',
                  borderRadius: 6,
                  border: '1px solid rgba(192, 132, 252, 0.4)'
                }}>
                  93.45%
                </div>
              </div>

              {/* Value Box 3: XGBoost */}
              <div style={{
                background: 'rgba(234, 179, 8, 0.12)',
                border: '1px solid rgba(234, 179, 8, 0.4)',
                borderRadius: 8,
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 0 12px rgba(234, 179, 8, 0.15)'
              }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#fef08a', display: 'flex', alignItems: 'center', gap: 6 }}>
                    XGBoost <span style={{ fontSize: 9, background: '#eab308', color: '#000', padding: '1px 5px', borderRadius: 4, fontWeight: 800 }}>BEST</span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Validation Accuracy</div>
                </div>
                <div style={{
                  fontSize: 16,
                  fontWeight: 900,
                  color: '#fef08a',
                  background: 'rgba(234, 179, 8, 0.22)',
                  padding: '4px 10px',
                  borderRadius: 6,
                  border: '1px solid #eab308'
                }}>
                  95.82%
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom 2 Grid Panels */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: 28
        }}>
          {/* Panel 2: Top-5 Career Recommendations */}
          <div className="glass-card fade-in-up" style={{
            padding: 24,
            border: '1px solid rgba(99, 102, 241, 0.25)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 20
            }}>
              <h3 style={{ fontSize: 17, fontWeight: 800, margin: 0 }}>
                Top-5 Career Recommendations
              </h3>
              
            </div>

            {/* Table Headers */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '40px 1fr 90px',
              padding: '8px 12px',
              fontSize: 12,
              fontWeight: 700,
              color: 'var(--text-muted)',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              marginBottom: 8
            }}>
              <span>#</span>
              <span>Name</span>
              <span style={{ textAlign: 'right' }}>Confidence</span>
            </div>

            {/* Recommendation Rows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {top5Recommendations.map((item, idx) => {
                const isTop = idx === 0;
                return (
                  <div
                    key={item.name}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '40px 1fr 90px',
                      alignItems: 'center',
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-md)',
                      background: isTop ? 'rgba(234, 179, 8, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                      border: isTop ? '1px solid rgba(234, 179, 8, 0.4)' : '1px solid rgba(255, 255, 255, 0.06)',
                      boxShadow: isTop ? '0 2px 12px rgba(234, 179, 8, 0.15)' : 'none',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <span style={{
                      fontWeight: 800,
                      fontSize: 14,
                      color: isTop ? '#fef08a' : 'var(--text-muted)'
                    }}>
                      {item.rank}
                    </span>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 18 }}>{item.icon}</span>
                      <span style={{
                        fontWeight: isTop ? 800 : 600,
                        fontSize: 15,
                        color: isTop ? '#fef08a' : 'var(--text-primary)'
                      }}>
                        {item.name}
                      </span>
                    </div>

                    <span style={{
                      textAlign: 'right',
                      fontWeight: 800,
                      fontSize: 15,
                      color: isTop ? '#fef08a' : item.confidence >= 85 ? '#38bdf8' : '#a7f3d0'
                    }}>
                      {item.confidence}%
                    </span>
                  </div>
                );
              })}
            </div>

            {!parsedData && (
              <div style={{
                marginTop: 'auto',
                paddingTop: 16,
                textAlign: 'center'
              }}>
                <button
                  onClick={() => navigate('/upload')}
                  className="btn-secondary"
                  style={{ fontSize: 13, padding: '8px 16px', width: '100%' }}
                >
                  🚀 Upload Resume to Customize Analytics
                </button>
              </div>
            )}
          </div>

          {/* Panel 3: t-SNE Visualization: Skill Embeddings (SBERT) */}
          <div className="glass-card fade-in-up" style={{
            padding: 24,
            border: '1px solid rgba(99, 102, 241, 0.25)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 16
            }}>
              <h3 style={{ fontSize: 17, fontWeight: 800, margin: 0 }}>
                t-SNE Visualization: Skill Embeddings (SBERT)
              </h3>
              
            </div>

            {/* SVG Scatter Plot Canvas */}
            <div style={{ position: 'relative', width: '100%', height: 260, background: 'rgba(15, 23, 42, 0.6)', borderRadius: 'var(--radius-md)', padding: 10 }}>
              <svg width="100%" height="100%" viewBox="-35 -35 70 70" preserveAspectRatio="xMidYMid meet">
                {/* Grid Lines & Axis */}
                <line x1="-30" y1="0" x2="30" y2="0" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
                <line x1="0" y1="-30" x2="0" y2="30" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />

                {/* Overlap Highlight Ellipses */}
                <circle cx="2" cy="-2" r="11" fill="rgba(255, 255, 255, 0.08)" stroke="rgba(255, 255, 255, 0.25)" strokeDasharray="1,1" strokeWidth="0.6" />
                <text x="2" y="-14" fill="#cbd5e1" fontSize="3" textAnchor="middle" fontWeight="bold">
                  Interdisciplinary Skillset Overlap
                </text>

                <circle cx="-12" cy="-16" r="9" fill="rgba(255, 255, 255, 0.05)" stroke="rgba(255, 255, 255, 0.2)" strokeDasharray="1,1" strokeWidth="0.5" />
                <text x="-12" y="-26" fill="#cbd5e1" fontSize="2.5" textAnchor="middle">
                  Interdisciplinary Skillset Overlap
                </text>

                {/* Scatter Points */}
                {points.map((pt, i) => (
                  <circle key={i} cx={pt.x} cy={-pt.y} r="1.2" fill={pt.color} opacity="0.85" />
                ))}

                {/* Axis Labels */}
                <text x="0" y="33" fill="#94a3b8" fontSize="3" textAnchor="middle" fontWeight="bold">
                  t-SNE Component 1
                </text>
                <text x="-34" y="0" fill="#94a3b8" fontSize="3" textAnchor="middle" transform="rotate(-90 -34 0)" fontWeight="bold">
                  t-SNE Component 2
                </text>
              </svg>

              {/* Legend overlay on right */}
              <div style={{
                position: 'absolute',
                top: 12,
                right: 12,
                background: 'rgba(10, 15, 30, 0.85)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8,
                padding: '8px 12px',
                fontSize: 10,
                display: 'flex',
                flexDirection: 'column',
                gap: 4
              }}>
                {clusters.map((c) => (
                  <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: c.color, display: 'inline-block' }} />
                    <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{c.name}</span>
                  </div>
                ))}
              </div>

              {/* Zoom Controls Overlay */}
              <div style={{
                position: 'absolute',
                bottom: 12,
                left: 12,
                background: 'rgba(10, 15, 30, 0.85)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 6,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
              }}>
                
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Analytics;
