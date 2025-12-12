import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';
import { getTheme } from './cv-themes';
import { formatCitation, CitationStyle } from './citation-formatter';

// Register fonts (optional - uses default if not registered)
// Font.register({
//   family: 'Roboto',
//   src: 'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxK.woff2',
// });

// Create dynamic styles based on theme
const createStyles = (theme: any) => StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: theme.typography?.bodySize || 10,
    color: theme.colors?.textPrimary || '#000000',
    backgroundColor: theme.colors?.background || '#ffffff',
  },
  container: {
    backgroundColor: theme.colors?.surface || '#ffffff',
    borderRadius: 8,
    overflow: 'hidden',
  },
  header: {
    backgroundColor: theme.colors?.primary || '#2563eb',
    color: 'white',
    padding: 16,
    flexDirection: 'row',
    gap: 16,
  },
  profileImage: {
    width: theme.photoSize === 'small' ? 48 
      : theme.photoSize === 'large' ? 80
      : theme.photoSize === 'xlarge' ? 96 : 64,
    height: theme.photoSize === 'small' ? 48 
      : theme.photoSize === 'large' ? 80
      : theme.photoSize === 'xlarge' ? 96 : 64,
    borderRadius: (theme?.style?.profileImageShape === 'square' ? 0 
      : theme?.style?.profileImageShape === 'rounded' ? 8 
      : theme?.photoSize === 'small' ? 24 
      : theme?.photoSize === 'large' ? 40
      : theme?.photoSize === 'xlarge' ? 48 : 32) || 32,
    objectFit: 'cover',
  },
  headerContent: {
    flex: 1,
  },
  name: {
    fontSize: theme.typography?.nameSize || 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headline: {
    fontSize: theme.typography?.entryTitleSize || theme.typography?.smallSize || 10,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 4,
  },
  headerInfo: {
    fontSize: theme.typography?.bodySize || 10,
    marginTop: 4,
    gap: 2,
  },
  headerInfoItem: {
    marginBottom: 2,
  },
  metrics: {
    fontSize: theme.typography?.bodySize || 10,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.3)',
    borderTopStyle: 'solid',
    flexDirection: 'row',
    gap: 16,
  },
  section: {
    padding: theme.layout?.sectionPadding || 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors?.border || '#e5e7eb',
    borderBottomStyle: 'solid',
    backgroundColor: theme.style?.sectionStyle === 'filled' ? (theme.colors?.surface || '#ffffff') : 'transparent',
  },
  sectionTitle: {
    fontSize: theme.typography?.sectionTitleSize || 14,
    fontWeight: 'bold',
    color: theme.colors?.primary || '#2563eb',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  summaryText: {
    fontSize: theme.typography?.bodySize || 10,
    lineHeight: 1.6,
    color: theme.colors?.textPrimary || '#000000',
  },
  entry: {
    marginBottom: 12,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  entryLeft: {
    flex: 1,
  },
  entryTitle: {
    fontSize: theme.typography?.entryTitleSize || 11,
    fontWeight: 'bold',
    color: theme.colors?.textPrimary || '#000000',
  },
  entrySubtitle: {
    fontSize: theme.typography?.bodySize || 10,
    color: theme.colors?.textSecondary || '#666666',
    marginTop: 2,
  },
  entryLocation: {
    fontSize: theme.typography?.bodySize || 10,
    color: theme.colors?.textSecondary || '#666666',
    marginTop: 1,
  },
  entryDate: {
    fontSize: theme.typography?.bodySize || 10,
    color: theme.colors?.textSecondary || '#666666',
    textAlign: 'right',
  },
  entryDescription: {
    fontSize: theme.typography?.bodySize || 10,
    color: theme.colors?.textPrimary || '#000000',
    marginTop: 4,
    lineHeight: 1.4,
  },
  skillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  skillPill: {
    backgroundColor: theme.colors?.accent || '#e0e7ff',
    color: theme.colors?.primary || '#2563eb',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: theme.typography?.bodySize || 10,
    marginRight: 4,
    marginBottom: 4,
  },
  languagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  languageItem: {
    width: '48%',
    fontSize: theme.typography?.bodySize || 10,
  },
  languageName: {
    fontWeight: 'bold',
  },
  languageProficiency: {
    color: theme.colors?.textSecondary || '#666666',
  },
  referencesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  referenceItem: {
    width: '48%',
    fontSize: theme.typography?.bodySize || 10,
  },
  referenceName: {
    fontWeight: 'bold',
    marginBottom: 2,
  },
  referenceDetail: {
    color: theme.colors?.textSecondary || '#666666',
    marginTop: 1,
  },
  socialLinksContainer: {
    gap: 4,
  },
  socialLink: {
    fontSize: theme.typography?.bodySize || 10,
    marginBottom: 4,
  },
  socialPlatform: {
    fontWeight: 'bold',
  },
  socialUrl: {
    color: theme.colors?.primary || '#2563eb',
  },
});

