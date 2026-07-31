// pages/Register.jsx
// Premium registration page with real-time password strength indicator.

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import useForm from '../hooks/useForm';

// ── Validation ─────────────────────────────────────────────────────────────
const validate = (values) => {
  const errors = {};

  if (!values.name) {
    errors.name = 'Full name is required.';
  } else if (values.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters.';
  }

  if (!values.email) {
    errors.email = 'Email is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = 'Enter a valid email address.';
  }

  if (!values.password) {
    errors.password = 'Password is required.';
  } else if (values.password.length < 8) {
    errors.password = 'Password must be at least 8 characters.';
  } else if (!/[A-Z]/.test(values.password)) {
    errors.password = 'Must contain at least one uppercase letter.';
  } else if (!/[a-z]/.test(values.password)) {
    errors.password = 'Must contain at least one lowercase letter.';
  } else if (!/\d/.test(values.password)) {
    errors.password = 'Must contain at least one number.';
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password.';
  } else if (values.password !== values.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match.';
  }

  return errors;
};

// ── Password strength helper ────────────────────────────────────────────────
const getPasswordStrength = (password) => {
  if (!password) return { score: 0, label: '', color: 'transparent' };
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z\d]/.test(password)) score++;

  const levels = [
    { label: 'Very Weak', color: '#ef4444' },
    { label: 'Weak',      color: '#f97316' },
    { label: 'Fair',      color: '#eab308' },
    { label: 'Strong',    color: '#22c55e' },
    { label: 'Very Strong', color: '#06b6d4' },
  ];
  return { score, ...levels[Math.min(score - 1, 4)] };
};

// ── Component ──────────────────────────────────────────────────────────────
const Register = () => {
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const [apiError, setApiError]   = useState('');
  const [success, setSuccess]     = useState(false);
  const [showPwd, setShowPwd]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { values, errors, touched, handleChange, handleBlur, validateAll } = useForm(
    { name: '', email: '', password: '', confirmPassword: '' },
    validate
  );

  const strength = getPasswordStrength(values.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    if (!validateAll()) return;

    const result = await register({
      name: values.name,
      email: values.email,
      password: values.password,
    });

    if (result.success) {
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } else {
      setApiError(result.message);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      position: 'relative',
    }}>
      <div className="bg-mesh" />

      {/* Orbs */}
      <div style={{
        position: 'fixed', top: '20%', right: '8%',
        width: 350, height: 350, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'fixed', bottom: '10%', left: '5%',
        width: 280, height: 280, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Card */}
      <div className="glass-card fade-in-up" style={{
        width: '100%',
        maxWidth: 500,
        padding: '48px 40px',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 26,
            margin: '0 auto 20px',
            boxShadow: '0 8px 24px rgba(99,102,241,0.4)',
          }}>
            ✨
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>
            Create your account
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>
            Start your AI-powered career journey with{' '}
            <span className="gradient-text" style={{ fontWeight: 600 }}>
              CareerCast
            </span>
          </p>
        </div>

        {/* Success */}
        {success && (
          <div className="alert alert-success" style={{ marginBottom: 20 }}>
            <span>✅</span>
            <span>Account created! Redirecting to login...</span>
          </div>
        )}

        {/* API Error */}
        {apiError && (
          <div className="alert alert-error" style={{ marginBottom: 20 }}>
            <span>⚠️</span>
            <span>{apiError}</span>
          </div>
        )}

        {/* Form */}
        {!success && (
          <form onSubmit={handleSubmit} noValidate>
            {/* Full Name */}
            <div className="form-group">
              <label className="input-label" htmlFor="reg-name">Full Name</label>
              <input
                id="reg-name"
                name="name"
                type="text"
                autoComplete="name"
                className={`input-field ${touched.name && errors.name ? 'error' : ''}`}
                placeholder="John Doe"
                value={values.name}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {touched.name && errors.name && (
                <span className="error-text">{errors.name}</span>
              )}
            </div>

            {/* Email */}
            <div className="form-group">
              <label className="input-label" htmlFor="reg-email">Email Address</label>
              <input
                id="reg-email"
                name="email"
                type="email"
                autoComplete="email"
                className={`input-field ${touched.email && errors.email ? 'error' : ''}`}
                placeholder="you@example.com"
                value={values.email}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {touched.email && errors.email && (
                <span className="error-text">{errors.email}</span>
              )}
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="input-label" htmlFor="reg-password">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="reg-password"
                  name="password"
                  type={showPwd ? 'text' : 'password'}
                  autoComplete="new-password"
                  className={`input-field ${touched.password && errors.password ? 'error' : ''}`}
                  placeholder="Min 8 chars, upper, lower, digit"
                  value={values.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  style={{ paddingRight: 44 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((s) => !s)}
                  id="toggle-pwd-visibility"
                  style={{
                    position: 'absolute', right: 12, top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--text-muted)', fontSize: 16, padding: 4,
                  }}
                >
                  {showPwd ? '🙈' : '👁️'}
                </button>
              </div>
              {touched.password && errors.password && (
                <span className="error-text">{errors.password}</span>
              )}

              {/* Password strength bar */}
              {values.password && (
                <div style={{ marginTop: 8 }}>
                  <div style={{
                    height: 4, borderRadius: 99,
                    background: 'var(--border-subtle)',
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${(strength.score / 5) * 100}%`,
                      background: strength.color,
                      transition: 'width 0.3s ease, background 0.3s ease',
                      borderRadius: 99,
                    }} />
                  </div>
                  <span style={{ fontSize: 11, color: strength.color, marginTop: 4, display: 'block' }}>
                    {strength.label}
                  </span>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="form-group">
              <label className="input-label" htmlFor="reg-confirm-password">Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="reg-confirm-password"
                  name="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  autoComplete="new-password"
                  className={`input-field ${touched.confirmPassword && errors.confirmPassword ? 'error' : ''}`}
                  placeholder="••••••••"
                  value={values.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  style={{ paddingRight: 44 }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((s) => !s)}
                  id="toggle-confirm-visibility"
                  style={{
                    position: 'absolute', right: 12, top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--text-muted)', fontSize: 16, padding: 4,
                  }}
                >
                  {showConfirm ? '🙈' : '👁️'}
                </button>
              </div>
              {touched.confirmPassword && errors.confirmPassword && (
                <span className="error-text">{errors.confirmPassword}</span>
              )}
            </div>

            {/* Submit */}
            <button
              id="register-submit-btn"
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ width: '100%', marginTop: 8, padding: '14px', fontSize: 16 }}
            >
              {loading ? (
                <>
                  <span className="spinner" />
                  Creating account...
                </>
              ) : (
                'Create Account →'
              )}
            </button>
          </form>
        )}

        {/* Login link */}
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: 14, marginTop: 24 }}>
          Already have an account?{' '}
          <Link
            to="/login"
            id="login-link"
            style={{ color: 'var(--color-primary-light)', fontWeight: 600, textDecoration: 'none' }}
          >
            Sign in →
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
