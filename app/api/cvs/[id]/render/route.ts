import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getTheme, type CVTheme } from "@/lib/cv-themes";

interface RouteParams {
  params: {
    id: string;
  };
}

// Helper function to format dates
const formatDate = (dateString: string | Date | null | undefined): string => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return String(dateString);
    const year = date.getFullYear();
    const month = date.toLocaleString('default', { month: 'short' });
    return `${month} ${year}`;
  } catch {
    return String(dateString);
  }
};

// Helper function to convert markdown to HTML
const parseMarkdown = (text: string): string => {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^### (.+?)$/gm, '<h3 style="font-weight: 600; margin: 8px 0;">$1</h3>')
    .replace(/^## (.+?)$/gm, '<h2 style="font-weight: 700; margin: 10px 0;">$1</h2>')
    .replace(/^# (.+?)$/gm, '<h1 style="font-weight: 800; margin: 12px 0;">$1</h1>')
    .replace(/\n- (.+?)(?=\n|$)/g, '<div style="margin-left: 20px;">• $1</div>')
    .replace(/\n\d+\. (.+?)(?=\n|$)/g, '<div style="margin-left: 20px;">1. $1</div>')
    .replace(/\n\n/g, '<br/><br/>');
};

// GET /api/cvs/[id]/render - Render CV as HTML for printing/PDF
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const cv = await prisma.cV.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
      include: {
        education: { orderBy: { order: "asc" } },
        experience: { orderBy: { order: "asc" } },
        publications: { orderBy: { order: "asc" } },
        skills: { orderBy: { order: "asc" } },
        certifications: { orderBy: { order: "asc" } },
        awards: { orderBy: { order: "asc" } },
        languages: { orderBy: { order: "asc" } },
        projects: { orderBy: { order: "asc" } },
        references: { orderBy: { order: "asc" } },
        customSections: { orderBy: { order: "asc" } },
        contactInfo: { orderBy: { order: "asc" } },
      },
    });

    if (!cv) {
      return NextResponse.json({ error: "CV not found" }, { status: 404 });
    }

    // Extract theme
    const cvRecord = cv as Record<string, unknown>;
    const baseTheme = getTheme((cvRecord.theme as string) || "modern-blue");
    const customTheme = (cvRecord.themeData as string) ? (() => {
      try {
        const themeData = typeof (cvRecord.themeData as string) === "string" 
          ? JSON.parse((cvRecord.themeData as string)) 
          : (cvRecord.themeData as unknown);
        return themeData && typeof themeData === "object" && 
               (themeData as Record<string, unknown>).colors && (themeData as Record<string, unknown>).layout && (themeData as Record<string, unknown>).typography && (themeData as Record<string, unknown>).style 
          ? themeData as CVTheme : null;
      } catch {
        return null;
      }
    })() : null;
    
    const theme = customTheme ? {
      ...baseTheme,
      ...customTheme,
      colors: { ...baseTheme.colors, ...(customTheme.colors || {}) },
      layout: { ...baseTheme.layout, ...(customTheme.layout || {}) },
      typography: { ...baseTheme.typography, ...(customTheme.typography || {}) },
      style: { ...baseTheme.style, ...(customTheme.style || {}) },
    } : baseTheme;

    // Parse section order
    let parsedSectionOrder = [];
    try {
      const cvAny = cv as any;
      if (typeof cvAny.sectionOrder === 'string') {
        parsedSectionOrder = JSON.parse(cvAny.sectionOrder);
      } else if (Array.isArray(cvAny.sectionOrder)) {
        parsedSectionOrder = cvAny.sectionOrder;
      }
    } catch {
      parsedSectionOrder = [];
    }

    const defaultSectionOrder = [
      { id: "experience", enabled: true, order: 0 },
      { id: "education", enabled: true, order: 1 },
      { id: "publications", enabled: true, order: 2 },
      { id: "skills", enabled: true, order: 3 },
      { id: "projects", enabled: true, order: 4 },
      { id: "certifications", enabled: true, order: 5 },
      { id: "awards", enabled: true, order: 6 },
      { id: "languages", enabled: true, order: 7 },
      { id: "references", enabled: true, order: 8 },
    ];

    const customSectionOrder = cv.customSections.map((cs: any, index: number) => ({
      id: cs.title,
      enabled: true,
      order: 9 + index,
      isCustom: true,
    }));

    const sectionOrder = parsedSectionOrder.length > 0 ? parsedSectionOrder : defaultSectionOrder;
    const allSections = [...sectionOrder, ...customSectionOrder];
    const sortedSections = allSections
      .filter(s => s.enabled)
      .sort((a, b) => a.order - b.order);

    const formatContactLabel = (contact: any) => {
      if (contact?.label && String(contact.label).trim() !== "") {
        return String(contact.label).trim();
      }
      if (contact?.type) {
        return String(contact.type)
          .replace(/_/g, " ")
          .toLowerCase()
          .replace(/\b\w/g, (c) => c.toUpperCase());
      }
      return "Contact";
    };

    const getContactIcon = (type?: string) => {
      if (!type) return "";
      const normalized = String(type).toLowerCase();
      switch (normalized) {
        case "email":
          return "📧";
        case "phone":
        case "mobile":
          return "📱";
        case "whatsapp":
          return "💬";
        case "telegram":
          return "🚀";
        case "wechat":
          return "💬";
        case "skype":
          return "💼";
        case "website":
          return "🌐";
        case "linkedin":
          return "🔗";
        case "github":
          return "🐙";
        case "twitter":
        case "x":
          return "🐦";
        case "instagram":
          return "📸";
        case "googleScholar":
          return "📚";
        case "orcid":
          return "🧬";
        case "researchGate":
          return "🧪";
        default:
          return "🔗";
      }
    };

    // Helper function to get contact info by type
    const getContactValue = (type: string) => {
      const contact = cv.contactInfo?.find((c: any) => c.type === type);
      return contact?.value || null;
    };

    const baseContactEntries = [
      { key: "email", label: "Email", value: cv.email, icon: "📧" },
      { key: "phone", label: "Phone", value: cv.phone, icon: "📱" },
      { key: "location", label: "Location", value: cv.location, icon: "📍" },
      { key: "website", label: "Website", value: cv.website, icon: "🌐" },
    ];

    const socialContactEntries = [
      { key: "linkedin", label: "LinkedIn", value: cv.linkedin, icon: "🔗" },
      { key: "github", label: "GitHub", value: cv.github, icon: "🐱" },
      { key: "twitter", label: "Twitter", value: getContactValue("twitter"), icon: "🐦" },
      { key: "instagram", label: "Instagram", value: getContactValue("instagram"), icon: "📸" },
      { key: "googleScholar", label: "Google Scholar", value: cv.googleScholar, icon: "📚" },
      { key: "orcid", label: "ORCID", value: getContactValue("orcid"), icon: "🧬" },
      { key: "researchGate", label: "ResearchGate", value: getContactValue("researchGate"), icon: "🧪" },
    ];

    const additionalContactEntries = Array.isArray(cv.contactInfo)
      ? [...cv.contactInfo]
          .sort((a: any, b: any) => {
            const aPrimary = a?.isPrimary ? 1 : 0;
            const bPrimary = b?.isPrimary ? 1 : 0;
            if (aPrimary !== bPrimary) {
              return bPrimary - aPrimary;
            }
            return (a?.order ?? 0) - (b?.order ?? 0);
          })
          .filter((contact: any) => contact && contact.value)
          .map((contact: any, index: number) => ({
            key: contact.id || `${contact.type}-${contact.value}-${index}`,
            label: formatContactLabel(contact),
            value: contact.value,
            icon: getContactIcon(contact.type),
            isPrimary: contact.isPrimary,
          }))
      : [];

    const contactEntries = (() => {
      const combined = [...baseContactEntries, ...socialContactEntries, ...additionalContactEntries];
      const seen = new Set<string>();
      const deduped: Array<{ key: string; label: string; value: string; icon: string; isPrimary?: boolean }> = [];

      for (const entry of combined) {
        const value = entry.value && String(entry.value).trim();
        if (!value) continue;
        const uniqueKey = `${entry.label}|${value}`;
        if (seen.has(uniqueKey)) continue;
        seen.add(uniqueKey);
        deduped.push({ ...entry, value });
      }
      return deduped;
    })();

    const contactInfoHtml = contactEntries
      .map((entry) =>
        `<span>${entry.icon ? `${entry.icon} ` : ""}${entry.label}: ${entry.value}${entry.isPrimary ? " (Primary)" : ""}</span>`
      )
      .join("\n");

    // Generate HTML matching the preview exactly
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${cv.fullName || 'CV'}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: ${theme.typography.bodyFont || 'Helvetica'};
      line-height: ${theme.typography.lineHeight || '1.6'};
      color: ${theme.colors.textPrimary};
      background: ${theme.colors.background};
    }
    .cv-container {
      max-width: 816px;
      margin: 0 auto;
      background: white;
    }
    .print-button {
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 24px;
      background: #2563eb;
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      z-index: 1000;
    }
    .print-button:hover {
      background: #1d4ed8;
    }
    @media print {
      .print-button {
        display: none;
      }
    }
    .header {
      background: ${theme.style.headerStyle === 'gradient' 
        ? `linear-gradient(135deg, ${theme.colors.secondary}, ${theme.colors.primary})`
        : theme.colors.primaryLight};
      color: ${theme.colors.textPrimary};
      padding: 1.5rem 2rem;
    }
    .header h1 {
      font-size: 1.875rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
    }
    .header-info {
      font-size: 0.875rem;
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      margin-top: 0.5rem;
    }
    .metrics {
      display: flex;
      gap: 1.5rem;
      margin-top: 0.75rem;
      font-size: 0.8125rem;
      opacity: 0.9;
    }
    .section {
      padding: 1rem 2rem;
      border-bottom: 1px solid ${theme.colors.border};
    }
    .section h2 {
      font-size: ${theme.typography.sectionTitleSize}px;
      font-weight: 700;
      margin-bottom: 0.5rem;
      color: ${theme.colors.primary};
      font-family: ${theme.typography.headingFont};
      text-transform: ${theme.typography.headingTransform === 'uppercase' ? 'uppercase' : 'none'};
      letter-spacing: ${theme.typography.letterSpacing};
    }
    .entry {
      margin-bottom: 0.75rem;
    }
    .entry:last-child {
      margin-bottom: 0;
    }
    .entry-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 0.25rem;
    }
    .entry-title {
      font-weight: 600;
      font-size: ${theme.typography.entryTitleSize}px;
      color: ${theme.colors.textPrimary};
    }
    .entry-subtitle {
      font-size: 0.875rem;
      color: ${theme.colors.textSecondary};
      font-weight: 500;
    }
    .entry-date {
      font-size: 0.8125rem;
      color: ${theme.colors.textSecondary};
      white-space: nowrap;
    }
    .entry-description {
      font-size: ${theme.typography.bodySize}px;
      color: ${theme.colors.textSecondary};
      margin-top: 0.25rem;
      line-height: ${theme.typography.lineHeight};
    }
    .skills-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.5rem;
    }
    .skill-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.375rem 0;
    }
    .skill-name {
      font-size: 0.875rem;
      font-weight: 500;
      color: ${theme.colors.textPrimary};
    }
    .skill-level {
      font-size: 0.75rem;
      color: ${theme.colors.textSecondary};
      text-transform: capitalize;
    }
    @media print {
      body {
        print-color-adjust: exact;
        -webkit-print-color-adjust: exact;
      }
      .section {
        page-break-inside: avoid;
      }
    }
  </style>
  <script>
    // Auto-trigger print dialog if requested
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('print') === 'true') {
      window.onload = function() {
        setTimeout(() => {
          window.print();
        }, 500);
      };
    }

    function printCV() {
      window.print();
    }
  </script>
