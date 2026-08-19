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
  'ML Engineer': ['Python', 'SQL', 'PyTorch', 'Kubernetes', 'MLOps', 'AWS SageMaker'],
  'Machine Learning Engineer': ['Python', 'Scikit-Learn', 'PyTorch', 'TensorFlow', 'MLOps', 'Feature Engineering', 'Docker', 'SQL', 'Git'],
  'DevOps Engineer': ['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Terraform', 'Linux', 'Jenkins', 'Bash', 'Prometheus', 'Git'],
  'DevOps & Cloud Engineer': ['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Terraform', 'Linux', 'Jenkins', 'Bash', 'Prometheus', 'Git'],
  'Cybersecurity Analyst': ['SIEM', 'Firewalls', 'Vulnerability Assessment', 'Linux', 'Network Security', 'Python', 'Incident Response', 'Wireshark'],
  'Web Developer': ['HTML5', 'CSS3', 'JavaScript', 'PHP', 'WordPress', 'React', 'Git', 'Responsive Design']
};

const DEFAULT_REQUIRED_SKILLS = ['Problem Solving', 'Git', 'System Architecture', 'REST APIs', 'Database Design', 'Agile / Scrum', 'CI/CD Pipelines', 'Code Optimization'];

const SKILL_LEARNING_GUIDES = {
  'Kubernetes': { hours: 45, level: 'Advanced', resource: 'Kubernetes Fundamentals (Linux Foundation)', project: 'Deploy an Auto-Scaling Kubernetes Cluster with Helm' },
  'MLOps': { hours: 35, level: 'Intermediate', resource: 'MLOps Specialization (DeepLearning.AI)', project: 'Build an Automated ML Pipeline with MLflow & CI/CD Gate' },
  'AWS SageMaker': { hours: 30, level: 'Intermediate', resource: 'AWS SageMaker Developer Guide', project: 'Deploy & Monitor Scalable SageMaker Endpoints' },
  'Docker': { hours: 20, level: 'Intermediate', resource: 'Docker Curriculum & Mastery', project: 'Containerize Microservices with Docker Compose' },
  'PyTorch': { hours: 40, level: 'Intermediate', resource: 'Official PyTorch 60min Blitz', project: 'Implement Transformer Architecture from Scratch' },
  'FastAPI': { hours: 20, level: 'Beginner', resource: 'FastAPI Official Documentation', project: 'Develop Async RESTful Microservices' }
};

