// Resume data is loaded from resume-data.js and resume-data-en.js
// No async loading needed for static site

// Current language (default: French)
let currentLanguage = localStorage.getItem('resume-language') || 'fr';
let currentResumeData = null;

// Translations for static UI elements
const translations = {
    fr: {
        // Dynamic content translations
        ongoing: 'En cours',
        keyAchievements: 'Réalisations clés',
        techStack: 'Stack technique',
        achievements: 'Réalisations',
        technologies: 'Technologies',
        months: {
            '01': 'Jan', '02': 'Fév', '03': 'Mar', '04': 'Avr',
            '05': 'Mai', '06': 'Jun', '07': 'Jul', '08': 'Aoû',
            '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Déc'
        },
        // Static HTML content translations
        nav: {
            profile: 'Profil',
            leadership: 'Leadership',
            experience: 'Expérience',
            projects: 'Projets',
            skills: 'Compétences',
            education: 'Formation'
        },
        sections: {
            profile: 'Profil',
            leadership: 'Leadership & Management',
            experience: 'Expériences Clés',
            projects: 'Projets & Initiatives',
            skills: 'Stack Technique',
            earlyCareer: 'Expériences Antérieures',
            education: 'Formation & Certifications'
        },
        about: {
            intro: 'Tech Lead et Architecte Logiciel avec <strong>20 ans d\'expérience</strong> dans le développement de solutions logicielles complexes. Spécialisé dans le <strong>leadership technique</strong>, l\'architecture de systèmes et la <strong>gestion d\'équipes</strong> de développement.',
            yearsExp: 'Années d\'expérience',
            devsCoached: 'Développeurs recrutés et coachés',
            projectsArchitected: 'Projets architecturés'
        },
        leadership: {
            title: 'Leadership & Management',
            teamManagement: 'Gestion d\'équipe',
            teamItems: [
                'Coordination et animation d\'équipes jusqu\'à 25 développeurs',
                'Recrutement et montée en compétence',
                'Workshop leading et coaching'
            ],
            methodologies: 'Méthodologies',
            methodologiesItems: [
                'Mise en place et optimisation SCRUM',
                'CI/CD avec Azure DevOps, Jenkins',
                'Stratégies de qualité avec SonarQube'
            ],
            architecture: 'Architecture',
            architectureItems: [
                'Conception d\'architectures frontend modulaires',
                'Solutions cloud (GCP, Railway)',
                'Systèmes pour appareils médicaux'
            ]
        },
        skillCategories: {
            frontend: 'Frontend',
            backend: 'Backend',
            devops: 'DevOps & Tools',
            databases: 'Databases'
        },
        projects: {
            intro: 'Projets internes réalisés dans le cadre de mes responsabilités de Tech Manager chez CBTW, démontrant mon engagement dans l\'innovation, l\'optimisation des processus et le développement de solutions adaptées aux besoins de l\'entreprise.'
        },
        earlyCareer: {
            intro: 'Début de carrière (2005-2015) - Développement logiciel dans divers secteurs'
        },
        footer: {
            cvGenerated: 'CV généré dynamiquement'
        }
    },
    en: {
        // Dynamic content translations
        ongoing: 'Ongoing',
        keyAchievements: 'Key Achievements',
        techStack: 'Tech Stack',
        achievements: 'Achievements',
        technologies: 'Technologies',
        months: {
            '01': 'Jan', '02': 'Feb', '03': 'Mar', '04': 'Apr',
            '05': 'May', '06': 'Jun', '07': 'Jul', '08': 'Aug',
            '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dec'
        },
        // Static HTML content translations
        nav: {
            profile: 'Profile',
            leadership: 'Leadership',
            experience: 'Experience',
            projects: 'Projects',
            skills: 'Skills',
            education: 'Education'
        },
        sections: {
            profile: 'Profile',
            leadership: 'Leadership & Management',
            experience: 'Key Experiences',
            projects: 'Projects & Initiatives',
            skills: 'Technical Stack',
            earlyCareer: 'Previous Experiences',
            education: 'Education & Certifications'
        },
        about: {
            intro: 'Tech Lead and Software Architect with <strong>20 years of experience</strong> in developing complex software solutions. Specialized in <strong>technical leadership</strong>, systems architecture and <strong>team management</strong>.',
            yearsExp: 'Years of experience',
            devsCoached: 'Developers recruited and coached',
            projectsArchitected: 'Architected projects'
        },
        leadership: {
            title: 'Leadership & Management',
            teamManagement: 'Team Management',
            teamItems: [
                'Coordination and facilitation of teams up to 25 developers',
                'Recruitment and skill development',
                'Workshop leading and coaching'
            ],
            methodologies: 'Methodologies',
            methodologiesItems: [
                'Implementation and optimization of SCRUM',
                'CI/CD with Azure DevOps, Jenkins',
                'Quality strategies with SonarQube'
            ],
            architecture: 'Architecture',
            architectureItems: [
                'Design of modular frontend architectures',
                'Cloud solutions (GCP, Railway)',
                'Systems for medical devices'
            ]
        },
        skillCategories: {
            frontend: 'Frontend',
            backend: 'Backend',
            devops: 'DevOps & Tools',
            databases: 'Databases'
        },
        projects: {
            intro: 'Internal projects carried out as part of my Tech Manager responsibilities at CBTW, demonstrating my commitment to innovation, process optimization, and developing solutions tailored to business needs.'
        },
        earlyCareer: {
            intro: 'Early career (2005-2015) - Software development in various sectors'
        },
        footer: {
            cvGenerated: 'Dynamically generated resume'
        }
    }
};

