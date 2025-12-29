const fs = require('fs');
const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, UnderlineType, convertInchesToTwip } = require('docx');

// Parse command line arguments
const args = process.argv.slice(2);
const fullVersion = args.includes('--full');

// Load resume data
const resumeDataRaw = fs.readFileSync('./resume-data.js', 'utf8');
// Extract the data object (remove "const resumeData = " and trailing semicolon)
const dataMatch = resumeDataRaw.match(/const resumeData = ({[\s\S]*});/);
if (!dataMatch) {
    console.error('❌ Erreur: Impossible de parser resume-data.js');
    process.exit(1);
}
const resumeData = eval('(' + dataMatch[1] + ')');

console.log('📄 Génération du CV ATS-friendly...');

// Helper functions
function rot13(str) {
    return str.replace(/[a-zA-Z]/g, function(c) {
        return String.fromCharCode(
            (c <= 'Z' ? 90 : 122) >= (c = c.charCodeAt(0) + 13) ? c : c - 26
        );
    });
}

function decodeBase64(str) {
    try {
        return Buffer.from(str, 'base64').toString('utf8');
    } catch (e) {
        return str;
    }
}

function formatDate(dateString) {
    if (!dateString) return '';
    const [year, month] = dateString.split('-');
    const months = {
        '01': 'Janvier', '02': 'Février', '03': 'Mars', '04': 'Avril',
        '05': 'Mai', '06': 'Juin', '07': 'Juillet', '08': 'Août',
        '09': 'Septembre', '10': 'Octobre', '11': 'Novembre', '12': 'Décembre'
    };
    return `${months[month]} ${year}`;
}

function createSeparator() {
    return new Paragraph({
        text: '═══════════════════════════════════════════',
        spacing: { before: 200, after: 200 },
    });
}

function createSectionTitle(title) {
    return new Paragraph({
        text: title,
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 300, after: 200 },
        thematicBreak: false,
    });
}

// Generate Header
function generateHeader() {
    const contact = resumeData.personalInfo.contact;
    const decodedEmail = contact.email ? rot13(contact.email) : '';
    const decodedPhone = contact.phone ? decodeBase64(contact.phone) : '';

    return [
        new Paragraph({
            text: resumeData.personalInfo.name.toUpperCase(),
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
            spacing: { after: 100 },
        }),
        new Paragraph({
            text: resumeData.title,
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
            italics: true,
        }),
        new Paragraph({
            text: 'Contact',
            bold: true,
            spacing: { before: 100, after: 100 },
        }),
        new Paragraph({
            children: [
                new TextRun({ text: 'Email: ', bold: true }),
                new TextRun(decodedEmail),
            ],
            spacing: { after: 50 },
        }),
        new Paragraph({
            children: [
                new TextRun({ text: 'Téléphone: ', bold: true }),
                new TextRun(decodedPhone),
            ],
            spacing: { after: 50 },
        }),
        new Paragraph({
            children: [
                new TextRun({ text: 'LinkedIn: ', bold: true }),
                new TextRun(contact.linkedin || ''),
            ],
            spacing: { after: 50 },
        }),
        new Paragraph({
            children: [
                new TextRun({ text: 'GitHub: ', bold: true }),
                new TextRun(contact.github || ''),
            ],
            spacing: { after: 50 },
        }),
        new Paragraph({
            children: [
                new TextRun({ text: 'Localisation: ', bold: true }),
                new TextRun('Suisse'),
            ],
            spacing: { after: 200 },
        }),
    ];
}

// Generate Profile
function generateProfile() {
    return [
        createSeparator(),
        createSectionTitle('PROFIL PROFESSIONNEL'),
        new Paragraph({
            text: `Tech Lead avec 20 ans d'expérience en développement logiciel et architecture système. Expert en leadership technique, gestion d'équipes (jusqu'à ${resumeData.experiences[0]?.team?.split(' ')[0] || '29'} collaborateurs) et mise en place de pratiques DevOps. Spécialisé en Angular, Java/Spring, et solutions cloud (GCP, Azure).`,
            spacing: { after: 200 },
            alignment: AlignmentType.JUSTIFIED,
        }),
    ];
}

