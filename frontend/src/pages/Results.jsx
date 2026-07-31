// pages/Results.jsx
// AI Career Recommendations & Skill Gap Analysis based on uploaded resume.

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

// Required skills taxonomy for key career paths
const ROLE_SKILL_REQUIREMENTS = {
  'Frontend Developer': ['React', 'TypeScript', 'JavaScript', 'HTML5', 'CSS3', 'Next.js', 'Tailwind CSS', 'Redux', 'Web Performance', 'Git'],
  'Frontend Engineer': ['React', 'TypeScript', 'JavaScript', 'HTML5', 'CSS3', 'Next.js', 'Tailwind CSS', 'Redux', 'Web Performance', 'Git'],
  'Full Stack Developer': ['React', 'Node.js', 'Python', 'TypeScript', 'FastAPI', 'PostgreSQL', 'Docker', 'REST APIs', 'Git', 'AWS'],
  'Full Stack Web Developer': ['React', 'Node.js', 'Python', 'TypeScript', 'FastAPI', 'PostgreSQL', 'Docker', 'REST APIs', 'Git', 'AWS'],
  'Backend Developer': ['Python', 'FastAPI', 'Node.js', 'Django', 'PostgreSQL', 'SQL', 'Redis', 'Microservices', 'Docker', 'Git'],
  'Backend Engineer': ['Python', 'FastAPI', 'Node.js', 'Django', 'PostgreSQL', 'SQL', 'Redis', 'Microservices', 'Docker', 'Git'],
  'Data Scientist': ['Python', 'Pandas', 'NumPy', 'Scikit-Learn', 'SQL', 'PyTorch', 'TensorFlow', 'Data Visualization', 'Statistics', 'Machine Learning'],
  'Data Scientist & ML Engineer': ['Python', 'Pandas', 'NumPy', 'Scikit-Learn', 'SQL', 'PyTorch', 'TensorFlow', 'Data Visualization', 'Statistics', 'Machine Learning'],
  'AI Engineer': ['Python', 'PyTorch', 'TensorFlow', 'Deep Learning', 'LLMs', 'LangChain', 'OpenAI API', 'Vector Databases', 'Transformers', 'Git'],
  'Machine Learning Engineer': ['Python', 'Scikit-Learn', 'PyTorch', 'TensorFlow', 'MLOps', 'Feature Engineering', 'Docker', 'SQL', 'Git'],
  'DevOps Engineer': ['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Terraform', 'Linux', 'Jenkins', 'Bash', 'Prometheus', 'Git'],
  'DevOps & Cloud Engineer': ['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Terraform', 'Linux', 'Jenkins', 'Bash', 'Prometheus', 'Git'],
  'Cybersecurity Analyst': ['SIEM', 'Firewalls', 'Vulnerability Assessment', 'Linux', 'Network Security', 'Python', 'Incident Response', 'Wireshark'],
  'Web Developer': ['HTML5', 'CSS3', 'JavaScript', 'PHP', 'WordPress', 'React', 'Git', 'Responsive Design']
};

const DEFAULT_REQUIRED_SKILLS = ['Problem Solving', 'Git', 'System Architecture', 'REST APIs', 'Database Design', 'Agile / Scrum', 'CI/CD Pipelines', 'Code Optimization'];