// ROT13 encoding/decoding for email protection
function rot13(str) {
    return str.replace(/[a-zA-Z]/g, function(c) {
        return String.fromCharCode(
            (c <= 'Z' ? 90 : 122) >= (c = c.charCodeAt(0) + 13) ? c : c - 26
        );
    });
}

// Base64 decoding for phone protection
function decodeBase64(str) {
    try {
        return atob(str);
    } catch (e) {
        console.error('Failed to decode Base64:', e);
        return str; // Fallback: return original if decode fails
    }
}

function loadResumeData() {
    // Select the appropriate data based on current language
    currentResumeData = currentLanguage === 'en' ? resumeDataEn : resumeData;

    if (currentResumeData) {
        populateResume();
        initializeAnimations();
    } else {
        console.error('Resume data not found. Make sure resume data files are loaded.');
    }
}

// Translate static HTML content
function translateStaticContent() {
    const t = translations[currentLanguage];

    // Update navigation links
    const navLinks = document.querySelectorAll('.nav-link');
    if (navLinks.length >= 6) {
        navLinks[0].textContent = t.nav.profile;
        navLinks[1].textContent = t.nav.leadership;
        navLinks[2].textContent = t.nav.experience;
        navLinks[3].textContent = t.nav.projects;
        navLinks[4].textContent = t.nav.skills;
        navLinks[5].textContent = t.nav.education;
    }

    // Update section titles
    const sectionTitles = {
        'about': t.sections.profile,
        'leadership': t.sections.leadership,
        'experience': t.sections.experience,
        'projects': t.sections.projects,
        'skills': t.sections.skills,
        'early-career': t.sections.earlyCareer,
        'education': t.sections.education
    };

    Object.keys(sectionTitles).forEach(sectionId => {
        const section = document.getElementById(sectionId);
        if (section) {
            const title = section.querySelector('.section-title');
            if (title) {
                title.textContent = sectionTitles[sectionId];
            }
        }
    });

    // Update About section
    const aboutText = document.querySelector('.about-text');
    if (aboutText) {
        aboutText.innerHTML = t.about.intro;
    }

    const highlightLabels = document.querySelectorAll('.highlight-label');
    if (highlightLabels.length >= 3) {
        highlightLabels[0].textContent = t.about.yearsExp;
        highlightLabels[1].textContent = t.about.devsCoached;
        highlightLabels[2].textContent = t.about.projectsArchitected;
    }

    // Update Leadership section
    const leadershipCards = document.querySelectorAll('.leadership-card');
    if (leadershipCards.length >= 3) {
        // Team Management card
        const teamH3 = leadershipCards[0].querySelector('h3');
        const teamItems = leadershipCards[0].querySelectorAll('li');
        if (teamH3) teamH3.textContent = t.leadership.teamManagement;
        teamItems.forEach((item, idx) => {
            if (t.leadership.teamItems[idx]) {
                item.textContent = t.leadership.teamItems[idx];
            }
        });

        // Methodologies card
        const methH3 = leadershipCards[1].querySelector('h3');
        const methItems = leadershipCards[1].querySelectorAll('li');
        if (methH3) methH3.textContent = t.leadership.methodologies;
        methItems.forEach((item, idx) => {
            if (t.leadership.methodologiesItems[idx]) {
                item.textContent = t.leadership.methodologiesItems[idx];
            }
        });

        // Architecture card
        const archH3 = leadershipCards[2].querySelector('h3');
        const archItems = leadershipCards[2].querySelectorAll('li');
        if (archH3) archH3.textContent = t.leadership.architecture;
        archItems.forEach((item, idx) => {
            if (t.leadership.architectureItems[idx]) {
                item.textContent = t.leadership.architectureItems[idx];
            }
        });
    }

    // Update Skills categories
    const skillCategories = document.querySelectorAll('.skill-category h3');
    if (skillCategories.length >= 4) {
        skillCategories[0].textContent = t.skillCategories.frontend;
        skillCategories[1].textContent = t.skillCategories.backend;
        skillCategories[2].textContent = t.skillCategories.devops;
        skillCategories[3].textContent = t.skillCategories.databases;
    }

    // Update Projects intro
    const projectsIntro = document.querySelector('.projects-intro p');
    if (projectsIntro) {
        projectsIntro.textContent = t.projects.intro;
    }

    // Update Early Career intro
    const earlyCareerIntro = document.querySelector('.early-career-intro');
    if (earlyCareerIntro) {
        earlyCareerIntro.textContent = t.earlyCareer.intro;
    }

    // Update Footer
    const footerNote = document.querySelector('.footer-note');
    if (footerNote) {
        const year = new Date().getFullYear();
        footerNote.innerHTML = `${t.footer.cvGenerated} - <span id="current-year">${year}</span>`;
    }
}