// Generate Skills
function generateSkills() {
    const sections = [
        createSeparator(),
        createSectionTitle('COMPÉTENCES CLÉS'),
    ];

    const skillCategories = [
        {
            title: 'Leadership & Management',
            skills: [
                'Management d\'équipe (jusqu\'à 29 personnes)',
                'Recrutement et coaching technique',
                'Animation de workshops et formations'
            ]
        },
        {
            title: 'Méthodologies & Pratiques',
            skills: [
                'SCRUM, Agile, CI/CD, DevOps',
                'Architecture logicielle',
                'Code review et qualité logicielle'
            ]
        },
        {
            title: 'Technologies Frontend',
            skills: ['Angular, TypeScript, JavaScript', 'Vue.js, Meteor.js', 'HTML5, CSS3, SCSS']
        },
        {
            title: 'Technologies Backend',
            skills: ['Java, Spring Boot, Spring Framework', '.NET Core, C#', 'Node.js, Python']
        },
        {
            title: 'DevOps & Cloud',
            skills: ['Azure DevOps, Jenkins, ArgoCD', 'Docker, Kubernetes', 'GCP, Azure', 'SonarQube, Nexus, Graylog']
        },
        {
            title: 'Bases de données',
            skills: ['PostgreSQL, MySQL', 'MongoDB, Oracle', 'SQL Server']
        }
    ];

    skillCategories.forEach(category => {
        sections.push(new Paragraph({
            text: category.title,
            bold: true,
            spacing: { before: 150, after: 100 },
        }));

        category.skills.forEach(skill => {
            sections.push(new Paragraph({
                text: `• ${skill}`,
                spacing: { after: 50 },
                indent: { left: convertInchesToTwip(0.25) },
            }));
        });
    });

    return sections;
}

// Generate Experiences
function generateExperiences() {
    const sections = [
        createSeparator(),
        createSectionTitle('EXPÉRIENCE PROFESSIONNELLE'),
    ];

    // Filter experiences (2015+)
    const experiences = resumeData.experiences
        .filter(exp => exp.period.start >= '2015-09')
        .sort((a, b) => {
            if (a.company === 'CBTW') return -1;
            if (b.company === 'CBTW') return 1;
            return b.period.start.localeCompare(a.period.start);
        })
        .slice(0, 7);

    experiences.forEach((exp, index) => {
        // Company | Position | Dates
        const startDate = formatDate(exp.period.start);
        const endDate = exp.period.ongoing ? 'Présent' : formatDate(exp.period.end);

        sections.push(new Paragraph({
            children: [
                new TextRun({ text: `${exp.company} | `, bold: true, size: 24 }),
                new TextRun({ text: `${exp.position} | `, bold: true }),
                new TextRun({ text: `${startDate} - ${endDate}` }),
            ],
            spacing: { before: index === 0 ? 0 : 300, after: 50 },
        }));

        // Location
        sections.push(new Paragraph({
            text: exp.location,
            italics: true,
            spacing: { after: 100 },
        }));

        // Context (if exists)
        if (exp.context) {
            sections.push(new Paragraph({
                text: exp.context,
                spacing: { after: 100 },
                italics: true,
            }));
        }

        // Description
        if (exp.description) {
            sections.push(new Paragraph({
                text: exp.description,
                spacing: { after: 100 },
            }));
        }

        // Tasks
        if (exp.tasks && exp.tasks.length > 0) {
            sections.push(new Paragraph({
                text: 'Réalisations clés:',
                bold: true,
                spacing: { before: 100, after: 50 },
            }));

            exp.tasks.slice(0, 6).forEach(task => {
                sections.push(new Paragraph({
                    text: `• ${task}`,
                    spacing: { after: 50 },
                    indent: { left: convertInchesToTwip(0.25) },
                }));
            });
        }

        // Internal Projects (for CBTW)
        if (exp.company === 'CBTW' && resumeData.internalProjects) {
            const projects = resumeData.internalProjects.slice(0, 4);
            if (projects.length > 0) {
                sections.push(new Paragraph({
                    text: 'Projets internes dirigés:',
                    bold: true,
                    spacing: { before: 100, after: 50 },
                }));

                projects.forEach(project => {
                    sections.push(new Paragraph({
                        text: `• ${project.title}: ${project.description}`,
                        spacing: { after: 50 },
                        indent: { left: convertInchesToTwip(0.25) },
                    }));
                });
            }
        }

        // Technologies
        if (exp.technicalEnvironment && exp.technicalEnvironment.length > 0) {
            const techs = exp.technicalEnvironment.slice(0, 12).join(', ');
            sections.push(new Paragraph({
                children: [
                    new TextRun({ text: 'Technologies: ', italics: true }),
                    new TextRun({ text: techs, italics: true }),
                ],
                spacing: { before: 100, after: 150 },
            }));
        }

        // Separator between experiences (except last)
        if (index < experiences.length - 1) {
            sections.push(new Paragraph({
                text: '---',
                spacing: { before: 200, after: 200 },
            }));
        }
    });

    return sections;
}

