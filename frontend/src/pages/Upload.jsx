// pages/Upload.jsx
// Interactive Resume Upload workspace with drag & drop, sample resumes, SpaCy NER entity highlighting, and Logistic Regression model prediction results.

import React, { useState, useRef } from 'react';
import Navbar from '../components/Navbar';
import ResumeAnalysisResult from '../components/ResumeAnalysisResult';
import api from '../services/api';
import { parseFullResumeDetails } from '../utils/resumeParserHelper';

const SAMPLE_RESUMES = [
  {
    role: 'Frontend Engineer',
    icon: '⚡',
    filename: 'sarah_frontend_engineer.pdf',
    text: `Frontend Engineer specializing in React, TypeScript, HTML5, CSS3, Tailwind CSS, Redux Toolkit, and Web Performance Optimization.

Frontend Web Developer
- Built responsive single-page web applications using React, Next.js, and TypeScript.
- Designed reusable UI component libraries with Tailwind CSS and CSS Modules.
- Optimized web application page load speed, state management, and accessibility (a11y).

Education: B.S. Computer Science, University of California, Berkeley.`,
    entities: [
      { text: 'Frontend Engineer', label: 'ROLE', start: 0, end: 17 },
      { text: 'React', label: 'SKILL', start: 34, end: 39 },
      { text: 'TypeScript', label: 'SKILL', start: 41, end: 51 },
      { text: 'HTML5', label: 'SKILL', start: 53, end: 58 },
      { text: 'CSS3', label: 'SKILL', start: 60, end: 64 },
      { text: 'Tailwind CSS', label: 'SKILL', start: 66, end: 78 },
      { text: 'Redux Toolkit', label: 'SKILL', start: 80, end: 93 },
      { text: 'Frontend Web Developer', label: 'ROLE', start: 135, end: 157 },
      { text: 'React', label: 'SKILL', start: 215, end: 220 },
      { text: 'Next.js', label: 'SKILL', start: 222, end: 229 },
      { text: 'TypeScript', label: 'SKILL', start: 235, end: 245 },
      { text: 'Tailwind CSS', label: 'SKILL', start: 301, end: 313 },
      { text: 'B.S. Computer Science', label: 'EDUCATION', start: 405, end: 426 },
      { text: 'University of California, Berkeley', label: 'EDUCATION', start: 428, end: 462 }
    ],
    predictions: [
      { career: 'Frontend Engineer', confidence: 94.6 },
      { career: 'Web Developer', confidence: 87.2 },
      { career: 'Full Stack Web Developer', confidence: 81.4 },
      { career: 'Software Engineer', confidence: 75.8 }
    ],
    top1Accuracy: 94.6
  },
  {
    role: 'Full Stack Web Developer',
    icon: '💻',
    filename: 'alex_fullstack_dev.pdf',
    text: `Experienced Full Stack Web Developer with expertise in React, Node.js, Python, FastAPI, PostgreSQL, Docker, AWS, and Git.

Full Stack Web Developer
- Led full stack web application development from architecture to production deployment.
- Designed REST APIs with FastAPI, Node.js, and PostgreSQL database schemas.
- Developed interactive frontend user interfaces using React and Tailwind CSS.
- Containerized microservices using Docker and deployed on AWS EC2.

Education: B.S. Computer Science, Stanford University (2021).`,
    entities: [
      { text: 'Full Stack Web Developer', label: 'ROLE', start: 12, end: 36 },
      { text: 'React', label: 'SKILL', start: 57, end: 62 },
      { text: 'Node.js', label: 'SKILL', start: 64, end: 71 },
      { text: 'Python', label: 'SKILL', start: 73, end: 79 },
      { text: 'FastAPI', label: 'SKILL', start: 81, end: 88 },
      { text: 'PostgreSQL', label: 'SKILL', start: 90, end: 100 },
      { text: 'Docker', label: 'SKILL', start: 102, end: 108 },
      { text: 'AWS', label: 'SKILL', start: 110, end: 113 },
      { text: 'Full Stack Web Developer', label: 'ROLE', start: 125, end: 149 },
      { text: 'FastAPI', label: 'SKILL', start: 247, end: 254 },
      { text: 'Node.js', label: 'SKILL', start: 256, end: 263 },
      { text: 'PostgreSQL', label: 'SKILL', start: 269, end: 279 },
      { text: 'React', label: 'SKILL', start: 357, end: 362 },
      { text: 'Tailwind CSS', label: 'SKILL', start: 367, end: 379 },
      { text: 'Docker', label: 'SKILL', start: 426, end: 432 },
      { text: 'AWS', label: 'SKILL', start: 449, end: 452 },
      { text: 'B.S. Computer Science', label: 'EDUCATION', start: 477, end: 498 },
      { text: 'Stanford University', label: 'EDUCATION', start: 500, end: 519 }
    ],
    predictions: [
      { career: 'Full Stack Web Developer', confidence: 95.8 },
      { career: 'Frontend Engineer', confidence: 88.4 },
      { career: 'Backend Engineer', confidence: 86.2 },
      { career: 'Software Engineer', confidence: 79.5 }
    ],
    top1Accuracy: 95.8
  },
  {
    role: 'Backend Engineer',
    icon: '⚙️',
    filename: 'jordan_backend_engineer.pdf',
    text: `Backend Engineer specializing in Python, FastAPI, Django, PostgreSQL, Redis, Microservices Architecture, and REST API Security.

Backend Software Developer
- Architected high-throughput backend APIs using FastAPI, Uvicorn, and SQL databases.
- Engineered caching layers with Redis and optimized SQL query performance.
- Built authentication services using OAuth2, JWT tokens, and password hashing.

Education: B.S. Computer Engineering, MIT.`,
    entities: [
      { text: 'Backend Engineer', label: 'ROLE', start: 0, end: 16 },
      { text: 'Python', label: 'SKILL', start: 33, end: 39 },
      { text: 'FastAPI', label: 'SKILL', start: 41, end: 48 },
      { text: 'Django', label: 'SKILL', start: 50, end: 56 },
      { text: 'PostgreSQL', label: 'SKILL', start: 58, end: 68 },
      { text: 'Redis', label: 'SKILL', start: 70, end: 75 },
      { text: 'Microservices', label: 'SKILL', start: 77, end: 90 },
      { text: 'Backend Software Developer', label: 'ROLE', start: 125, end: 151 },
      { text: 'FastAPI', label: 'SKILL', start: 209, end: 216 },
      { text: 'Redis', label: 'SKILL', start: 288, end: 293 },
      { text: 'SQL', label: 'SKILL', start: 312, end: 315 },
      { text: 'B.S. Computer Engineering', label: 'EDUCATION', start: 417, end: 442 },
      { text: 'MIT', label: 'EDUCATION', start: 444, end: 447 }
    ],
    predictions: [
      { career: 'Backend Engineer', confidence: 93.4 },
      { career: 'Full Stack Web Developer', confidence: 85.7 },
      { career: 'DevOps & Cloud Engineer', confidence: 78.9 },
      { career: 'Software Engineer', confidence: 72.4 }
    ],
    top1Accuracy: 93.4
  }
];

