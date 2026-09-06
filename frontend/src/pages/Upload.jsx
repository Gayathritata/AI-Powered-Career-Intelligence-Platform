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
    text: `SARAH CONNOR
sarah.connor@example.com | +1 (415) 555-0199 | San Francisco, CA
https://linkedin.com/in/sarah-connor-frontend | https://github.com/sarahconnor

SUMMARY
Creative and detail-oriented Frontend Engineer with over 4 years of experience crafting high-performance, accessible, and dynamic web applications. Specialized in modern React ecosystems, TypeScript, Tailwind CSS, state management, and web vital optimizations.

WORK EXPERIENCE
Senior Frontend Web Developer
Acme Tech Systems, San Francisco, CA | 2022 - Present
- Architected and built responsive web applications using React, Next.js, and TypeScript.
- Designed reusable UI component libraries with Tailwind CSS, reducing development cycle times by 30%.
- Optimized page load speeds and web vitals, raising Lighthouse performance scores from 72 to 98.

Software Engineering Intern
Innovate Labs, San Jose, CA | 2021 - 2022
- Developed interactive user interfaces using React, Redux Toolkit, and JavaScript (ES6+).
- Collaborated with UX designers to translate Figma mockups into accessible HTML5/CSS3 components.

TECHNICAL SKILLS
React, TypeScript, HTML5, CSS3, Tailwind CSS, Redux Toolkit, Next.js, JavaScript, Git, REST APIs

EDUCATION
B.S. Computer Science, University of California, Berkeley (2021)`,
    entities: [
      { text: 'Frontend Engineer', label: 'ROLE', start: 0, end: 17 },
      { text: 'San Francisco, CA', label: 'LOCATION', start: 62, end: 79 },
      { text: 'React', label: 'SKILL', start: 240, end: 245 },
      { text: 'TypeScript', label: 'SKILL', start: 257, end: 267 },
      { text: 'Tailwind CSS', label: 'SKILL', start: 269, end: 281 },
      { text: 'Senior Frontend Web Developer', label: 'ROLE', start: 350, end: 379 },
      { text: 'React', label: 'SKILL', start: 470, end: 475 },
      { text: 'Next.js', label: 'SKILL', start: 477, end: 484 },
      { text: 'TypeScript', label: 'SKILL', start: 490, end: 500 },
      { text: 'Software Engineering Intern', label: 'ROLE', start: 650, end: 677 },
      { text: 'B.S. Computer Science', label: 'EDUCATION', start: 900, end: 921 },
      { text: 'University of California, Berkeley', label: 'EDUCATION', start: 923, end: 957 }
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
    text: `ALEX RIVERA
alex.rivera@devstudio.io | +1 (206) 555-0144 | Seattle, WA
https://linkedin.com/in/alexrivera-dev | https://github.com/arivera-code

SUMMARY
Versatile Full Stack Web Developer with 5+ years of experience engineering scalable web applications, RESTful microservices, and database systems. Proficient across the entire stack, from React/Tailwind frontend interfaces to FastAPI/Python backend servers and PostgreSQL datastores.

WORK EXPERIENCE
Full Stack Web Developer
CloudScale Solutions, Seattle, WA | 2021 - Present
- Led full stack web application development from initial database architecture to AWS cloud deployment.
- Designed high-performance REST APIs with FastAPI, Python, Node.js, and PostgreSQL database schemas.
- Developed dynamic single-page applications using React, TypeScript, and Tailwind CSS.
- Containerized microservices using Docker and deployed with CI/CD pipelines on AWS EC2.

Full Stack Engineering Intern
DataTech Innovations, Seattle, WA | 2020 - 2021
- Assisted in building backend API endpoints and integrating frontend React UI views.
- Conducted database query optimization in PostgreSQL, improving response latency by 25%.

TECHNICAL SKILLS
React, Node.js, Python, FastAPI, PostgreSQL, Docker, AWS, Git, TypeScript, Tailwind CSS, Redis

EDUCATION
B.S. Computer Science, Stanford University (2020)`,
    entities: [
      { text: 'Full Stack Web Developer', label: 'ROLE', start: 0, end: 24 },
      { text: 'Seattle, WA', label: 'LOCATION', start: 60, end: 71 },
      { text: 'React', label: 'SKILL', start: 250, end: 255 },
      { text: 'FastAPI', label: 'SKILL', start: 280, end: 287 },
      { text: 'Python', label: 'SKILL', start: 288, end: 294 },
      { text: 'PostgreSQL', label: 'SKILL', start: 300, end: 310 },
      { text: 'Full Stack Web Developer', label: 'ROLE', start: 360, end: 384 },
      { text: 'FastAPI', label: 'SKILL', start: 490, end: 497 },
      { text: 'Node.js', label: 'SKILL', start: 507, end: 514 },
      { text: 'PostgreSQL', label: 'SKILL', start: 520, end: 530 },
      { text: 'Docker', label: 'SKILL', start: 660, end: 666 },
      { text: 'AWS', label: 'SKILL', start: 700, end: 703 },
      { text: 'B.S. Computer Science', label: 'EDUCATION', start: 940, end: 961 },
      { text: 'Stanford University', label: 'EDUCATION', start: 963, end: 982 }
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
    text: `JORDAN LEE
jordan.lee@backendcraft.com | +1 (512) 555-0188 | Austin, TX
https://linkedin.com/in/jordanlee-backend | https://github.com/jordanlee-dev

SUMMARY
High-performance Backend Engineer with deep domain knowledge in distributed systems, high-throughput microservices, API security, and database indexing. Expert in Python, FastAPI, Django, PostgreSQL, Redis, Docker, and Cloud infrastructure.

WORK EXPERIENCE
Senior Backend Software Engineer
ScaleVector Inc, Austin, TX | 2022 - Present
- Architected high-throughput backend APIs using Python, FastAPI, Uvicorn, and PostgreSQL.
- Engineered caching layers with Redis, reducing database load during peak traffic by 45%.
- Implemented microservice authentication using OAuth2, JWT tokens, and bcrypt security standards.

Backend Software Engineering Intern
Nexus Systems, Austin, TX | 2021 - 2022
- Developed REST API endpoints and written automated unit & integration test suites.
- Optimized complex SQL queries and index strategies in PostgreSQL.

TECHNICAL SKILLS
Python, FastAPI, Django, PostgreSQL, Redis, Docker, Kubernetes, AWS, SQL, REST APIs, Microservices, Git

EDUCATION
B.S. Computer Engineering, MIT (2021)`,
    entities: [
      { text: 'Backend Engineer', label: 'ROLE', start: 0, end: 16 },
      { text: 'Austin, TX', label: 'LOCATION', start: 60, end: 70 },
      { text: 'Python', label: 'SKILL', start: 230, end: 236 },
      { text: 'FastAPI', label: 'SKILL', start: 238, end: 245 },
      { text: 'Django', label: 'SKILL', start: 247, end: 253 },
      { text: 'PostgreSQL', label: 'SKILL', start: 255, end: 265 },
      { text: 'Redis', label: 'SKILL', start: 267, end: 272 },
      { text: 'Senior Backend Software Engineer', label: 'ROLE', start: 330, end: 362 },
      { text: 'FastAPI', label: 'SKILL', start: 450, end: 457 },
      { text: 'Redis', label: 'SKILL', start: 520, end: 525 },
      { text: 'PostgreSQL', label: 'SKILL', start: 570, end: 580 },
      { text: 'B.S. Computer Engineering', label: 'EDUCATION', start: 900, end: 925 },
      { text: 'MIT', label: 'EDUCATION', start: 927, end: 930 }
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
  
  // Stores the active analysis output data (starts clean as null until upload)
  const [analysisResult, setAnalysisResult] = useState(null);

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
          'Content-Type': undefined,
        },
      });

      if (res.data) {
        const resultData = {
          text: res.data.text,
          entities: res.data.entities || [],
          modelName: res.data.model_name || 'XGBoost Ensemble Model',
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
      if (file.name.toLowerCase().endsWith('.txt')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const textContent = e.target.result || '';
          parseTextAndPredict(textContent, file.name);
        };
        reader.readAsText(file);
      } else {
        if ((err.code === 'ECONNABORTED' || err.message?.includes('timeout')) && !file._isRetry) {
          console.log('[Upload] Server cold start detected. Retrying request now that server is awake...');
          file._isRetry = true;
          return await uploadFileToApi(file);
        }
        const backendDetail = err.response?.data?.detail;
        const msg = backendDetail
          ? (typeof backendDetail === 'string' ? backendDetail : JSON.stringify(backendDetail))
          : (err.message || 'Failed to extract resume text. Please ensure the backend server is running and upload a valid PDF, DOCX, or TXT file.');
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
          modelName: res.data.model_name || 'XGBoost Ensemble Model',
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
      modelName: 'XGBoost Ensemble Model',
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
          <p style={{ color: 'var(--text-secondary)', fontSize: 15, maxWidth: 680, margin: '0 auto' }}>
            Upload your resume to extract SpaCy NER entities (Skills, Roles, Education) and run our Multi-Model AI Ensemble (XGBoost, Random Forest, Logistic Regression & SBERT) to view live accuracy and role predictions on screen.
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
