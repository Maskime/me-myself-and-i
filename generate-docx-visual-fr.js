const fs = require('fs');
const {
    Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
    convertInchesToTwip, BorderStyle, Table, TableRow, TableCell, WidthType,
    VerticalAlign, ShadingType
} = require('docx');

// Load resume data
const resumeDataRaw = fs.readFileSync('./resume-data.js', 'utf8');
const dataMatch = resumeDataRaw.match(/const resumeData = ({[\s\S]*});/);
if (!dataMatch) {
    console.error('❌ Erreur: Impossible de parser resume-data.js');
    process.exit(1);
}
const resumeData = eval('(' + dataMatch[1] + ')');

console.log('🎨 Génération du CV visuel pour les humains...');

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
        '01': 'Jan', '02': 'Fév', '03': 'Mar', '04': 'Avr',
        '05': 'Mai', '06': 'Juin', '07': 'Juil', '08': 'Août',
        '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Déc'
    };
    return `${months[month]} ${year}`;
}

// Color scheme (using RGB hex colors)
const COLORS = {
    primary: '2C3E50',      // Dark blue-gray for headers
    secondary: '34495E',    // Lighter blue-gray
    accent: '3498DB',       // Bright blue for highlights
    text: '2C3E50',         // Dark text
    lightGray: 'ECF0F1',    // Light gray for backgrounds
    white: 'FFFFFF'
};

// Generate left sidebar content (contact, skills, languages, education)
function generateSidebar() {
    const contact = resumeData.personalInfo.contact;
    const decodedEmail = contact.email ? rot13(contact.email) : '';
    const decodedPhone = contact.phone ? decodeBase64(contact.phone) : '';

    const sections = [];

    // Contact section
    sections.push(
        new Paragraph({
            text: 'CONTACT',
            spacing: { before: 0, after: 200 },
            style: 'sidebarHeading',
        })
    );

    sections.push(
        new Paragraph({
            children: [
                new TextRun({ text: '📧 ', size: 20 }),
                new TextRun({ text: decodedEmail, size: 18 }),
            ],
            spacing: { after: 100 },
        })
    );

    sections.push(
        new Paragraph({
            children: [
                new TextRun({ text: '📱 ', size: 20 }),
                new TextRun({ text: decodedPhone, size: 18 }),
            ],
            spacing: { after: 100 },
        })
    );

    sections.push(
        new Paragraph({
            children: [
                new TextRun({ text: '🔗 ', size: 20 }),
                new TextRun({ text: 'LinkedIn', size: 18, color: COLORS.accent }),
            ],
            spacing: { after: 100 },
        })
    );

    sections.push(
        new Paragraph({
            children: [
                new TextRun({ text: '💻 ', size: 20 }),
                new TextRun({ text: 'GitHub', size: 18, color: COLORS.accent }),
            ],
            spacing: { after: 100 },
        })
    );

    sections.push(
        new Paragraph({
            children: [
                new TextRun({ text: '📍 ', size: 20 }),
                new TextRun({ text: 'Suisse', size: 18 }),
            ],
            spacing: { after: 300 },
        })
    );

    // Skills section
    sections.push(
        new Paragraph({
            text: 'COMPÉTENCES',
            spacing: { before: 200, after: 200 },
            style: 'sidebarHeading',
        })
    );

    const skillCategories = [
        { title: 'Leadership', items: ['Management d\'équipe', 'Coaching technique', 'SCRUM/Agile'] },
        { title: 'Frontend', items: ['Angular', 'Vue.js', 'TypeScript'] },
        { title: 'Backend', items: ['Java/Spring', '.NET Core', 'Node.js'] },
        { title: 'DevOps', items: ['Azure DevOps', 'Docker', 'Kubernetes'] },
        { title: 'Cloud', items: ['GCP', 'Azure'] },
        { title: 'Bases de données', items: ['PostgreSQL', 'MongoDB', 'MySQL'] }
    ];

    skillCategories.forEach(category => {
        sections.push(new Paragraph({
            text: category.title,
            bold: true,
            spacing: { before: 150, after: 100 },
            size: 20,
        }));

        category.items.forEach(skill => {
            sections.push(new Paragraph({
                children: [
                    new TextRun({ text: '• ', color: COLORS.accent, bold: true }),
                    new TextRun({ text: skill, size: 18 }),
                ],
                spacing: { after: 50 },
                indent: { left: convertInchesToTwip(0.1) },
            }));
        });
    });

    // Languages
    sections.push(
        new Paragraph({
            text: 'LANGUES',
            spacing: { before: 300, after: 200 },
            style: 'sidebarHeading',
        })
    );

    resumeData.languages.forEach(lang => {
        sections.push(new Paragraph({
            children: [
                new TextRun({ text: `${lang.language}`, bold: true, size: 18 }),
                new TextRun({ text: ` - ${lang.level}`, size: 18 }),
            ],
            spacing: { after: 80 },
        }));
    });

    // Education
    sections.push(
        new Paragraph({
            text: 'FORMATION',
            spacing: { before: 300, after: 200 },
            style: 'sidebarHeading',
        })
    );

    resumeData.education.slice(0, 3).forEach(edu => {
        sections.push(new Paragraph({
            text: edu.year.toString(),
            bold: true,
            color: COLORS.accent,
            spacing: { before: 100, after: 50 },
            size: 18,
        }));

        sections.push(new Paragraph({
            text: edu.title,
            spacing: { after: 50 },
            size: 17,
        }));

        if (edu.institution) {
            sections.push(new Paragraph({
                text: edu.institution,
                italics: true,
                spacing: { after: 100 },
                size: 16,
            }));
        }
    });

    return sections;
}