// Generate Early Career Summary
function generateEarlyCareer() {
    const earlyExperiences = resumeData.experiences
        .filter(exp => exp.period.start < '2015-09')
        .sort((a, b) => b.period.start.localeCompare(a.period.start));

    if (earlyExperiences.length === 0) {
        return [];
    }

    // Extract unique companies and technologies
    const companies = [...new Set(earlyExperiences.map(exp => exp.company))];
    const allTechs = earlyExperiences.flatMap(exp => exp.technicalEnvironment || []);
    const uniqueTechs = [...new Set(allTechs)].slice(0, 15);

    return [
        createSeparator(),
        createSectionTitle('DÉBUT DE CARRIÈRE (2005-2015)'),
        new Paragraph({
            text: `10 ans d'expérience en développement logiciel dans des secteurs variés incluant l'e-commerce (Pixmania, Voyage Privé, BlablaCar), la logistique (GEFCO), le tourisme et les médias (Bonhomme Paris, Goaland). Expertise acquise en Java/Spring, développement web, méthodologies agiles (SCRUM) et gestion de projets techniques.`,
            spacing: { after: 150 },
            alignment: AlignmentType.JUSTIFIED,
        }),
        new Paragraph({
            children: [
                new TextRun({ text: 'Entreprises: ', bold: true }),
                new TextRun(companies.join(', ')),
            ],
            spacing: { after: 100 },
        }),
        new Paragraph({
            children: [
                new TextRun({ text: 'Technologies: ', bold: true }),
                new TextRun(uniqueTechs.join(', ')),
            ],
            spacing: { after: 200 },
        }),
    ];
}

// Generate Education
function generateEducation() {
    const sections = [
        createSeparator(),
        createSectionTitle('FORMATION & CERTIFICATIONS'),
    ];

    resumeData.education.forEach((edu, index) => {
        sections.push(new Paragraph({
            children: [
                new TextRun({ text: `${edu.year} | `, bold: true }),
                new TextRun({ text: edu.title, bold: true }),
            ],
            spacing: { before: index === 0 ? 0 : 150, after: 50 },
        }));

        if (edu.institution) {
            sections.push(new Paragraph({
                text: edu.institution,
                spacing: { after: 50 },
            }));
        }

        if (edu.location) {
            sections.push(new Paragraph({
                text: edu.location,
                italics: true,
                spacing: { after: 100 },
            }));
        }
    });

    return sections;
}

// Generate Languages
function generateLanguages() {
    if (!resumeData.languages || resumeData.languages.length === 0) {
        return [];
    }

    const sections = [
        createSeparator(),
        createSectionTitle('LANGUES'),
    ];

    resumeData.languages.forEach(lang => {
        sections.push(new Paragraph({
            children: [
                new TextRun({ text: `${lang.language}: `, bold: true }),
                new TextRun(lang.level),
            ],
            spacing: { after: 50 },
        }));
    });

    return sections;
}

// Create Document
const doc = new Document({
    sections: [{
        properties: {
            page: {
                margin: {
                    top: convertInchesToTwip(0.79),
                    right: convertInchesToTwip(0.79),
                    bottom: convertInchesToTwip(0.79),
                    left: convertInchesToTwip(0.79),
                },
            },
        },
        children: [
            ...generateHeader(),
            ...generateProfile(),
            ...generateSkills(),
            ...generateExperiences(),
            ...generateEarlyCareer(),
            ...generateEducation(),
            ...generateLanguages(),
        ],
    }],
});

// Save Document
const outputFile = fullVersion ? 'output/CV_Maxime_Faye_ATS_Full.docx' : 'output/CV_Maxime_Faye_ATS.docx';

Packer.toBuffer(doc).then(buffer => {
    fs.writeFileSync(outputFile, buffer);
    console.log(`✅ CV généré avec succès: ${outputFile}`);
    console.log(`📄 Format: ${fullVersion ? 'Complet' : 'Concis'} (ATS-friendly)`);
    console.log('📌 Prêt pour envoi aux recruteurs!');
}).catch(err => {
    console.error('❌ Erreur lors de la génération:', err);
    process.exit(1);
});
