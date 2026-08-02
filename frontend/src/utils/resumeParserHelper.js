// utils/resumeParserHelper.js
// Utility to extract dynamic candidate profile details (Name, Title, Contact, Location, Socials, Summary, Skills, Experience, Education, Projects) directly from resume text & entities without hardcoded static defaults.

export const parseFullResumeDetails = (text = '', entities = [], predictions = [], filename = '') => {
  const rawText = text || '';
  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);

  // 1. Candidate Name Extraction
  let candidateName = '';
  if (lines.length > 0) {
    const firstLine = lines[0].replace(/resume|cv|curriculum|vitae/gi, '').trim();
    if (/^[A-Za-z\s.-]{3,50}$/.test(firstLine) && !/\b(engineer|developer|scientist|manager|analyst|skills|experience|education|summary|contact|profile)\b/i.test(firstLine)) {
      candidateName = firstLine.toUpperCase();
    }
  }

  if (!candidateName && filename) {
    candidateName = filename.replace(/\.(pdf|docx|txt)$/i, '').replace(/_/g, ' ').replace(/[-]/g, ' ').toUpperCase();
  }
  if (!candidateName) candidateName = 'CANDIDATE PROFILE';

  // 2. Email & Phone Extraction
  const emailMatch = rawText.match(/[\w.-]+@[\w.-]+\.\w+/i);
  const email = emailMatch ? emailMatch[0] : 'Not specified in resume';

  const phoneMatch = rawText.match(/(?:\+?\d{1,3}[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}|\+?\d{10,12}/);
  const phone = phoneMatch ? phoneMatch[0] : 'Not specified in resume';

  // 3. Candidate Location Extraction
  const location = extractCandidateLocation(rawText, lines);

  // 5. Predicted Role / Title
  const roleEntities = entities.filter(e => e.label === 'ROLE').map(e => e.text);
  const topPredictedRole = predictions && predictions[0] ? predictions[0].career : (roleEntities[0] || 'Professional / Candidate');

  // 6. Technical & Core Skills Extraction
  const skillEntities = entities.filter(e => e.label === 'SKILL').map(e => e.text);
  const regexSkills = extractSkillsFromRawText(rawText);
  const allSkills = Array.from(new Set([...skillEntities, ...regexSkills]));

  // 7. Whole Professional Summary Extraction
  const summary = extractWholeProfessionalSummary(rawText, lines);

  // 8. Work Experience & Internships Extraction
  const { experiences, experienceHeading } = extractExperienceAndInternships(rawText, roleEntities, topPredictedRole);

  // 9. Education Extraction
  const education = extractEducationDetails(rawText, entities);

  // 10. Projects Extraction
  const projects = extractProjectsDetails(rawText, allSkills);

  return {
    name: candidateName,
    title: topPredictedRole,
    predictedCareer: topPredictedRole,
    matchScore: predictions && predictions[0] ? predictions[0].confidence : 0,
    email,
    phone,
    location,
    summary,
    skills: allSkills,
    experience: experiences,
    experienceHeading: experienceHeading || 'Work Experience',
    education,
    projects,
    predictions: predictions || []
  };
};


/**
 * Extract Candidate Location dynamically from resume text
 */
const extractCandidateLocation = (text, lines) => {
  // Check explicit location prefixes
  const explicitLocMatch = text.match(/(?:location|address|residence|city|based in)[\s:-]+([A-Z][a-zA-Z\s,.-]+(?:\d{5}|\b))/i);
  if (explicitLocMatch && explicitLocMatch[1] && explicitLocMatch[1].length < 60) {
    return explicitLocMatch[1].trim();
  }

  // Regex patterns for standard City, State / Country formats
  const locPattern = /\b([A-Z][a-zA-S\s.]+,\s*(?:[A-Z]{2}|[A-Z][a-z]+|USA|UK|India|Canada|Australia|Germany|France|Singapore))\b/;

  // Check top 10 header lines for city/state/country
  for (let i = 0; i < Math.min(10, lines.length); i++) {
    const match = lines[i].match(locPattern);
    if (match && !/university|college|school|company|inc|ltd/i.test(match[1])) {
      return match[1].trim();
    }
  }

  // General body match
  const bodyMatch = text.match(locPattern);
  if (bodyMatch && !/university|college|school|company|inc|ltd/i.test(bodyMatch[1])) {
    return bodyMatch[1].trim();
  }

  return 'Not specified in resume';
};

/**
 * Extract the WHOLE Professional Summary section from the resume text without cutting off any lines, words, or letters
 */