</head>
<body>
  <button class="print-button" onclick="printCV()">🖨️ Print / Save as PDF</button>
  <div class="cv-container">
    <!-- Header -->
    <div class="header">
      <div style="display: flex; align-items: flex-start; gap: 1rem;">
        ${cv.profileImage ? `
        <div style="flex-shrink: 0;">
          <img 
            src="${cv.profileImage}" 
            alt="${cv.fullName || 'Profile'}" 
            style="width: 64px; height: 64px; border-radius: 50%; object-fit: cover; border: 2px solid white;"
          />
        </div>
        ` : ''}
        <div style="flex: 1;">
          <h1>${cv.fullName || 'Your Name'}</h1>
          ${cv.headline ? `<div style="font-size: 1rem; font-weight: 500; margin-top: 0.25rem;">${cv.headline}</div>` : ''}
          ${contactEntries.length ? `<div class="header-info">${contactInfoHtml}</div>` : ''}
          ${cv.hIndex || cv.totalCitations || cv.i10Index ? `
          <div class="metrics">
            ${cv.hIndex ? `<span>h-index: ${cv.hIndex}</span>` : ''}
            ${cv.totalCitations ? `<span>Citations: ${cv.totalCitations}</span>` : ''}
            ${cv.i10Index ? `<span>i10-index: ${cv.i10Index}</span>` : ''}
          </div>
          ` : ''}
          ${cv.summary ? `<div style="margin-top: 0.75rem; font-size: 0.875rem; opacity: 0.95;">${cv.summary}</div>` : ''}
        </div>
      </div>
    </div>

    ${sortedSections.map(section => {
      const sectionData = section.isCustom 
        ? cv.customSections.find((cs: any) => cs.title === section.id)
        : null;

      switch (section.id) {
        case 'experience':
          return cv.experience.length > 0 ? `
            <div class="section">
              <h2>EXPERIENCE</h2>
              <div>
                ${cv.experience.map((exp: any) => `
                  <div class="entry">
                    <div class="entry-header">
                      <div>
                        <div class="entry-title">${exp.position}</div>
                        <div class="entry-subtitle">${exp.company}${exp.location ? ` • ${exp.location}` : ''}</div>
                      </div>
                      <div class="entry-date">${formatDate(exp.startDate)} - ${exp.current ? 'Present' : formatDate(exp.endDate)}</div>
                    </div>
                    ${exp.description ? `<div class="entry-description">${parseMarkdown(exp.description)}</div>` : ''}
                  </div>
                `).join('')}
              </div>
            </div>
          ` : '';

        case 'education':
          return cv.education.length > 0 ? `
            <div class="section">
              <h2>EDUCATION</h2>
              <div>
                ${cv.education.map((edu: any) => `
                  <div class="entry">
                    <div class="entry-header">
                      <div>
                        <div class="entry-title">${edu.degree}${edu.field ? ` in ${edu.field}` : ''}</div>
                        <div class="entry-subtitle">${edu.institution}${edu.location ? ` • ${edu.location}` : ''}</div>
                      </div>
                      <div class="entry-date">${formatDate(edu.startDate)} - ${edu.current ? 'Present' : formatDate(edu.endDate)}</div>
                    </div>
                    ${edu.gpa ? `<div class="entry-description">GPA: ${edu.gpa}</div>` : ''}
                    ${edu.description ? `<div class="entry-description">${parseMarkdown(edu.description)}</div>` : ''}
                  </div>
                `).join('')}
              </div>
            </div>
          ` : '';

        case 'publications':
          return cv.publications.length > 0 ? `
            <div class="section">
              <h2>PUBLICATIONS</h2>
              <div>
                ${cv.publications.map((pub: any, index: number) => `
                  <div class="entry">
                    <div class="entry-title">${pub.title}</div>
                    ${pub.authors ? `<div class="entry-subtitle">${pub.authors}</div>` : ''}
                    <div class="entry-description">
                      ${pub.journal || pub.conference || ''} ${pub.year ? `(${pub.year})` : ''}
                      ${pub.citations ? ` • Cited by ${pub.citations}` : ''}
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : '';

        case 'skills':
          return cv.skills.length > 0 ? `
            <div class="section">
              <h2>SKILLS</h2>
              ${theme.style.skillPills ? `
              <div class="skills-grid">
                ${cv.skills.map((skill: any) => `
                  <div class="skill-item">
                    <span class="skill-name">${skill.name}</span>
                    ${skill.level ? `<span class="skill-level">${skill.level}</span>` : ''}
                  </div>
                `).join('')}
              </div>
              ` : `
              <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                ${cv.skills.map((skill: any) => `
                  <span style="font-size: 0.875rem; color: ${theme.colors.textSecondary}; font-family: ${theme.typography.bodyFont};">
                    ${skill.name}${skill.level ? ` (${skill.level})` : ''}
                  </span>
                `).join('')}
              </div>
              `}
            </div>
          ` : '';

        case 'projects':
          return cv.projects.length > 0 ? `
            <div class="section">
              <h2>PROJECTS</h2>
              <div>
                ${cv.projects.map((proj: any) => `
                  <div class="entry">
                    <div class="entry-title">${proj.name}</div>
                    ${proj.role ? `<div class="entry-subtitle">${proj.role}</div>` : ''}
                    ${proj.description ? `<div class="entry-description">${parseMarkdown(proj.description)}</div>` : ''}
                    ${proj.technologies ? `<div class="entry-description"><strong>Technologies:</strong> ${proj.technologies}</div>` : ''}
                  </div>
                `).join('')}
              </div>
            </div>
          ` : '';

        case 'certifications':
          return cv.certifications.length > 0 ? `
            <div class="section">
              <h2>CERTIFICATIONS</h2>
              <div>
                ${cv.certifications.map((cert: any) => `
                  <div class="entry">
                    <div class="entry-header">
                      <div>
                        <div class="entry-title">${cert.name}</div>
                        ${cert.issuer ? `<div class="entry-subtitle">${cert.issuer}</div>` : ''}
                      </div>
                      ${cert.date ? `<div class="entry-date">${formatDate(cert.date)}</div>` : ''}
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : '';

        case 'awards':
          return cv.awards.length > 0 ? `
            <div class="section">
              <h2>AWARDS & HONORS</h2>
              <div>
                ${cv.awards.map((award: any) => `
                  <div class="entry">
                    <div class="entry-header">
                      <div>
                        <div class="entry-title">${award.title}</div>
                        ${award.issuer ? `<div class="entry-subtitle">${award.issuer}</div>` : ''}
                      </div>
                      ${award.date ? `<div class="entry-date">${formatDate(award.date)}</div>` : ''}
                    </div>
                    ${award.description ? `<div class="entry-description">${parseMarkdown(award.description)}</div>` : ''}
                  </div>
                `).join('')}
              </div>
            </div>
          ` : '';

        case 'languages':
          return cv.languages.length > 0 ? `
            <div class="section">
              <h2>LANGUAGES</h2>
              <div class="skills-grid">
                ${cv.languages.map((lang: any) => `
                  <div class="skill-item">
                    <span class="skill-name">${lang.name}</span>
                    ${lang.proficiency ? `<span class="skill-level">${lang.proficiency}</span>` : ''}
                  </div>
                `).join('')}
              </div>
            </div>
          ` : '';

        case 'references':
          const cvAny = cv as any;
          if (cvAny.availableOnDemand) {
            return `
              <div class="section">
                <h2>REFERENCES</h2>
                <div class="entry-description">Available upon request</div>
              </div>
            `;
          }
          return cv.references.length > 0 ? `
            <div class="section">
              <h2>REFERENCES</h2>
              <div>
                ${cv.references.map((ref: any) => `
                  <div class="entry">
                    <div class="entry-title">${ref.name}</div>
                    ${ref.position && ref.organization ? `<div class="entry-subtitle">${ref.position}, ${ref.organization}</div>` : ''}
                    ${ref.email ? `<div class="entry-description">📧 ${ref.email}</div>` : ''}
                    ${ref.phone ? `<div class="entry-description">📱 ${ref.phone}</div>` : ''}
                  </div>
                `).join('')}
              </div>
            </div>
          ` : '';

        default:
          // Custom section
          if (sectionData) {
            return `
              <div class="section">
                <h2>${sectionData.title.toUpperCase()}</h2>
                <div class="entry-description">${parseMarkdown(sectionData.content || '')}</div>
              </div>
            `;
          }
          return '';
      }
    }).join('')}
  </div>
</body>
</html>
    `;

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  } catch (error) {
    console.error("Error rendering CV:", error);
    return NextResponse.json(
      { error: "Failed to render CV" },
      { status: 500 }
    );
  }
}