// Change language function
function changeLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('resume-language', lang);

    // Update the select value
    const select = document.getElementById('language-select');
    if (select) {
        select.value = lang;
    }

    // Translate static content
    translateStaticContent();

    // Reload all content with new language
    loadResumeData();
}

// Populate all sections
function populateResume() {
    if (!currentResumeData) return;

    // Personal Info
    document.getElementById('name').textContent = currentResumeData.personalInfo.name;
    document.getElementById('title').textContent = currentResumeData.title;
    document.getElementById('nationality').textContent = currentResumeData.personalInfo.nationality;

    // Languages
    const languagesText = currentResumeData.languages
        .map(lang => `${lang.language}: ${lang.level}`)
        .join(' • ');
    document.getElementById('languages').textContent = languagesText;

    // Current year for footer
    document.getElementById('current-year').textContent = new Date().getFullYear();

    // Populate contact information
    if (currentResumeData.personalInfo.contact) {
        const contact = currentResumeData.personalInfo.contact;

        // Email avec décodage ROT13
        if (contact.email) {
            const decodedEmail = rot13(contact.email);
            const emailElements = document.querySelectorAll('.contact-email');
            emailElements.forEach(el => {
                el.href = 'mailto:' + decodedEmail;
                el.textContent = '📧 ' + decodedEmail;
            });
        }

        // Téléphone avec décodage Base64
        if (contact.phone) {
            const decodedPhone = decodeBase64(contact.phone);
            const phoneElements = document.querySelectorAll('.contact-phone');
            phoneElements.forEach(el => {
                el.href = 'tel:' + decodedPhone.replace(/\s/g, '');
                el.textContent = '📱 ' + decodedPhone;
            });
        }

        // LinkedIn
        if (contact.linkedin) {
            const linkedinElements = document.querySelectorAll('.contact-linkedin');
            linkedinElements.forEach(el => {
                el.href = contact.linkedin;
                el.textContent = '🔗 LinkedIn';
            });
        }

        // GitHub
        if (contact.github) {
            const githubElements = document.querySelectorAll('.contact-github');
            githubElements.forEach(el => {
                el.href = contact.github;
                el.textContent = '💻 GitHub';
            });
        }
    }

    // Populate sections
    populateExperiences();
    populateProjects();
    populateSkills();
    populateEarlyCareer();
    populateEducation();
}