const extractWholeProfessionalSummary = (text = '', lines = []) => {
  if (!text.trim()) return 'No professional summary section provided in uploaded resume.';

  const allLines = lines.length > 0 ? lines : text.split('\n').map(l => l.trim()).filter(Boolean);

  // Helper to check if a line is a genuine section header (short line < 40 chars)
  const isSectionHeader = (line, regex) => {
    const clean = line.replace(/^[^a-zA-Z0-9]+/, '').replace(/[:-]$/, '').trim();
    return clean.length < 40 && regex.test(clean);
  };

  const summaryHeaderRegex = /^(summary|professional summary|executive summary|career summary|profile|about me|career objective|objective|overview)/i;
  const otherHeaderRegex = /^(work experience|professional experience|employment history|experience|internships|education|skills|technical skills|projects|key projects|certifications|awards|languages|publications)/i;

  let inSummarySection = false;
  const summaryLines = [];

  for (let i = 0; i < allLines.length; i++) {
    const line = allLines[i];
    const cleanLine = line.replace(/^[^a-zA-Z0-9]+/, '').trim();

    // Check if line matches a Summary section header
    if (!inSummarySection && isSectionHeader(line, summaryHeaderRegex)) {
      inSummarySection = true;
      const inlineText = cleanLine.replace(/^(summary|professional summary|executive summary|career summary|profile|about me|career objective|objective|overview)[\s:-]*/i, '').trim();
      if (inlineText && inlineText.length > 10) {
        summaryLines.push(inlineText);
      }
      continue;
    }

    // Check if line matches ANOTHER section header (which terminates the summary section)
    if (inSummarySection && isSectionHeader(line, otherHeaderRegex)) {
      break;
    }

    if (inSummarySection) {
      summaryLines.push(line);
    }
  }

  if (summaryLines.length > 0) {
    return summaryLines.join('\n').trim();
  }

  // Fallback: If no explicit SUMMARY header was found, extract top paragraph block before first major section header
  const topSummaryLines = [];

  for (let i = 0; i < allLines.length; i++) {
    const line = allLines[i];

    if (isSectionHeader(line, otherHeaderRegex) || isSectionHeader(line, summaryHeaderRegex)) {
      break;
    }

    // Exclude contact line candidates (email, phone, URLs) and candidate name header line
    const isContactLine = line.includes('@') || line.match(/\d{3}[\s.-]?\d{3}/) || /https?:\/\/|linkedin|github/i.test(line);
    const isNameLine = i === 0 && line.length < 35;

    if (!isContactLine && !isNameLine && line.trim().length > 0) {
      topSummaryLines.push(line);
    }
  }

  if (topSummaryLines.length > 0) {
    return topSummaryLines.join('\n').trim();
  }

  return 'No professional summary section provided in uploaded resume.';
};

/**
 * Extract Work Experience and Internships dynamically from resume text
 */
const extractExperienceAndInternships = (text, roleEntities, defaultRole) => {
  const experiences = [];
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  let inExpSection = false;
  let detectedHeading = 'Work Experience & Internships';
  let currentTitle = '';
  let currentCompany = '';
  let currentDuration = '';
  let currentBullets = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect Experience Section Start
    if (/^(work experience|professional experience|employment history|experience|internships|internship experience|career history)/i.test(line)) {
      inExpSection = true;
      detectedHeading = line;
      continue;
    }

    // Detect Next Major Section
    if (inExpSection && /^(education|projects|skills|technical skills|certifications|awards|languages|publications)/i.test(line)) {
      break;
    }

    if (inExpSection) {
      const isDateLine = /\b(?:19|20)\d{2}\b|\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|Present|Current)\b/i.test(line);
      const isRoleLine = /engineer|developer|architect|scientist|analyst|manager|lead|intern|associate|consultant|specialist|designer|administrator/i.test(line);

      if ((isRoleLine || isDateLine) && line.length < 90 && !line.startsWith('-') && !line.startsWith('•') && !line.startsWith('*')) {
        if (currentTitle || currentCompany) {
          experiences.push({
            title: currentTitle || 'Role / Position',
            company: currentCompany || 'Company / Organization',
            duration: currentDuration || 'Duration Not Specified',
            details: currentBullets.length > 0 ? currentBullets : ['Responsibilities specified in resume content.']
          });
        }

        if (isDateLine && !isRoleLine) {
          currentDuration = line;
        } else {
          currentTitle = line;
          currentCompany = '';
          currentDuration = '';

          if (i + 1 < lines.length && !lines[i + 1].startsWith('-') && !lines[i + 1].startsWith('•')) {
            if (/\b(?:19|20)\d{2}\b|Present/i.test(lines[i + 1])) {
              currentDuration = lines[i + 1];
            } else {
              currentCompany = lines[i + 1];
            }
          }
        }
        currentBullets = [];
      } else if (line.startsWith('-') || line.startsWith('•') || line.startsWith('*')) {
        currentBullets.push(line.replace(/^[-•*]\s*/, ''));
      } else if (currentTitle && line.length > 15 && currentBullets.length < 5) {
        currentBullets.push(line);
      }
    }
  }

  if (currentTitle || currentCompany) {
    experiences.push({
      title: currentTitle || 'Role / Position',
      company: currentCompany || 'Company / Organization',
      duration: currentDuration || 'Duration Not Specified',
      details: currentBullets.length > 0 ? currentBullets : ['Responsibilities specified in resume content.']
    });
  }

  return { experiences, experienceHeading: detectedHeading };
};