// Generate main content (profile, experience)
function generateMainContent() {
    const sections = [];

    // Profile section
    sections.push(
        new Paragraph({
            text: 'PROFIL PROFESSIONNEL',
            spacing: { before: 0, after: 200 },
            style: 'mainHeading',
        })
    );

    sections.push(
        new Paragraph({
            text: `Tech Lead avec 20 ans d'expérience en développement logiciel et architecture système. Expert en leadership technique, gestion d'équipes (jusqu'à 29 collaborateurs) et mise en place de pratiques DevOps. Spécialisé en Angular, Java/Spring et solutions cloud (GCP, Azure).`,
            spacing: { after: 300 },
            alignment: AlignmentType.JUSTIFIED,
            size: 20,
        })
    );

    // Experience section
    sections.push(
        new Paragraph({
            text: 'EXPÉRIENCE PROFESSIONNELLE',
            spacing: { before: 200, after: 250 },
            style: 'mainHeading',
        })
    );

    // Filter and sort experiences (last 6 experiences from 2015+)
    const experiences = resumeData.experiences
        .filter(exp => exp.period.start >= '2015-09')
        .sort((a, b) => {
            if (a.company === 'CBTW') return -1;
            if (b.company === 'CBTW') return 1;
            return b.period.start.localeCompare(a.period.start);
        })
        .slice(0, 6);

    experiences.forEach((exp, index) => {
        const startDate = formatDate(exp.period.start);
        const endDate = exp.period.ongoing ? 'Présent' : formatDate(exp.period.end);

        // Company and Position
        sections.push(new Paragraph({
            children: [
                new TextRun({
                    text: exp.company,
                    bold: true,
                    size: 24,
                    color: COLORS.primary
                }),
                new TextRun({ text: ' | ', size: 22 }),
                new TextRun({
                    text: exp.position,
                    bold: true,
                    size: 22,
                    color: COLORS.secondary
                }),
            ],
            spacing: { before: index === 0 ? 0 : 250, after: 80 },
        }));

        // Date and location
        sections.push(new Paragraph({
            children: [
                new TextRun({
                    text: `${startDate} - ${endDate}`,
                    italics: true,
                    color: COLORS.accent,
                    size: 19
                }),
                new TextRun({ text: ' | ', size: 19 }),
                new TextRun({
                    text: exp.location,
                    italics: true,
                    size: 19
                }),
            ],
            spacing: { after: 120 },
        }));

        // Description
        if (exp.description) {
            sections.push(new Paragraph({
                text: exp.description,
                spacing: { after: 120 },
                alignment: AlignmentType.JUSTIFIED,
                size: 19,
            }));
        }

        // Key achievements (max 5)
        if (exp.tasks && exp.tasks.length > 0) {
            exp.tasks.slice(0, 5).forEach(task => {
                sections.push(new Paragraph({
                    children: [
                        new TextRun({ text: '▸ ', color: COLORS.accent, bold: true, size: 20 }),
                        new TextRun({ text: task, size: 18 }),
                    ],
                    spacing: { after: 70 },
                    indent: { left: convertInchesToTwip(0.2) },
                }));
            });
        }

        // Technologies (condensed)
        if (exp.technicalEnvironment && exp.technicalEnvironment.length > 0) {
            const techs = exp.technicalEnvironment.slice(0, 10).join(' • ');
            sections.push(new Paragraph({
                children: [
                    new TextRun({ text: '⚙️ ', size: 18 }),
                    new TextRun({ text: techs, italics: true, size: 17, color: COLORS.secondary }),
                ],
                spacing: { before: 100, after: 150 },
            }));
        }
    });

    // Early career summary
    sections.push(
        new Paragraph({
            text: 'DÉBUT DE CARRIÈRE (2005-2015)',
            spacing: { before: 300, after: 150 },
            style: 'mainHeading',
        })
    );

    sections.push(
        new Paragraph({
            text: '10 ans d\'expérience en développement logiciel dans les secteurs de l\'e-commerce (Pixmania, Voyage Privé, BlablaCar), de la logistique (GEFCO) et des médias. Expertise en Java/Spring, développement web et méthodologies agiles.',
            spacing: { after: 200 },
            alignment: AlignmentType.JUSTIFIED,
            size: 19,
        })
    );

    return sections;
}