// Helper function to format dates
const formatDate = (dateString: string | Date | null | undefined): string => {
  if (!dateString) return '';
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

// Helper to parse markdown (simplified for PDF)
const parseMarkdown = (text: any): string => {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/^###? (.+?)$/gm, '$1')
    .replace(/\n- /g, '\n• ')
    .replace(/\n\d+\. /g, '\n');
};

interface CVPDFDocumentProps {
  cv: any;
  customTheme?: any;
}

export const CVPDFDocument: React.FC<CVPDFDocumentProps> = ({ cv, customTheme }) => {
  if (!cv) return null;

  console.log('PDF: Generating for CV:', cv.id);
  console.log('PDF: Education type:', typeof cv.education, 'Value:', cv.education);

  // Get theme - use custom theme if provided, otherwise get by ID
  let theme;
  if (customTheme) {
    console.log('PDF: Using customTheme:', customTheme);
    theme = customTheme;
  } else if (cv.themeData) {
    // Parse themeData if it exists
    try {
      const themeData = typeof cv.themeData === 'string' ? JSON.parse(cv.themeData) : cv.themeData;
      console.log('PDF: Loaded theme from cv.themeData:', themeData);
      theme = themeData || getTheme(cv.theme || 'modern-blue');
    } catch (e) {
      console.error('PDF: Failed to parse themeData:', e);
      theme = getTheme(cv.theme || 'modern-blue');
    }
  } else {
    console.log('PDF: No themeData, using theme ID:', cv.theme);
    theme = getTheme(cv.theme || 'modern-blue');
  }
  
  // Ensure theme is not null before accessing properties
  if (!theme) {
    console.warn('PDF: Theme was null, using default');
    theme = getTheme('modern-blue');
  }
  
  // Ensure theme.style exists
  if (!theme.style) {
    console.warn('PDF: Theme.style was missing, using default');
    const defaultTheme = getTheme('modern-blue');
    theme = { ...defaultTheme, ...theme, style: defaultTheme.style };
  }

  // Log the theme style before merging
  console.log('PDF: Theme style.profileImageShape before merge:', theme?.style?.profileImageShape);
  
  // Ensure theme has all required properties with defaults
  const defaultTheme = getTheme('modern-blue');
  
  // Deep merge: Start with defaults, then apply custom theme, preserving all nested properties
  theme = {
    ...defaultTheme,
    ...theme,
    colors: { ...defaultTheme.colors, ...(theme.colors || {}) },
    typography: { ...defaultTheme.typography, ...(theme.typography || {}) },
    layout: { ...defaultTheme.layout, ...(theme.layout || {}) },
    style: { ...defaultTheme.style, ...(theme.style || {}) },
    // Preserve other properties that might exist in customized theme
    photoSize: theme.photoSize || defaultTheme.photoSize,
    showPhoto: theme.showPhoto !== undefined ? theme.showPhoto : defaultTheme.showPhoto,
    photoBorderWidth: theme.photoBorderWidth !== undefined ? theme.photoBorderWidth : defaultTheme.photoBorderWidth,
    photoBorderColor: theme.photoBorderColor || defaultTheme.photoBorderColor,
    photoShadow: theme.photoShadow !== undefined ? theme.photoShadow : defaultTheme.photoShadow,
    photoGrayscale: theme.photoGrayscale !== undefined ? theme.photoGrayscale : defaultTheme.photoGrayscale,
  };
  
  console.log('PDF: Final theme style.profileImageShape:', theme.style.profileImageShape);
  console.log('PDF: Final theme object keys:', Object.keys(theme));
  
  const styles = createStyles(theme);

  const contactInfo = Array.isArray(cv.contactInfo)
    ? [...cv.contactInfo].sort((a, b) => {
        const aPrimary = a?.isPrimary ? 1 : 0;
        const bPrimary = b?.isPrimary ? 1 : 0;
        if (aPrimary !== bPrimary) {
          return bPrimary - aPrimary;
        }
        return (a?.order ?? 0) - (b?.order ?? 0);
      })
    : [];

  const formatContactLabel = (contact: any) => {
    if (contact?.label && String(contact.label).trim() !== '') {
      return String(contact.label).trim();
    }
    if (contact?.type) {
      return String(contact.type)
        .replace(/_/g, ' ')
        .toLowerCase()
        .replace(/\b\w/g, (c) => c.toUpperCase());
    }
    return 'Contact';
  };

  const baseContactEntries = [
    { key: 'email', label: 'Email', value: cv.email, icon: '' },
    { key: 'phone', label: 'Phone', value: cv.phone, icon: '' },
    { key: 'location', label: 'Location', value: cv.location, icon: '' },
    { key: 'website', label: 'Website', value: cv.website, icon: '' },
  ];

  const socialContactEntries = [
    { key: 'linkedin', label: 'LinkedIn', value: cv.linkedin, icon: '' },
    { key: 'github', label: 'GitHub', value: cv.github, icon: '' },
    { key: 'twitter', label: 'Twitter', value: cv.twitter, icon: '' },
    { key: 'googleScholar', label: 'Google Scholar', value: cv.googleScholar, icon: '' },
    { key: 'orcid', label: 'ORCID', value: cv.orcid, icon: '' },
    { key: 'researchGate', label: 'ResearchGate', value: cv.researchGate, icon: '' },
  ];

  const additionalContactEntries = contactInfo
    .filter((contact: any) => contact && contact.value)
    .map((contact: any, index: number) => ({
      key: contact.id || `${contact.type}-${contact.value}-${index}`,
      label: formatContactLabel(contact),
      value: contact.value,
      icon: '',
      isPrimary: contact.isPrimary,
    }));

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

  const transformHeading = (text: string) => {
    const transform = theme?.typography?.headingTransform;
    if (!transform || typeof transform !== 'string') {
      return text;
    }
    switch (transform) {
      case 'uppercase':
        return text.toUpperCase();
      case 'lowercase':
        return text.toLowerCase();
      case 'capitalize':
        return text
          .toLowerCase()
          .replace(/\b\w/g, (c) => c.toUpperCase());
      case 'first-capital':
        return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
      case 'none':
      default:
        return text;
    }
  };
  
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
    { id: 'experience', enabled: true, order: 0 },
    { id: 'education', enabled: true, order: 1 },
    { id: 'publications', enabled: true, order: 2 },
    { id: 'skills', enabled: true, order: 3 },
    { id: 'projects', enabled: true, order: 4 },
    { id: 'certifications', enabled: true, order: 5 },
    { id: 'awards', enabled: true, order: 6 },
    { id: 'languages', enabled: true, order: 7 },
    { id: 'references', enabled: true, order: 8 },
  ];

  const customSectionOrder = (cv.customSections || []).map((cs: any, index: number) => ({
    id: cs.title,
    enabled: true,
    order: 9 + index,
    isCustom: true,
  }));

  const sectionOrder = parsedSectionOrder.length > 0 ? parsedSectionOrder : defaultSectionOrder;
  const allSections = [...sectionOrder, ...customSectionOrder];
  const sortedSections = allSections.filter(s => s.enabled).sort((a, b) => a.order - b.order);

  const renderSection = (section: any) => {
    const sectionData = section.isCustom
      ? cv.customSections?.find((cs: any) => cs.title === section.id)
      : null;

    switch (section.id) {
      case 'experience':
        return (cv.experience || []).length > 0 ? (
          <View key="experience" style={styles.section}>
            <Text style={styles.sectionTitle}>{transformHeading('Experience')}</Text>
            {(cv.experience || []).map((exp: any, index: number) => (
              <View key={index} style={styles.entry}>
                <View style={styles.entryHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.entryTitle}>{exp.position}</Text>
                    <Text style={styles.entrySubtitle}>
                      {exp.company}{exp.location ? ` • ${exp.location}` : ''}
                    </Text>
                  </View>
                  <Text style={styles.entryDate}>
                    {formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}
                  </Text>
                </View>
                {exp.description && (
                  <Text style={styles.entryDescription}>{parseMarkdown(exp.description)}</Text>
                )}
              </View>
            ))}
          </View>
        ) : null;

      case 'education':
        return (cv.education || []).length > 0 ? (
          <View key="education" style={styles.section}>
            <Text style={styles.sectionTitle}>{transformHeading('Education')}</Text>
            {(cv.education || []).map((edu: any, index: number) => (
              <View key={index} style={styles.entry}>
                <View style={styles.entryHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.entryTitle}>
                      {edu.degree}{edu.field ? ` in ${edu.field}` : ''}
                    </Text>
                    <Text style={styles.entrySubtitle}>
                      {edu.institution}{edu.location ? ` • ${edu.location}` : ''}
                    </Text>
                  </View>
                  <Text style={styles.entryDate}>
                    {formatDate(edu.startDate)} - {edu.current ? 'Present' : formatDate(edu.endDate)}
                  </Text>
                </View>
                {edu.gpa && <Text style={styles.entryDescription}>GPA: {edu.gpa}</Text>}
                {edu.description && (
                  <Text style={styles.entryDescription}>{parseMarkdown(edu.description)}</Text>
                )}
              </View>
            ))}
          </View>
        ) : null;

      case 'publications':
        if (!(cv.publications || []).length) return null;
        
        const citationStyle = (cv.citationStyle || 'APA') as CitationStyle;
        const showNumbering = cv.showNumbering ?? true;
        const numberingStyle = cv.numberingStyle || 'grouped';
        
        // Group publications by type
        const journals = (cv.publications || []).filter((p: any) => p.publicationType === 'journal' || p.journal);
        const conferences = (cv.publications || []).filter((p: any) => p.publicationType === 'conference' || (!p.journal && p.conference));
        const shouldGroup = journals.length > 0 && conferences.length > 0;
        
        return (
          <View key="publications" style={styles.section}>
            <Text style={styles.sectionTitle}>{transformHeading('Publications')}</Text>
            
            {shouldGroup && numberingStyle === 'grouped' ? (
              <>
                {journals.length > 0 && (
                  <View style={{ marginBottom: 8 }}>
                    <Text style={[styles.entryTitle, { marginBottom: 4 }]}>Journal Articles</Text>
                    {journals.map((pub: any, index: number) => (
                      <Text key={index} style={[styles.entryDescription, { marginBottom: 4 }]}>
                        {showNumbering && `[J${index + 1}] `}{formatCitation(pub, citationStyle)}
                      </Text>
                    ))}
                  </View>
                )}
                {conferences.length > 0 && (
                  <View>
                    <Text style={[styles.entryTitle, { marginBottom: 4 }]}>Conference Papers</Text>
                    {conferences.map((pub: any, index: number) => (
                      <Text key={index} style={[styles.entryDescription, { marginBottom: 4 }]}>
                        {showNumbering && `[C${index + 1}] `}{formatCitation(pub, citationStyle)}
                      </Text>
                    ))}
                  </View>
                )}
              </>
            ) : (
              <>
                {(cv.publications || []).map((pub: any, index: number) => (
                  <Text key={index} style={[styles.entryDescription, { marginBottom: 4 }]}>
                    {showNumbering && `[${index + 1}] `}{formatCitation(pub, citationStyle)}
                  </Text>
                ))}
              </>
            )}
          </View>
        );

      case 'skills':
        return (cv.skills || []).length > 0 ? (
          <View key="skills" style={styles.section}>
            <Text style={styles.sectionTitle}>{transformHeading('Skills')}</Text>
            <View style={styles.skillsGrid}>
              {(cv.skills || []).map((skill: any, index: number) => (
                <Text key={index} style={styles.skillPill}>
                  {skill.name}{skill.level ? ` (${skill.level})` : ''}
                </Text>
              ))}
            </View>
          </View>
        ) : null;

      case 'projects':
        return (cv.projects || []).length > 0 ? (
          <View key="projects" style={styles.section}>
            <Text style={styles.sectionTitle}>{transformHeading('Projects')}</Text>
            {(cv.projects || []).map((proj: any, index: number) => (
              <View key={index} style={styles.entry}>
                <Text style={styles.entryTitle}>{proj.name}</Text>
                {proj.role && <Text style={styles.entrySubtitle}>{proj.role}</Text>}
                {proj.description && (
                  <Text style={styles.entryDescription}>{parseMarkdown(proj.description)}</Text>
                )}
                {proj.technologies && (
                  <Text style={styles.entryDescription}>Technologies: {proj.technologies}</Text>
                )}
              </View>
            ))}
          </View>
        ) : null;

      case 'certifications':
        return (cv.certifications || []).length > 0 ? (
          <View key="certifications" style={styles.section}>
            <Text style={styles.sectionTitle}>{transformHeading('Certifications')}</Text>
            {(cv.certifications || []).map((cert: any, index: number) => (
              <View key={index} style={styles.entry}>
                <View style={styles.entryHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.entryTitle}>{cert.name}</Text>
                    {cert.issuer && <Text style={styles.entrySubtitle}>{cert.issuer}</Text>}
                  </View>
                  {cert.issueDate && <Text style={styles.entryDate}>{formatDate(cert.issueDate)}</Text>}
                </View>
              </View>
            ))}
          </View>
        ) : null;

      case 'awards':
        return (cv.awards || []).length > 0 ? (
          <View key="awards" style={styles.section}>
            <Text style={styles.sectionTitle}>{transformHeading('Awards & Honors')}</Text>
            {(cv.awards || []).map((award: any, index: number) => (
              <View key={index} style={styles.entry}>
                <View style={styles.entryHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.entryTitle}>{award.title}</Text>
                    {award.issuer && <Text style={styles.entrySubtitle}>{award.issuer}</Text>}
                  </View>
                  {award.date && <Text style={styles.entryDate}>{formatDate(award.date)}</Text>}
                </View>
                {award.description && (
                  <Text style={styles.entryDescription}>{parseMarkdown(award.description)}</Text>
                )}
              </View>
            ))}
          </View>
        ) : null;

      case 'languages':
        return (cv.languages || []).length > 0 ? (
          <View key="languages" style={styles.section}>
            <Text style={styles.sectionTitle}>{transformHeading('Languages')}</Text>
            <View style={styles.languagesGrid}>
              {(cv.languages || []).map((lang: any, index: number) => (
                <View key={index} style={styles.languageItem}>
                  <Text>
                    <Text style={styles.languageName}>{lang.name}</Text>
                    {lang.proficiency && <Text style={styles.languageProficiency}> - {lang.proficiency}</Text>}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ) : null;

      case 'references':
        // Filter references like in HTML preview
        const visibleReferences = cv.references?.filter((ref: any) => !ref.availableOnDemand) || [];
        const demandReferences = cv.references?.filter((ref: any) => ref.availableOnDemand) || [];
        
        return (visibleReferences.length > 0 || demandReferences.length > 0) ? (
          <View key="references" style={styles.section}>
            <Text style={styles.sectionTitle}>{transformHeading('References')}</Text>
            {visibleReferences.length > 0 && (
              <View style={styles.referencesGrid}>
                {visibleReferences.map((ref: any, index: number) => (
                  <View key={index} style={styles.referenceItem}>
                    <Text style={styles.referenceName}>{ref.name}</Text>
                    {ref.position && <Text style={styles.referenceDetail}>{ref.position}</Text>}
                    {ref.organization && <Text style={styles.referenceDetail}>{ref.organization}</Text>}
                    {ref.email && <Text style={styles.referenceDetail}>{ref.email}</Text>}
                    {ref.phone && <Text style={styles.referenceDetail}>{ref.phone}</Text>}
                  </View>
                ))}
              </View>
            )}
            {demandReferences.length > 0 && (
              <Text style={[styles.entryDescription, { fontStyle: 'italic', marginTop: visibleReferences.length > 0 ? 12 : 0 }]}>
                {demandReferences.length} reference{demandReferences.length > 1 ? 's' : ''} available upon request.
              </Text>
            )}
          </View>
        ) : null;

      default:
        if (sectionData) {
          return (
            <View key={section.id} style={styles.section}>
              <Text style={styles.sectionTitle}>{transformHeading(sectionData.title || 'Custom Section')}</Text>
              <Text style={styles.entryDescription}>{parseMarkdown(sectionData.content || '')}</Text>
            </View>
          );
        }
        return null;
    }
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.container}>
          {/* Header - matches HTML preview */}
          <View style={styles.header}>
            {cv.profileImage && typeof cv.profileImage === 'string' && cv.profileImage.trim() !== '' && (
              <Image src={cv.profileImage} style={styles.profileImage} />
            )}
            <View style={styles.headerContent}>
              <Text style={styles.name}>{cv.fullName || 'Your Name'}</Text>
              {cv.headline ? <Text style={styles.headline}>{cv.headline}</Text> : null}
              <View style={styles.headerInfo}>
                {contactEntries.map((contact) => (
                  <Text key={contact.key} style={styles.headerInfoItem}>
                    {contact.icon ? `${contact.icon} ` : ''}{contact.label}: {contact.value}
                    {contact.isPrimary ? ' (Primary)' : ''}
                  </Text>
                ))}
              </View>
              {(cv.hIndex || cv.totalCitations || cv.i10Index) && (
                <View style={styles.metrics}>
                  {cv.hIndex && <Text>h-index: {cv.hIndex}</Text>}
                  {cv.totalCitations && <Text>Citations: {cv.totalCitations}</Text>}
                  {cv.i10Index && <Text>i10-index: {cv.i10Index}</Text>}
                </View>
              )}
            </View>
          </View>

          {/* Summary Section - if present */}
          {cv.summary && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{transformHeading('Summary')}</Text>
              <Text style={styles.summaryText}>{cv.summary}</Text>
            </View>
          )}

          {/* Render sections in custom order */}
          {sortedSections.map(section => renderSection(section))}

          {/* Social Links - Always at bottom if present */}
          {cv.socialLinks?.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{transformHeading('Links')}</Text>
              <View style={styles.socialLinksContainer}>
                {cv.socialLinks.map((link: any, index: number) => (
                  <View key={index} style={styles.socialLink}>
                    <Text>
                      <Text style={styles.socialPlatform}>{link.platform}:</Text>{' '}
                      <Text style={styles.socialUrl}>{link.url}</Text>
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </Page>
    </Document>
  );
};