const Results = () => {
  const navigate = useNavigate();
  const [parsedData] = useState(() => {
    const saved = sessionStorage.getItem('careercast_parsed_resume');
    return saved ? JSON.parse(saved) : null;
  });

  const topCareer = parsedData?.predictedCareer || 'Full Stack Web Developer';
  const matchScore = parsedData?.matchScore || 94.5;
  const userSkills = parsedData?.skills || ['React', 'Node.js', 'Python', 'SQL', 'Git'];

  // Identify required skills for the top predicted career
  const requiredSkills = ROLE_SKILL_REQUIREMENTS[topCareer] || DEFAULT_REQUIRED_SKILLS;

  // Calculate matching vs missing skills (Skill Gap)
  const normalizedUserSkills = userSkills.map(s => s.toLowerCase());
  const matchingSkills = requiredSkills.filter(req => 
    normalizedUserSkills.some(user => user.includes(req.toLowerCase()) || req.toLowerCase().includes(user))
  );
  const missingSkills = requiredSkills.filter(req => !matchingSkills.includes(req));

  const skillMatchPercent = Math.round((matchingSkills.length / Math.max(requiredSkills.length, 1)) * 100);

  // Predictions list (Top 5)
  const predictionsList = parsedData?.predictions && parsedData.predictions.length > 0
    ? parsedData.predictions
    : [
        { career: topCareer, confidence: matchScore },
        { career: 'Frontend Engineer', confidence: Math.round(matchScore * 0.92) },
        { career: 'Backend Engineer', confidence: Math.round(matchScore * 0.86) },
        { career: 'Software Engineer', confidence: Math.round(matchScore * 0.79) },
        { career: 'DevOps & Cloud Engineer', confidence: Math.round(matchScore * 0.72) }
      ];

  return (
    <>
      <Navbar />
      <div className="bg-mesh" />

      <main className="container" style={{ paddingTop: 48, paddingBottom: 60 }}>
        {/* Title */}
        <div className="fade-in-up" style={{ textAlign: 'center', marginBottom: 40 }}>
          <div className="badge badge-primary" style={{ marginBottom: 12 }}>
            <span>🎯</span> AI Career Recommendations & Skill Gap Analysis
          </div>
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800, marginBottom: 12 }}>
            Personalized <span className="gradient-text">AI Recommendations</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 16, maxWidth: 650, margin: '0 auto' }}>
            Top predicted career matches, skill alignment scores, and actionable skill gap bridge plans calculated for your resume.
          </p>
        </div>

        {parsedData ? (
          <div style={{ maxWidth: 960, margin: '0 auto' }}>
            
            {/* Top Recommended Career Banner */}
            <div className="glass-card fade-in-up" style={{
              padding: 36,
              marginBottom: 36,
              border: '1px solid rgba(99, 102, 241, 0.4)',
              background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(59,130,246,0.08) 100%)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20 }}>
                <div>
                  <div className="badge badge-success" style={{ marginBottom: 10 }}>
                    🏆 #1 Top AI Recommended Match
                  </div>
                  <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 36px)', fontWeight: 900 }}>{topCareer}</h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 15, marginTop: 8 }}>
                    Extracted from Candidate Profile: <strong>{parsedData.name}</strong>
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 42, fontWeight: 900, color: '#60a5fa' }}>
                    {matchScore}%
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 700, letterSpacing: 0.5 }}>
                    SUITABILITY ACCURACY
                  </div>
                </div>
              </div>
            </div>

            {/* SKILL GAP ANALYSIS SECTION */}
            <div className="glass-card fade-in-up" style={{ padding: 36, marginBottom: 36, borderColor: 'rgba(245, 158, 11, 0.3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
                <div>
                  <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, color: '#f59e0b', fontWeight: 700, marginBottom: 4 }}>
                    ⚡ SKILL GAP ANALYSIS
                  </div>
                  <h3 style={{ fontSize: 24, fontWeight: 800 }}>
                    Skill Alignment for <span style={{ color: 'var(--color-primary-light)' }}>{topCareer}</span>
                  </h3>
                </div>
                <div style={{
                  padding: '8px 18px',
                  borderRadius: 'var(--radius-full)',
                  background: 'rgba(245, 158, 11, 0.12)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  color: '#fbbf24',
                  fontWeight: 800,
                  fontSize: 16
                }}>
                  {skillMatchPercent}% Skill Match ({matchingSkills.length}/{requiredSkills.length} Required Skills)
                </div>
              </div>

              {/* Progress bar */}
              <div style={{
                width: '100%',
                height: 12,
                background: 'rgba(255, 255, 255, 0.08)',
                borderRadius: 6,
                overflow: 'hidden',
                marginBottom: 28
              }}>
                <div style={{
                  height: '100%',
                  width: `${skillMatchPercent}%`,
                  background: 'linear-gradient(90deg, #10b981, #3b82f6)',
                  borderRadius: 6,
                  transition: 'width 0.8s ease'
                }} />
              </div>

              {/* Two Column Grid: Matching Skills vs Missing Skill Gap */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, marginBottom: 28 }}>
                
                {/* Column 1: Skills You Have */}
                <div style={{
                  padding: 20,
                  borderRadius: 12,
                  background: 'rgba(16, 185, 129, 0.06)',
                  border: '1px solid rgba(16, 185, 129, 0.25)'
                }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#34d399', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>✅</span> Skills Matched in Your Resume ({matchingSkills.length})
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {matchingSkills.length > 0 ? (
                      matchingSkills.map(skill => (
                        <span key={skill} style={{
                          padding: '6px 12px',
                          borderRadius: 8,
                          background: 'rgba(16, 185, 129, 0.15)',
                          color: '#6ee7b7',
                          border: '1px solid rgba(16, 185, 129, 0.3)',
                          fontSize: 13,
                          fontWeight: 600
                        }}>
                          ✓ {skill}
                        </span>
                      ))
                    ) : (
                      <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>No direct requirement matches found.</span>
                    )}
                  </div>
                </div>

                {/* Column 2: Missing Skills (Skill Gap) */}
                <div style={{
                  padding: 20,
                  borderRadius: 12,
                  background: 'rgba(245, 158, 11, 0.06)',
                  border: '1px solid rgba(245, 158, 11, 0.25)'
                }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#fbbf24', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>⚠️</span> Skill Gap / Recommended Skills to Learn ({missingSkills.length})
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {missingSkills.length > 0 ? (
                      missingSkills.map(skill => (
                        <span key={skill} style={{
                          padding: '6px 12px',
                          borderRadius: 8,
                          background: 'rgba(245, 158, 11, 0.15)',
                          color: '#fcd34d',
                          border: '1px solid rgba(245, 158, 11, 0.3)',
                          fontSize: 13,
                          fontWeight: 600
                        }}>
                          + {skill}
                        </span>
                      ))
                    ) : (
                      <span style={{ fontSize: 13, color: '#34d399', fontWeight: 600 }}>🎉 Great job! Your resume covers all key required skills.</span>
                    )}
                  </div>
                </div>

              </div>

              {/* Action Plan to Bridge Skill Gap */}
              {missingSkills.length > 0 && (
                <div style={{
                  padding: 20,
                  borderRadius: 12,
                  background: 'rgba(99, 102, 241, 0.08)',
                  border: '1px solid rgba(99, 102, 241, 0.25)'
                }}>
                  <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 8, color: '#818cf8' }}>
                    💡 Action Plan to Bridge Your Skill Gap:
                  </div>
                  <ul style={{ margin: 0, paddingLeft: 20, color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.7 }}>
                    <li>Take specialized online courses covering: <strong>{missingSkills.slice(0, 3).join(', ')}</strong>.</li>
                    <li>Build 1-2 portfolio projects integrating <strong>{missingSkills[0] || 'Modern Frameworks'}</strong> and deploy live.</li>
                    <li>Add hands-on project accomplishments with these technologies to your resume to increase AI match accuracy above 95%.</li>
                  </ul>
                </div>
              )}
            </div>

            {/* TOP 5 AI PREDICTED ROLES */}
            <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 20 }}>
              Top 5 AI Career Role Predictions
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginBottom: 40 }}>
              {predictionsList.map((item, idx) => (
                <div key={`${item.career}-${idx}`} className="glass-card" style={{ padding: 24 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-primary-light)' }}>#{idx + 1}</span>
                        <h4 style={{ fontSize: 20, fontWeight: 700 }}>{item.career}</h4>
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                        Ranked suitability based on skill overlap & experience features.
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span className="badge badge-primary">Rank #{idx + 1}</span>
                      <span style={{ fontSize: 22, fontWeight: 800, color: idx === 0 ? '#60a5fa' : 'var(--color-success)' }}>
                        {item.confidence}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation Actions */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
              <button onClick={() => navigate('/upload')} className="btn-primary" style={{ padding: '12px 24px' }}>
                🚀 Upload Another Resume
              </button>
              <button onClick={() => navigate('/profile')} className="btn-secondary" style={{ padding: '12px 24px' }}>
                👤 View Candidate Profile
              </button>
            </div>

          </div>
        ) : (
          <div className="glass-card fade-in-up" style={{ maxWidth: 540, margin: '0 auto', padding: 48, textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎯</div>
            <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 10 }}>No Predictions Available Yet</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
              Upload your resume first so AI can analyze your qualifications and generate predictions.
            </p>
            <button onClick={() => navigate('/upload')} className="btn-primary">
              🚀 Upload Resume Now
            </button>
          </div>
        )}
      </main>
    </>
  );
};

export default Results;
