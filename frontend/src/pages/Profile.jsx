// pages/Profile.jsx
// Displays & allows editing of candidate profile details extracted from resume (Name, Title, Contact, Location, Socials, Summary, Skills, Work Experience, Projects, Education).

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const Profile = () => {
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState(() => {
    const saved = sessionStorage.getItem('careercast_parsed_resume');
    return saved ? JSON.parse(saved) : null;
  });

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(() => profileData || {});
  const [newSkill, setNewSkill] = useState('');

  if (!profileData) {
    return (
      <>
        <Navbar />
        <div className="bg-mesh" />
        <main className="container" style={{ paddingTop: 48, paddingBottom: 60 }}>
          <div className="glass-card fade-in-up" style={{ maxWidth: 540, margin: '0 auto', padding: 48, textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📄</div>
            <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 10 }}>No Resume Uploaded Yet</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
              Upload your resume to see your automatically generated candidate profile here.
            </p>
            <button onClick={() => navigate('/upload')} className="btn-primary">
              🚀 Upload Resume Now
            </button>
          </div>
        </main>
      </>
    );
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (!newSkill.trim()) return;
    if (!formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
    }
    setNewSkill('');
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skillToRemove)
    }));
  };

  const handleSaveProfile = () => {
    setProfileData(formData);
    sessionStorage.setItem('careercast_parsed_resume', JSON.stringify(formData));
    setIsEditing(false);
  };

  return (
    <>
      <Navbar />
      <div className="bg-mesh" />

      <main className="container" style={{ paddingTop: 48, paddingBottom: 60 }}>
        {/* Header Title */}
        <div className="fade-in-up" style={{ textAlign: 'center', marginBottom: 36 }}>
          <div className="badge badge-primary" style={{ marginBottom: 12 }}>
            <span>👤</span> Extracted Candidate Profile
          </div>
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800, marginBottom: 10 }}>
            Candidate <span className="gradient-text">Profile Details</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 16 }}>
            Complete profile extracted from your resume: contact info, summary, skills, experience, and education.
          </p>
        </div>

        <div style={{ maxWidth: 940, margin: '0 auto' }}>
          
          {/* TOP CARD: Name, Title, Contact & Actions */}
          <div className="glass-card fade-in-up" style={{ padding: 36, marginBottom: 28, borderColor: 'rgba(99, 102, 241, 0.35)' }}>
            
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 24,
              paddingBottom: 24,
              marginBottom: 24,
              borderBottom: '1px solid var(--border-subtle)',
            }}>
              
              <div style={{ flex: '1 1 340px' }}>
                {isEditing ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>FULL NAME</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name || ''}
                        onChange={handleInputChange}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontSize: 20, fontWeight: 800 }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>PROFESSIONAL TITLE</label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title || ''}
                        onChange={handleInputChange}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.2)', color: '#60a5fa', fontSize: 15, fontWeight: 700 }}
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <h2 style={{ fontSize: 'clamp(26px, 3vw, 34px)', fontWeight: 900, marginBottom: 6 }}>{profileData.name}</h2>
                    <div style={{ fontSize: 18, color: '#60a5fa', fontWeight: 700, marginBottom: 12 }}>
                      {profileData.title || profileData.predictedCareer}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span className="badge badge-primary" style={{ padding: '6px 14px' }}>
                        🎯 AI Predicted Role: {profileData.predictedCareer}
                      </span>
                      <span style={{ fontSize: 13, background: 'rgba(16, 185, 129, 0.15)', color: '#6ee7b7', padding: '4px 12px', borderRadius: 12, border: '1px solid rgba(16, 185, 129, 0.3)', fontWeight: 700 }}>
                        {profileData.matchScore}% AI Match
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {isEditing ? (
                  <>
                    <button onClick={handleSaveProfile} className="btn-primary" style={{ padding: '10px 20px' }}>
                      💾 Save All Profile Changes
                    </button>
                    <button onClick={() => { setFormData(profileData); setIsEditing(false); }} className="btn-ghost" style={{ padding: '10px 18px' }}>
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => setIsEditing(true)} className="btn-secondary" style={{ padding: '10px 18px' }}>
                      ✏️ Edit Profile Details
                    </button>
                    <button onClick={() => navigate('/results')} className="btn-primary" style={{ padding: '10px 20px' }}>
                      🎯 View AI Recommendations
                    </button>
                  </>
                )}
              </div>

            </div>

            {/* CONTACT DETAILS & SOCIAL LINKS GRID */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              
              <div style={{ padding: 14, borderRadius: 10, background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, marginBottom: 4 }}>EMAIL ADDRESS</div>
                {isEditing ? (
                  <input type="email" name="email" value={formData.email || ''} onChange={handleInputChange} style={{ width: '100%', padding: 6, borderRadius: 6, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontSize: 13 }} />
                ) : (
                  <div style={{ fontWeight: 600, fontSize: 14, color: '#fff' }}>✉️ {profileData.email}</div>
                )}
              </div>

              <div style={{ padding: 14, borderRadius: 10, background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, marginBottom: 4 }}>PHONE NUMBER</div>
                {isEditing ? (
                  <input type="text" name="phone" value={formData.phone || ''} onChange={handleInputChange} style={{ width: '100%', padding: 6, borderRadius: 6, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontSize: 13 }} />
                ) : (
                  <div style={{ fontWeight: 600, fontSize: 14, color: '#fff' }}>📞 {profileData.phone}</div>
                )}
              </div>

              <div style={{ padding: 14, borderRadius: 10, background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, marginBottom: 4 }}>LOCATION</div>
                {isEditing ? (
                  <input type="text" name="location" value={formData.location || ''} onChange={handleInputChange} style={{ width: '100%', padding: 6, borderRadius: 6, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontSize: 13 }} />
                ) : (
                  <div style={{ fontWeight: 600, fontSize: 14, color: '#fff' }}>📍 {profileData.location || 'San Francisco, CA'}</div>
                )}
              </div>

              <div style={{ padding: 14, borderRadius: 10, background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, marginBottom: 4 }}>PORTFOLIO / SOCIAL LINKS</div>
                <div style={{ fontSize: 13, display: 'flex', gap: 10 }}>
                  <a href={profileData.linkedin || '#'} target="_blank" rel="noreferrer" style={{ color: '#60a5fa', textDecoration: 'none', fontWeight: 600 }}>LinkedIn ↗</a>
                  <a href={profileData.github || '#'} target="_blank" rel="noreferrer" style={{ color: '#60a5fa', textDecoration: 'none', fontWeight: 600 }}>GitHub ↗</a>
                </div>
              </div>

            </div>

          </div>

          {/* PROFESSIONAL SUMMARY CARD */}
          <div className="glass-card fade-in-up" style={{ padding: 32, marginBottom: 28 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 12, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              📄 Extracted Professional Summary
            </h3>
            {isEditing ? (
              <textarea
                name="summary"
                rows={4}
                value={formData.summary || ''}
                onChange={handleInputChange}
                style={{ width: '100%', padding: 12, borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontSize: 14, lineHeight: 1.6 }}
              />
            ) : (
              <p style={{ color: 'var(--text-primary)', lineHeight: 1.7, fontSize: 15, background: 'rgba(255, 255, 255, 0.02)', padding: 18, borderRadius: 10, margin: 0 }}>
                {profileData.summary}
              </p>
            )}
          </div>

          {/* EXTRACTED TECHNICAL SKILLS CARD */}
          <div className="glass-card fade-in-up" style={{ padding: 32, marginBottom: 28 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 14, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              ⚡ Extracted Technical Skills ({(isEditing ? formData.skills : profileData.skills).length})
            </h3>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {(isEditing ? formData.skills : profileData.skills).map((skill) => (
                <span key={skill} className="badge badge-primary" style={{ padding: '8px 16px', fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  {skill}
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontWeight: 800, fontSize: 14, padding: 0 }}
                    >
                      ×
                    </button>
                  )}
                </span>
              ))}
            </div>

            {isEditing && (
              <form onSubmit={handleAddSkill} style={{ display: 'flex', gap: 10, maxWidth: 360, marginTop: 16 }}>
                <input
                  type="text"
                  placeholder="Add new technical skill..."
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  style={{ flex: 1, padding: '8px 12px', borderRadius: 6, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontSize: 13 }}
                />
                <button type="submit" className="btn-secondary" style={{ padding: '8px 14px', fontSize: 13 }}>
                  + Add Skill
                </button>
              </form>
            )}
          </div>

          {/* WORK EXPERIENCE HISTORY CARD */}
          <div className="glass-card fade-in-up" style={{ padding: 32, marginBottom: 28 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 18, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              💼 Work Experience History
            </h3>

            {profileData.experience && profileData.experience.length > 0 ? (
              profileData.experience.map((exp, idx) => (
                <div key={idx} style={{
                  padding: 20,
                  borderRadius: 12,
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderLeft: '4px solid var(--color-primary)',
                  marginBottom: 16,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 6 }}>
                    <h4 style={{ fontWeight: 800, fontSize: 18, color: '#fff' }}>{exp.title}</h4>
                    <span style={{ fontSize: 13, color: 'var(--color-primary-light)', fontWeight: 700 }}>{exp.duration}</span>
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: 14, fontWeight: 600, marginBottom: 12 }}>
                    🏢 {exp.company}
                  </div>
                  {exp.details && exp.details.length > 0 && (
                    <ul style={{ margin: 0, paddingLeft: 20, color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6 }}>
                      {exp.details.map((bullet, bulletIdx) => (
                        <li key={bulletIdx}>{bullet}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>No work experience entries extracted from resume.</p>
            )}
          </div>

          {/* KEY PROJECTS CARD */}
          {profileData.projects && profileData.projects.length > 0 && (
            <div className="glass-card fade-in-up" style={{ padding: 32, marginBottom: 28 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 18, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                🚀 Highlighted Projects
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                {profileData.projects.map((proj, idx) => (
                  <div key={idx} style={{ padding: 18, borderRadius: 10, background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 4, color: '#fff' }}>{proj.name}</div>
                    <div style={{ fontSize: 12, color: '#60a5fa', fontWeight: 600, marginBottom: 8 }}>Tech Stack: {proj.techStack}</div>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>{proj.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* EDUCATION & CREDENTIALS CARD */}
          <div className="glass-card fade-in-up" style={{ padding: 32 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 12, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              🎓 Education & Credentials
            </h3>
            <p style={{ fontSize: 16, fontWeight: 700, color: '#fff', margin: 0 }}>
              {profileData.education}
            </p>
          </div>

        </div>
      </main>
    </>
  );
};

export default Profile;