// Populate experiences - Focus on leadership roles
function populateExperiences() {
    const container = document.getElementById('experiences-container');
    container.innerHTML = ''; // Clear existing content

    // Filter and show top experiences (most relevant for Tech Lead)
    const topExperiences = currentResumeData.experiences
        .filter(exp => exp.period.start >= '2015-09') // Last 10 years
        .sort((a, b) => {
            // CBTW always first (main employer)
            if (a.company === 'CBTW') return -1;
            if (b.company === 'CBTW') return 1;
            // Other experiences: sort by date descending
            return b.period.start.localeCompare(a.period.start);
        })
        .slice(0, 7); // Top 7 experiences

    topExperiences.forEach((exp, index) => {
        const item = createExperienceElement(exp, index);
        container.appendChild(item);
    });
}

// Create experience element
function createExperienceElement(exp, index) {
    const div = document.createElement('div');
    div.className = 'experience-item';
    div.style.animationDelay = `${index * 0.1}s`;

    // Format period
    const startDate = formatDate(exp.period.start);
    const endDate = exp.period.ongoing ? translations[currentLanguage].ongoing : formatDate(exp.period.end);
    const period = `${startDate} - ${endDate}`;

    // Build HTML
    div.innerHTML = `
        <div class="experience-header">
            <h3 class="experience-company">${exp.company}</h3>
            <div class="experience-position">${exp.position}</div>
            <div class="experience-meta">
                <span>📍 ${exp.location}</span>
                <span>📅 ${period}</span>
                ${exp.contractor ? `<span>🏢 ${exp.contractor}</span>` : ''}
                ${exp.team ? `<span>👥 ${exp.team}</span>` : ''}
            </div>
        </div>

        ${exp.context ? `<div class="experience-context">${exp.context}</div>` : ''}

        ${exp.description ? `<p class="experience-description">${exp.description}</p>` : ''}

        ${exp.tasks && exp.tasks.length > 0 ? `
            <div class="experience-tasks">
                <h4>${translations[currentLanguage].keyAchievements}</h4>
                <ul>
                    ${exp.tasks.map(task => `<li>${task}</li>`).join('')}
                </ul>
            </div>
        ` : ''}

        ${exp.technicalEnvironment && exp.technicalEnvironment.length > 0 ? `
            <div class="tech-stack">
                <h4>${translations[currentLanguage].techStack}</h4>
                <div class="tech-tags">
                    ${exp.technicalEnvironment.slice(0, 12).map(tech =>
                        `<span class="tech-tag">${tech}</span>`
                    ).join('')}
                    ${exp.technicalEnvironment.length > 12 ?
                        `<span class="tech-tag">+${exp.technicalEnvironment.length - 12} ${currentLanguage === 'fr' ? 'autres' : 'more'}</span>`
                        : ''}
                </div>
            </div>
        ` : ''}
    `;

    return div;
}