// Create the document with custom styles
const doc = new Document({
    styles: {
        paragraphStyles: [
            {
                id: 'sidebarHeading',
                name: 'Sidebar Heading',
                basedOn: 'Normal',
                next: 'Normal',
                run: {
                    size: 22,
                    bold: true,
                    color: COLORS.white,
                    font: 'Calibri',
                },
                paragraph: {
                    spacing: { before: 200, after: 200 },
                    shading: {
                        type: ShadingType.SOLID,
                        fill: COLORS.primary,
                    },
                    indent: { left: convertInchesToTwip(0.1) },
                },
            },
            {
                id: 'mainHeading',
                name: 'Main Heading',
                basedOn: 'Normal',
                next: 'Normal',
                run: {
                    size: 28,
                    bold: true,
                    color: COLORS.primary,
                    font: 'Calibri',
                },
                paragraph: {
                    spacing: { before: 200, after: 200 },
                    border: {
                        bottom: {
                            color: COLORS.accent,
                            space: 1,
                            style: BorderStyle.SINGLE,
                            size: 12,
                        },
                    },
                },
            },
        ],
    },
    sections: [{
        properties: {
            page: {
                margin: {
                    top: convertInchesToTwip(0.5),
                    right: convertInchesToTwip(0.5),
                    bottom: convertInchesToTwip(0.5),
                    left: convertInchesToTwip(0.5),
                },
            },
        },
        children: [
            // Header with name and title
            new Paragraph({
                text: resumeData.personalInfo.name.toUpperCase(),
                heading: HeadingLevel.TITLE,
                alignment: AlignmentType.CENTER,
                spacing: { after: 100 },
                shading: {
                    type: ShadingType.SOLID,
                    fill: COLORS.primary,
                },
                run: {
                    size: 48,
                    bold: true,
                    color: COLORS.white,
                    font: 'Calibri',
                },
            }),
            new Paragraph({
                text: resumeData.title,
                alignment: AlignmentType.CENTER,
                spacing: { after: 300 },
                run: {
                    size: 22,
                    color: COLORS.accent,
                    font: 'Calibri',
                    italics: true,
                },
            }),

            // Two-column layout using table
            new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                borders: {
                    top: { style: BorderStyle.NONE },
                    bottom: { style: BorderStyle.NONE },
                    left: { style: BorderStyle.NONE },
                    right: { style: BorderStyle.NONE },
                    insideHorizontal: { style: BorderStyle.NONE },
                    insideVertical: { style: BorderStyle.NONE },
                },
                rows: [
                    new TableRow({
                        children: [
                            // Left sidebar (30% width)
                            new TableCell({
                                width: { size: 30, type: WidthType.PERCENTAGE },
                                shading: {
                                    type: ShadingType.SOLID,
                                    fill: COLORS.lightGray,
                                },
                                verticalAlign: VerticalAlign.TOP,
                                margins: {
                                    top: convertInchesToTwip(0.2),
                                    bottom: convertInchesToTwip(0.2),
                                    left: convertInchesToTwip(0.15),
                                    right: convertInchesToTwip(0.15),
                                },
                                children: generateSidebar(),
                            }),
                            // Main content (70% width)
                            new TableCell({
                                width: { size: 70, type: WidthType.PERCENTAGE },
                                verticalAlign: VerticalAlign.TOP,
                                margins: {
                                    top: convertInchesToTwip(0.2),
                                    bottom: convertInchesToTwip(0.2),
                                    left: convertInchesToTwip(0.25),
                                    right: convertInchesToTwip(0.15),
                                },
                                children: generateMainContent(),
                            }),
                        ],
                    }),
                ],
            }),
        ],
    }],
});

// Save Document
const outputFile = 'CV_Maxime_Faye_Visual_FR.docx';

Packer.toBuffer(doc).then(buffer => {
    fs.writeFileSync(outputFile, buffer);
    console.log(`✅ CV visuel généré avec succès: ${outputFile}`);
    console.log('🎨 Design moderne avec mise en page sur deux colonnes');
    console.log('👔 Prêt à impressionner les recruteurs humains!');
}).catch(err => {
    console.error('❌ Erreur lors de la génération:', err);
    process.exit(1);
});
