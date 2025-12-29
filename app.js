// Resume data is loaded from resume-data.js
// No async loading needed for static site

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
    // Data is already available from resume-data.js
    if (resumeData) {
        populateResume();
        initializeAnimations();
    } else {
        console.error('Resume data not found. Make sure resume-data.js is loaded.');
    }
}

// Populate all sections
function populateResume() {
    if (!resumeData) return;

    // Personal Info
    document.getElementById('name').textContent = resumeData.personalInfo.name;
    document.getElementById('title').textContent = resumeData.title;
    document.getElementById('nationality').textContent = resumeData.personalInfo.nationality;

    // Languages
    const languagesText = resumeData.languages
        .map(lang => `${lang.language}: ${lang.level}`)
        .join(' • ');
    document.getElementById('languages').textContent = languagesText;

    // Current year for footer
    document.getElementById('current-year').textContent = new Date().getFullYear();

    // Populate contact information
    if (resumeData.personalInfo.contact) {
        const contact = resumeData.personalInfo.contact;

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

    // Filter and show top experiences (most relevant for Tech Lead)
    const topExperiences = resumeData.experiences
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
    const endDate = exp.period.ongoing ? 'En cours' : formatDate(exp.period.end);
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
                <h4>Réalisations clés</h4>
                <ul>
                    ${exp.tasks.map(task => `<li>${task}</li>`).join('')}
                </ul>
            </div>
        ` : ''}

        ${exp.technicalEnvironment && exp.technicalEnvironment.length > 0 ? `
            <div class="tech-stack">
                <h4>Stack technique</h4>
                <div class="tech-tags">
                    ${exp.technicalEnvironment.slice(0, 12).map(tech =>
                        `<span class="tech-tag">${tech}</span>`
                    ).join('')}
                    ${exp.technicalEnvironment.length > 12 ?
                        `<span class="tech-tag">+${exp.technicalEnvironment.length - 12} autres</span>`
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
        ...resumeData.skills.frameworks.filter(f =>
            ['ANGULAR', 'ANGULARJS', 'VUEJS', 'METEORJS'].includes(f.toUpperCase())
        ),
        'TypeScript', 'JavaScript', 'HTML', 'CSS', 'SCSS'
    ];
    populateSkillCategory('frontend-skills', frontendSkills);

    // Backend skills
    const backendSkills = [
        ...resumeData.skills.languages.filter(l => l !== 'TYPESCRIPT'),
        ...resumeData.skills.frameworks.filter(f =>
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
    populateSkillCategory('database-skills', resumeData.skills.databases);
}

// Populate skill category
function populateSkillCategory(elementId, skills) {
    const container = document.getElementById(elementId);
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

    // Get experiences before 2015-09
    const earlyExperiences = resumeData.experiences
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
        const endYear = exp.period.end ? exp.period.end.split('-')[0] : 'En cours';
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

    resumeData.education.forEach(edu => {
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

    if (!resumeData.internalProjects || resumeData.internalProjects.length === 0) {
        // Hide projects section if no projects
        const projectsSection = document.getElementById('projects');
        if (projectsSection) {
            projectsSection.style.display = 'none';
        }
        return;
    }

    // Sort projects by start date (most recent first)
    const sortedProjects = [...resumeData.internalProjects]
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
    const endDate = project.period.ongoing ? 'En cours' : formatDate(project.period.end);
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
                <h4>Réalisations</h4>
                <ul>
                    ${project.tasks.map(task => `<li>${task}</li>`).join('')}
                </ul>
            </div>
        ` : ''}

        ${project.technicalEnvironment && project.technicalEnvironment.length > 0 ? `
            <div class="tech-stack">
                <h4>Technologies</h4>
                <div class="tech-tags">
                    ${project.technicalEnvironment.slice(0, 10).map(tech =>
                        `<span class="tech-tag">${tech}</span>`
                    ).join('')}
                    ${project.technicalEnvironment.length > 10 ?
                        `<span class="tech-tag">+${project.technicalEnvironment.length - 10} autres</span>`
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
    const months = {
        '01': 'Jan', '02': 'Fév', '03': 'Mar', '04': 'Avr',
        '05': 'Mai', '06': 'Jun', '07': 'Jul', '08': 'Aoû',
        '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Déc'
    };
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