// Populate skills organized by category
function populateSkills() {
    // Frontend skills
    const frontendSkills = [
        ...currentResumeData.skills.frameworks.filter(f =>
            ['ANGULAR', 'ANGULARJS', 'VUEJS', 'METEORJS'].includes(f.toUpperCase())
        ),
        'TypeScript', 'JavaScript', 'HTML', 'CSS', 'SCSS'
    ];
    populateSkillCategory('frontend-skills', frontendSkills);

    // Backend skills
    const backendSkills = [
        ...currentResumeData.skills.languages.filter(l => l !== 'TYPESCRIPT'),
        ...currentResumeData.skills.frameworks.filter(f =>
            ['SPRING', 'SPRINGBOOT', '.NET CORE', '.NET FRAMEWORK', 'SYMFONY', 'HIBERNATE', 'JPA'].includes(f.toUpperCase())
        )
    ];
    populateSkillCategory('backend-skills', [...new Set(backendSkills)]);

    // DevOps & Tools
    const devopsSkills = [
        'Azure DevOps', 'Jenkins', 'SonarQube', 'Docker', 'GIT', 'SVN',
        'Gitlab', 'ArgoCD', 'Nexus', 'Graylog', 'GCP'
    ];
    populateSkillCategory('devops-skills', devopsSkills);

    // Databases
    populateSkillCategory('database-skills', currentResumeData.skills.databases);
}

// Populate skill category
function populateSkillCategory(elementId, skills) {
    const container = document.getElementById(elementId);
    container.innerHTML = ''; // Clear existing content
    const uniqueSkills = [...new Set(skills)];

    uniqueSkills.slice(0, 10).forEach(skill => {
        const tag = document.createElement('span');
        tag.className = 'skill-tag';
        tag.textContent = skill;
        container.appendChild(tag);
    });
}

// Populate early career experiences (condensed view)
function populateEarlyCareer() {
    const container = document.getElementById('early-career-container');
    container.innerHTML = ''; // Clear existing content

    // Get experiences before 2015-09
    const earlyExperiences = currentResumeData.experiences
        .filter(exp => exp.period.start < '2015-09')
        .sort((a, b) => b.period.start.localeCompare(a.period.start));

    if (earlyExperiences.length === 0) {
        return; // No early experiences to show
    }

    earlyExperiences.forEach((exp, index) => {
        const item = document.createElement('div');
        item.className = 'early-career-item';
        item.style.animationDelay = `${index * 0.05}s`;

        // Format period (year only)
        const startYear = exp.period.start.split('-')[0];
        const endYear = exp.period.end ? exp.period.end.split('-')[0] : translations[currentLanguage].ongoing;
        const period = startYear === endYear ? startYear : `${startYear}-${endYear}`;

        // Condensed format: Period | Company | Position
        item.innerHTML = `
            <span class="early-period">${period}</span>
            <span class="early-company">${exp.company}</span>
            <span class="early-position">${exp.position}</span>
        `;

        container.appendChild(item);
    });
}

// Populate education
function populateEducation() {
    const container = document.getElementById('education-container');
    container.innerHTML = ''; // Clear existing content

    currentResumeData.education.forEach(edu => {
        const div = document.createElement('div');
        div.className = 'education-item';

        div.innerHTML = `
            <div class="education-year">${edu.year}</div>
            <div class="education-title">${edu.title}</div>
            ${edu.institution ? `<div class="education-institution">${edu.institution}</div>` : ''}
            ${edu.location ? `<div class="education-location">${edu.location}</div>` : ''}
        `;

        container.appendChild(div);
    });
}

// Populate internal projects
function populateProjects() {
    const container = document.getElementById('projects-container');
    container.innerHTML = ''; // Clear existing content

    if (!currentResumeData.internalProjects || currentResumeData.internalProjects.length === 0) {
        // Hide projects section if no projects
        const projectsSection = document.getElementById('projects');
        if (projectsSection) {
            projectsSection.style.display = 'none';
        }
        return;
    }

    // Show projects section
    const projectsSection = document.getElementById('projects');
    if (projectsSection) {
        projectsSection.style.display = 'block';
    }

    // Sort projects by start date (most recent first)
    const sortedProjects = [...currentResumeData.internalProjects]
        .sort((a, b) => b.period.start.localeCompare(a.period.start));

    sortedProjects.forEach((project, index) => {
        const item = createProjectElement(project, index);
        container.appendChild(item);
    });
}

