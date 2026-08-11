// components/Navbar.jsx
// Top navigation bar shown after login.

import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleReset = () => {
    sessionStorage.removeItem('careercast_parsed_resume');
    sessionStorage.removeItem('careercast_active_analysis');
    localStorage.removeItem('careercast_parsed_resume');
    localStorage.removeItem('careercast_active_analysis');
    navigate('/upload');
  };

  const navLinks = [
    { path: '/dashboard', label: '📊 Dashboard' },
    { path: '/upload',    label: '📄 Upload Resume' },
    { path: '/profile',   label: '👤 Profile' },
    { path: '/results',   label: '🎯 AI Predictions' },
    { path: '/analytics', label: '📈 Analytics' },
  ];

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'rgba(10, 11, 16, 0.85)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(99,102,241,0.15)',
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 64,
      }}>
        {/* Logo */}
        <Link to="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 20,
            boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)'
          }}>
            🚀
          </div>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: 22,
            background: 'linear-gradient(135deg, #818cf8, #06b6d4)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            CareerCast
          </span>
        </Link>

        {/* Nav links */}
        <div style={{ display: 'flex', gap: 6 }}>
          {navLinks.map(({ path, label }) => (
            <Link
              key={path}
              to={path}
              style={{
                padding: '8px 14px',
                borderRadius: 'var(--radius-md)',
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: 600,
                color: location.pathname === path
                  ? 'var(--color-primary-light)'
                  : 'var(--text-secondary)',
                background: location.pathname === path
                  ? 'rgba(99,102,241,0.15)'
                  : 'transparent',
                border: location.pathname === path
                  ? '1px solid rgba(99,102,241,0.3)'
                  : '1px solid transparent',
                transition: 'all var(--transition-fast)',
              }}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* User + New Upload CTA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={handleReset}
            className="btn-secondary"
            style={{ padding: '8px 16px', fontSize: 13 }}
            id="reset-session-btn"
          >
            + New Upload
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