const Upload = () => {
  const fileInputRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Stores the active analysis output data (null by default so page starts clean until upload)
  const [analysisResult, setAnalysisResult] = useState(() => {
    const saved = sessionStorage.getItem('careercast_active_analysis');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.text && parsed.predictions) {
          return parsed;
        }
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadFileToApi(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      uploadFileToApi(e.target.files[0]);
    }
  };

  const clearAnalysis = () => {
    setSelectedFile(null);
    setAnalysisResult(null);
    setErrorMessage('');
    sessionStorage.removeItem('careercast_active_analysis');
    sessionStorage.removeItem('careercast_parsed_resume');
    localStorage.removeItem('careercast_active_analysis');
    localStorage.removeItem('careercast_parsed_resume');
  };

  const saveParsedProfile = (text, entities, predictions, filename) => {
    const parsedProfile = parseFullResumeDetails(text, entities, predictions, filename);
    sessionStorage.setItem('careercast_parsed_resume', JSON.stringify(parsedProfile));
    return parsedProfile;
  };

  const uploadFileToApi = async (file) => {
    setSelectedFile(file);
    setIsLoading(true);
    setErrorMessage('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await api.post('/recommendation/upload-resume', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.data) {
        const resultData = {
          text: res.data.text,
          entities: res.data.entities || [],
          modelName: res.data.model_name || 'Logistic Regression Model',
          top1Accuracy: res.data.top1_accuracy || res.data.confidence,
          predictions: res.data.predictions || []
        };
        setAnalysisResult(resultData);
        sessionStorage.setItem('careercast_active_analysis', JSON.stringify(resultData));
        saveParsedProfile(resultData.text, resultData.entities, resultData.predictions, file.name);
      }
    } catch (err) {
      console.warn('Backend API error or connection failure:', err);
      // For plain text files, fallback to text reader + predict endpoint
      if (file.name.endsWith('.txt')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const textContent = e.target.result || '';
          parseTextAndPredict(textContent, file.name);
        };
        reader.readAsText(file);
      } else {
        const msg = err.response?.data?.detail || 'Failed to extract resume text. Please ensure the backend server is running and upload a valid PDF, DOCX, or TXT file.';
        setErrorMessage(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const parseTextAndPredict = async (rawText, fileName) => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const res = await api.post('/recommendation/predict', { text: rawText, top_n: 5 });
      if (res.data) {
        const resultData = {
          text: res.data.text,
          entities: res.data.entities || [],
          modelName: res.data.model_name || 'Logistic Regression Model',
          top1Accuracy: res.data.top1_accuracy || res.data.confidence,
          predictions: res.data.predictions || []
        };
        setAnalysisResult(resultData);
        sessionStorage.setItem('careercast_active_analysis', JSON.stringify(resultData));
        saveParsedProfile(resultData.text, resultData.entities, resultData.predictions, fileName);
      }
    } catch (e) {
      setErrorMessage('Failed to connect to ML prediction service. Please ensure the backend server is running.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadSampleResume = (sample) => {
    setSelectedFile({ name: sample.filename });
    const resultData = {
      text: sample.text,
      entities: sample.entities,
      modelName: 'Logistic Regression Model',
      top1Accuracy: sample.top1Accuracy,
      predictions: sample.predictions
    };
    setAnalysisResult(resultData);
    sessionStorage.setItem('careercast_active_analysis', JSON.stringify(resultData));
    saveParsedProfile(sample.text, sample.entities, sample.predictions, sample.filename);
  };

  return (
    <>
      <Navbar />
      <div className="bg-mesh" />

      <main className="container" style={{ paddingTop: 32, paddingBottom: 60 }}>
        {/* Title & Header */}
        <div className="fade-in-up" style={{ textAlign: 'center', marginBottom: 32 }}>
          <div className="badge badge-primary" style={{ marginBottom: 12 }}>
            <span>⚡</span> Real-Time Resume Parsing & Prediction
          </div>
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, marginBottom: 8 }}>
            Upload Resume for <span className="gradient-text">Instant Output</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 15, maxWidth: 650, margin: '0 auto' }}>
            Upload your resume to extract SpaCy NER entities (Skills, Roles, Education) and run the Logistic Regression Model to view live accuracy and role predictions on screen.
          </p>
        </div>

        {/* Dropzone & Sample selection */}
        <div style={{ maxWidth: 1000, margin: '0 auto 36px' }}>
          <div
            className={`dropzone ${isDragging ? 'active' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{ padding: '36px 20px', marginBottom: 24 }}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept=".pdf,.docx,.doc,.txt"
              style={{ display: 'none' }}
            />

            <div style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: 'rgba(99, 102, 241, 0.15)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 28,
              margin: '0 auto 16px',
            }}>
              📤
            </div>

            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>
              {selectedFile ? `Uploaded: ${selectedFile.name}` : 'Click or Drag & Drop your resume file here'}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 16 }}>
              Supports PDF, DOCX, and TXT files
            </p>

            <button type="button" className="btn-primary" style={{ padding: '8px 22px', fontSize: 14 }} disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="spinner" style={{ width: 14, height: 14 }} />
                  Processing...
                </>
              ) : (
                'Select Resume File'
              )}
            </button>

            {analysisResult && (
              <div style={{ marginTop: 14 }}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearAnalysis();
                  }}
                  style={{
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#f87171',
                    borderRadius: 8,
                    padding: '6px 14px',
                    fontSize: 13,
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  🗑️ Clear Output & Upload Another Resume
                </button>
              </div>
            )}
          </div>

          {/* Quick Sample Presets */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Or Select a Sample Resume Preset:
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: 14,
            }}>
              {SAMPLE_RESUMES.map((sample) => (
                <div
                  key={sample.role}
                  className="glass-card"
                  onClick={() => loadSampleResume(sample)}
                  style={{
                    padding: '16px 20px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                  }}
                >
                  <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: 'rgba(99,102,241,0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 20,
                  }}>
                    {sample.icon}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>
                      {sample.role}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {sample.filename}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {errorMessage && (
          <div style={{
            maxWidth: 1000,
            margin: '0 auto 20px',
            padding: 16,
            borderRadius: 12,
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#f87171',
            fontSize: 14,
            textAlign: 'center'
          }}>
            {errorMessage}
          </div>
        )}

        {/* Dynamic Analysis Output Screen Component (Exact matching layout from User Screenshot) */}
        {analysisResult && (
          <ResumeAnalysisResult data={analysisResult} />
        )}
      </main>
    </>
  );
};

export default Upload;