// Create project element
function createProjectElement(project, index) {
    const div = document.createElement('div');
    div.className = 'project-card';
    div.style.animationDelay = `${index * 0.1}s`;

    // Format period
    const startDate = formatDate(project.period.start);
    const endDate = project.period.ongoing ? translations[currentLanguage].ongoing : formatDate(project.period.end);
    const period = `${startDate} - ${endDate}`;

    div.innerHTML = `
        <div class="project-header">
            <h3 class="project-title">${project.title}</h3>
            <div class="project-meta">
                <span class="project-period">📅 ${period}</span>
                ${project.company ? `<span class="project-company">🏢 ${project.company}</span>` : ''}
            </div>
        </div>

        ${project.context ? `<div class="project-context">${project.context}</div>` : ''}

        <p class="project-description">${project.description}</p>

        ${project.tasks && project.tasks.length > 0 ? `
            <div class="project-tasks">
                <h4>${translations[currentLanguage].achievements}</h4>
                <ul>
                    ${project.tasks.map(task => `<li>${task}</li>`).join('')}
                </ul>
            </div>
        ` : ''}

        ${project.technicalEnvironment && project.technicalEnvironment.length > 0 ? `
            <div class="tech-stack">
                <h4>${translations[currentLanguage].technologies}</h4>
                <div class="tech-tags">
                    ${project.technicalEnvironment.slice(0, 10).map(tech =>
                        `<span class="tech-tag">${tech}</span>`
                    ).join('')}
                    ${project.technicalEnvironment.length > 10 ?
                        `<span class="tech-tag">+${project.technicalEnvironment.length - 10} ${currentLanguage === 'fr' ? 'autres' : 'more'}</span>`
                        : ''}
                </div>
            </div>
        ` : ''}
    `;

    return div;
}

// Format date
function formatDate(dateString) {
    if (!dateString) return '';
    const [year, month] = dateString.split('-');
    const months = translations[currentLanguage].months;
    return `${months[month]} ${year}`;
}

// Initialize scroll animations
function initializeAnimations() {
    // Smooth scroll for navigation links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    // Observe all sections
    document.querySelectorAll('.section').forEach(section => {
        observer.observe(section);
    });

    // Add parallax effect to hero
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const hero = document.querySelector('.hero');
        if (hero && scrolled < window.innerHeight) {
            hero.style.transform = `translateY(${scrolled * 0.5}px)`;
            hero.style.opacity = 1 - (scrolled / window.innerHeight);
        }
    });

    // Add active state to nav links based on scroll position
    window.addEventListener('scroll', () => {
        const sections = document.querySelectorAll('.section');
        const navLinks = document.querySelectorAll('.nav-link');

        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.pageYOffset >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}

// Add print functionality
function printResume() {
    window.print();
}

// Add export to PDF functionality (requires additional library)
function exportToPDF() {
    // This would require a library like jsPDF or html2pdf
    console.log('PDF export would be implemented here');
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize language selector
    const languageSelect = document.getElementById('language-select');
    if (languageSelect) {
        // Set initial value from localStorage or default to 'fr'
        languageSelect.value = currentLanguage;

        // Add change event listener
        languageSelect.addEventListener('change', (e) => {
            changeLanguage(e.target.value);
        });
    }

    // Translate static content based on current language
    translateStaticContent();

    // Load resume data with current language
    loadResumeData();

    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl+P or Cmd+P for print
        if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
            e.preventDefault();
            printResume();
        }
    });
});

// Expose functions for potential external use
window.resumeApp = {
    loadResumeData,
    printResume,
    exportToPDF
};