/**
 * Extract Education details dynamically
 */
const extractEducationDetails = (text, entities) => {
  const eduEntities = entities.filter(e => e.label === 'EDUCATION').map(e => e.text);
  if (eduEntities.length > 0) {
    return Array.from(new Set(eduEntities)).join(' • ');
  }

  const eduMatch = text.match(/(?:bachelor|master|b\.s|m\.s|b\.a|m\.a|phd|degree|university|college|institute)[\s\S]{10,140}?(?=\n\n|\n[A-Z\s]{4,}|$)/i);
  if (eduMatch) {
    return eduMatch[0].replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim();
  }

  return 'No education credentials section found in uploaded resume.';
};

/**
 * Extract Projects with titles AND full details/text dynamically from resume text
 */
const extractProjectsDetails = (text) => {
  const projects = [];
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  let inProjSection = false;
  let currentProjName = '';
  let currentBullets = [];

  const otherHeaderRegex = /^(work experience|professional experience|employment history|experience|internships|education|skills|technical skills|certifications|awards|languages|publications)/i;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const cleanLine = line.replace(/^[-•*]\s*/, '').trim();

    // Detect Projects Section Header
    if (/^(projects|key projects|academic projects|personal projects)/i.test(line)) {
      inProjSection = true;
      continue;
    }

    // Detect Next Section Header
    if (inProjSection && cleanLine.length < 40 && otherHeaderRegex.test(cleanLine.replace(/^[^a-zA-Z0-9]+/, '').replace(/[:-]$/, '').trim())) {
      break;
    }

    if (inProjSection) {
      const isDescriptionLine = /^(using|model|features|built|developed|implemented|designed|created|tech stack|technologies|stack|online|description|details|key highlights|features:)/i.test(cleanLine) || cleanLine.endsWith('.');
      const startsWithCapital = /^[A-Z0-9]/.test(cleanLine);

      // Identify Project Title heading lines
      if (startsWithCapital && !isDescriptionLine && cleanLine.length > 2 && cleanLine.length < 75 && !line.startsWith('-') && !line.startsWith('•') && !line.startsWith('*')) {
        if (currentProjName) {
          projects.push({
            name: currentProjName,
            details: currentBullets.length > 0 ? [...currentBullets] : []
          });
        }
        currentProjName = cleanLine.replace(/[:-]$/, '').trim();
        currentBullets = [];
      } else {
        if (cleanLine) {
          if (!currentProjName) {
            currentProjName = 'Project Highlight';
          }
          currentBullets.push(cleanLine);
        }
      }
    }
  }

  if (currentProjName) {
    projects.push({
      name: currentProjName,
      details: currentBullets.length > 0 ? [...currentBullets] : []
    });
  }

  return projects;
};

/**
 * Technical skill extractor helper
 */
const extractSkillsFromRawText = (text) => {
  const techList = [
    'React', 'React.js', 'Vue', 'Vue.js', 'Angular', 'Next.js', 'TypeScript', 'JavaScript', 'HTML5', 'CSS3', 'Tailwind CSS', 'Redux',
    'Node.js', 'NodeJS', 'Express', 'Python', 'FastAPI', 'Django', 'Flask', 'Java', 'Spring Boot', 'C++', 'C#', '.NET', 'PHP', 'Laravel', 'Go',
    'SQL', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'GraphQL', 'REST APIs', 'Docker', 'Kubernetes', 'AWS', 'GCP', 'Azure', 'CI/CD', 'Git', 'Linux',
    'Machine Learning', 'Deep Learning', 'PyTorch', 'TensorFlow', 'Scikit-Learn', 'Pandas', 'NumPy', 'NLP', 'Data Visualization', 'Tableau', 'PowerBI'
  ];

  const found = [];
  techList.forEach(tech => {
    const escaped = tech.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');
    if (regex.test(text)) {
      found.push(tech);
    }
  });
  return found;
};