const Results = () => {
  const navigate = useNavigate();
  const [parsedData] = useState(() => {
    const saved = sessionStorage.getItem('careercast_parsed_resume');
    return saved ? JSON.parse(saved) : null;
  });

  const topCareer = parsedData?.predictedCareer || 'ML Engineer';
  const matchScore = parsedData?.matchScore || 94.5;
  const userSkills = parsedData?.skills || ['Python', 'SQL', 'PyTorch'];

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
        { career: topCareer, confidence: matchScore, matched_skills: ['Python', 'SQL', 'PyTorch'], missing_skills: ['Kubernetes', 'MLOps', 'AWS SageMaker'] },
        { career: 'AI Engineer', confidence: Math.round(matchScore * 0.92) },
        { career: 'Data Scientist', confidence: Math.round(matchScore * 0.86) },
        { career: 'Software Engineer', confidence: Math.round(matchScore * 0.79) },
        { career: 'DevOps & Cloud Engineer', confidence: Math.round(matchScore * 0.72) }
      ];

  const handleDownload = (format) => {
    const reportData = {
      title: "CareerCast AI - Skill Gap & Career Intelligence Report",
      candidate: parsedData?.name || "Candidate Profile",
      topCareer,
      matchScore: `${matchScore}%`,
      skillAlignment: `${skillMatchPercent}%`,
      matchedSkills: matchingSkills,
      missingSkills,
      predictions: predictionsList
    };

    let content = "";
    let mimeType = "";
    let fileName = `CareerCast_Report.${format}`;

    if (format === 'json') {
      content = JSON.stringify(reportData, null, 2);
      mimeType = 'application/json';
    } else if (format === 'md') {
      content = `# CareerCast AI - Skill Gap Report\n\n## Target Role: ${topCareer}\n- Match Score: ${matchScore}%\n- Skill Alignment: ${skillMatchPercent}%\n\n### Matched Skills\n${matchingSkills.map(s => `- ${s}`).join('\n')}\n\n### Missing Skills\n${missingSkills.map(s => `- ${s}`).join('\n')}\n`;
      mimeType = 'text/markdown';
    } else {
      content = `<html><body><h1>CareerCast AI Report</h1><h2>Role: ${topCareer}</h2><p>Match Score: ${matchScore}%</p><p>Skill Alignment: ${skillMatchPercent}%</p></body></html>`;
      mimeType = 'text/html';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
                    ⚡ SKILL GAP ANALYSIS REPORT
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
                  Skill Alignment: {skillMatchPercent}% ({matchingSkills.length}/{requiredSkills.length} Skills)
                </div>
              </div>

              {/* Progress bar */}
              <div style={{
                width: '100%',
                height: 14,
                background: 'rgba(255, 255, 255, 0.08)',
                borderRadius: 7,
                overflow: 'hidden',
                marginBottom: 28
              }}>
                <div style={{
                  height: '100%',
                  width: `${skillMatchPercent}%`,
                  background: 'linear-gradient(90deg, #10b981, #3b82f6)',
                  borderRadius: 7,
                  transition: 'width 0.8s ease'
                }} />
              </div>

              {/* Two Column Grid: Your Skills (Green Check) vs Missing for Role (Red Cross) */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, marginBottom: 28 }}>
                
                {/* Column 1: Your Skills */}
                <div style={{
                  padding: 22,
                  borderRadius: 12,
                  background: 'rgba(16, 185, 129, 0.06)',
                  border: '1px solid rgba(16, 185, 129, 0.25)'
                }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#34d399', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>✔</span> Your Skills ({matchingSkills.length})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {matchingSkills.length > 0 ? (
                      matchingSkills.map(skill => (
                        <div key={skill} style={{
                          padding: '10px 14px',
                          borderRadius: 8,
                          background: '#ffffff',
                          color: '#0f172a',
                          fontSize: 14,
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          border: '1px solid #cbd5e1'
                        }}>
                          <span style={{ color: '#16a34a', fontWeight: 'bold' }}>✔</span> {skill}
                        </div>
                      ))
                    ) : (
                      <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>No direct requirement matches found.</span>
                    )}
                  </div>
                </div>

                {/* Column 2: Missing for Target Role */}
                <div style={{
                  padding: 22,
                  borderRadius: 12,
                  background: 'rgba(239, 68, 68, 0.06)',
                  border: '1px solid rgba(239, 68, 68, 0.25)'
                }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#f87171', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>❌</span> Missing for {topCareer} ({missingSkills.length})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {missingSkills.length > 0 ? (
                      missingSkills.map(skill => (
                        <div key={skill} style={{
                          padding: '10px 14px',
                          borderRadius: 8,
                          background: '#ffffff',
                          color: '#0f172a',
                          fontSize: 14,
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          border: '1px solid #cbd5e1'
                        }}>
                          <span style={{ color: '#dc2626', fontWeight: 'bold' }}>❌</span> {skill}
                        </div>
                      ))
                    ) : (
                      <span style={{ fontSize: 13, color: '#34d399', fontWeight: 600 }}>🎉 Great job! Your profile meets all core skills.</span>
                    )}
                  </div>
                </div>

              </div>

              {/* Actionable Learning Roadmap Cards */}
              {missingSkills.length > 0 && (
                <div style={{ marginTop: 24 }}>
                  <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 14, color: '#818cf8' }}>
                    📚 Prioritized Learning Roadmap & Portfolio Projects:
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {missingSkills.map(skill => {
                      const guide = SKILL_LEARNING_GUIDES[skill] || { hours: 30, level: 'Intermediate', resource: `Official ${skill} Documentation`, project: `Develop hands-on project utilizing ${skill}` };
                      return (
                        <div key={skill} style={{
                          padding: 16,
                          borderRadius: 10,
                          background: 'rgba(30, 41, 59, 0.8)',
                          border: '1px solid rgba(255, 255, 255, 0.1)'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                            <span style={{ fontSize: 15, fontWeight: 700, color: '#fbbf24' }}>🔹 {skill}</span>
                            <span style={{ fontSize: 12, padding: '2px 8px', borderRadius: 4, background: 'rgba(99,102,241,0.2)', color: '#818cf8', fontWeight: 600 }}>
                              {guide.level} • {guide.hours} hrs
                            </span>
                          </div>
                          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>
                            <strong>Resource:</strong> {guide.resource}
                          </div>
                          <div style={{ fontSize: 13, color: '#6ee7b7' }}>
                            <strong>Suggested Project:</strong> {guide.project}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* REPORT EXPORT OPTIONS */}
            <div className="glass-card fade-in-up" style={{ padding: 24, marginBottom: 36, textAlign: 'center' }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 14 }}>📥 Export Skill Gap & Career Intelligence Report</h3>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap' }}>
                <button onClick={() => handleDownload('md')} className="btn-secondary" style={{ padding: '10px 20px', fontSize: 14 }}>
                  📄 Export Report (.MD)
                </button>
                <button onClick={() => handleDownload('json')} className="btn-secondary" style={{ padding: '10px 20px', fontSize: 14 }}>
                  📊 Export Report (.JSON)
                </button>
                <button onClick={() => handleDownload('html')} className="btn-secondary" style={{ padding: '10px 20px', fontSize: 14 }}>
                  🌐 Export Report (.HTML)
                </button>
              </div>
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
              <button onClick={() => navigate('/analytics')} className="btn-secondary" style={{ padding: '12px 24px' }}>
                📊 View Analytics & Model Registry
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
