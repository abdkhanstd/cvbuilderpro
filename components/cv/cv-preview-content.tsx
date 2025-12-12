import { Children, type ReactNode } from "react";
import {
  BadgeCheck,
  BookOpen,
  Github,
  Globe,
  Linkedin,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Rocket,
  Twitter,
  User,
  type LucideIcon,
  Link as LinkIcon,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { formatCitation, type CitationStyle } from "@/lib/citation-formatter";
import { getTheme, type CVTheme } from "@/lib/cv-themes";
import { CV_LAYOUTS, getSpacingClass } from "@/lib/cv-layouts";

export interface CVPreviewProps {
  cv: any;
  themeId?: string;
  layoutId?: string;
  customTheme?: CVTheme | null;
  staticMode?: boolean;
}

type IconComponent = LucideIcon;

interface ContactEntry {
  key: string;
  label: string;
  value: string;
  icon: IconComponent;
  href?: string;
  isExternal?: boolean;
  isPrimary?: boolean;
}

interface SectionOrderItem {
  id: string;
  title?: string;
  enabled?: boolean;
  isCustom?: boolean;
}

const PHOTO_SIZES: Record<NonNullable<CVTheme["photoSize"]>, number> = {
  small: 48,
  medium: 64,
  large: 80,
  xlarge: 100,
  xxlarge: 120,
};

// Aspect ratio multipliers for height
const PHOTO_ASPECTS: Record<NonNullable<CVTheme["photoAspect"]>, number> = {
  square: 1,
  portrait: 1.33,  // 4:3 ratio (taller)
  landscape: 0.75, // 3:4 ratio (wider)
};

function mergeTheme(base: CVTheme, custom?: CVTheme | null): CVTheme {
  if (!custom) return base;
  return {
    ...base,
    ...custom,
    colors: { ...base.colors, ...(custom.colors || {}) },
    layout: { ...base.layout, ...(custom.layout || {}) },
    typography: { ...base.typography, ...(custom.typography || {}) },
    style: { ...base.style, ...(custom.style || {}) },
    showPhoto: custom.showPhoto ?? base.showPhoto,
    photoSize: custom.photoSize ?? base.photoSize,
    photoAspect: custom.photoAspect ?? base.photoAspect,
    photoBorderWidth: custom.photoBorderWidth ?? base.photoBorderWidth,
    photoBorderColor: custom.photoBorderColor ?? base.photoBorderColor,
    photoShadow: custom.photoShadow ?? base.photoShadow,
    photoGrayscale: custom.photoGrayscale ?? base.photoGrayscale,
  };
}

function parseJSONField<T>(value: unknown): T | null {
  if (!value) return null;
  if (typeof value === "object") return value as T;
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  }
  return null;
}

function normalizeArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function pickFirstArray<T>(...sources: unknown[]): T[] {
  for (const source of sources) {
    const arr = normalizeArray<T>(source);
    if (arr.length) return arr;
  }
  return [];
}

function ensureProtocol(url?: string | null): string | undefined {
  if (!url) return undefined;
  const trimmed = String(url).trim();
  if (!trimmed) return undefined;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function isLikelyUrl(value?: string | null): boolean {
  if (!value) return false;
  const trimmed = String(value).trim();
  return /^https?:\/\//i.test(trimmed) || /\.[a-z]{2,}$/i.test(trimmed);
}

function formatContactLabel(contact: any): string {
  if (!contact) return "Contact";
  if (contact.label) return String(contact.label).trim();
  if (contact.type) {
    const normalized = String(contact.type).replace(/_/g, " ").toLowerCase();
    return normalized.replace(/\b\w/g, (char) => char.toUpperCase());
  }
  return "Contact";
}

const CONTACT_ICONS: Record<string, IconComponent> = {
  email: Mail,
  mail: Mail,
  phone: Phone,
  mobile: Phone,
  whatsapp: MessageSquare,
  telegram: Rocket,
  location: MapPin,
  address: MapPin,
  website: Globe,
  portfolio: Globe,
  linkedin: Linkedin,
  github: Github,
  twitter: Twitter,
  x: Twitter,
  researchgate: BookOpen,
  googlescholar: BookOpen,
  scholar: BookOpen,
  orcid: BadgeCheck,
  personal: User,
};

function getContactIcon(type?: string): IconComponent {
  if (!type) return LinkIcon;
  const normalized = type.toLowerCase();
  return CONTACT_ICONS[normalized] ?? LinkIcon;
}

function buildContactEntries(cv: any): { primary: ContactEntry[]; secondary: ContactEntry[] } {
  const baseEntries: ContactEntry[] = [];

  // Handle email - split multiple emails if present
  if (cv?.email) {
    const emails = String(cv.email).split(/[,;]/).map(email => email.trim()).filter(Boolean);
    if (emails.length > 0) {
      baseEntries.push({
        key: "email",
        label: "Email",
        value: emails.join('\n'), // Join with newlines for multi-line display
        icon: Mail,
        href: emails.length === 1 ? `mailto:${emails[0]}` : undefined, // Only add href if single email
        isPrimary: true,
      });
    }
  }

  // Handle phone
  if (cv?.phone) {
    baseEntries.push({
      key: "phone",
      label: "Phone",
      value: cv.phone,
      icon: Phone,
      href: `tel:${cv.phone}`,
      isPrimary: true,
    });
  }

  // Handle location
  if (cv?.location) {
    baseEntries.push({
      key: "location",
      label: "Location",
      value: cv.location,
      icon: MapPin,
    });
  }

  // Handle website
  if (cv?.website) {
    baseEntries.push({
      key: "website",
      label: "Website",
      value: cv.website,
      icon: Globe,
      href: ensureProtocol(cv.website),
      isExternal: true,
    });
  }

  const builtInSocial: ContactEntry[] = [
    {
      key: "linkedin",
      label: "LinkedIn",
      value: cv?.linkedin,
      icon: Linkedin,
      href: ensureProtocol(cv?.linkedin),
      isExternal: true,
    },
    {
      key: "github",
      label: "GitHub",
      value: cv?.github,
      icon: Github,
      href: ensureProtocol(cv?.github),
      isExternal: true,
    },
    {
      key: "googleScholar",
      label: "Google Scholar",
      value: cv?.googleScholar,
      icon: BookOpen,
      href: ensureProtocol(cv?.googleScholar),
      isExternal: true,
    },
    {
      key: "twitter",
      label: "Twitter",
      value: cv?.twitter,
      icon: Twitter,
      href: ensureProtocol(cv?.twitter),
      isExternal: true,
    },
  ];

  const extraContacts = normalizeArray<any>(cv?.contactInfo).map((info, index) => {
    const type = info?.type ? String(info.type).toLowerCase() : undefined;
    const rawValue = info?.value ? String(info.value).trim() : "";
    const label = formatContactLabel(info);
    let href: string | undefined;

    if (type === "email") {
      href = rawValue ? `mailto:${rawValue}` : undefined;
    } else if (type === "phone" || type === "mobile") {
      href = rawValue ? `tel:${rawValue}` : undefined;
    } else if (isLikelyUrl(rawValue)) {
      href = ensureProtocol(rawValue);
    }

    return {
      key: info?.id ?? `contact-${index}`,
      label,
      value: rawValue,
      icon: getContactIcon(type ?? label),
      href,
      isExternal: Boolean(href && href.startsWith("http")),
      isPrimary: Boolean(info?.isPrimary),
    } as ContactEntry;
  });

  const socialLinks = normalizeArray<any>(cv?.socialLinks).map((link, index) => {
    const platform = String(link?.platform ?? "").toLowerCase();
    const label = formatContactLabel({ label: link?.label, type: platform || link?.platform });
    return {
      key: link?.id ?? `social-${platform || "link"}-${index}`,
      label,
      value: link?.url ? String(link.url).trim() : "",
      icon: getContactIcon(platform || label),
      href: ensureProtocol(link?.url),
      isExternal: true,
    } as ContactEntry;
  });

  const combined = [...baseEntries, ...builtInSocial, ...extraContacts, ...socialLinks];
  const deduped: ContactEntry[] = [];
  const seen = new Set<string>();

  combined.forEach((entry) => {
    const cleanValue = entry.value ? String(entry.value).trim() : "";
    if (!cleanValue) return;
    const uniqueKey = `${entry.label}|${cleanValue}`.toLowerCase();
    if (seen.has(uniqueKey)) return;
    seen.add(uniqueKey);
    deduped.push({ ...entry, value: cleanValue });
  });

  deduped.sort((a, b) => Number(Boolean(b.isPrimary)) - Number(Boolean(a.isPrimary)));

  return {
    primary: deduped.slice(0, 4),
    secondary: deduped.slice(4),
  };
}

function formatDateValue(theme: CVTheme, date: string | Date | null | undefined): string {
  if (!date) return "";
  const dateObject = new Date(date);
  if (Number.isNaN(dateObject.getTime())) {
    return typeof date === "string" ? date : "";
  }

  const format = theme.style?.dateFormat ?? "short";
  if (format === "numeric") {
    const month = (dateObject.getMonth() + 1).toString().padStart(2, "0");
    return `${month}/${dateObject.getFullYear()}`;
  }
  if (format === "long") {
    return dateObject.toLocaleString("default", { month: "long", year: "numeric" });
  }
  return dateObject.toLocaleString("default", { month: "short", year: "numeric" });
}

function transformHeading(theme: CVTheme, text: string): string {
  const mode = theme.typography.headingTransform ?? "uppercase";
  switch (mode) {
    case "lowercase":
      return text.toLowerCase();
    case "capitalize":
      return text.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
    case "first-capital":
      return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    case "uppercase":
      return text.toUpperCase();
    case "none":
    default:
      return text;
  }
}

function renderRichText(text: string, theme: CVTheme): ReactNode {
  if (!text.trim()) return null;

  return (
    <div
      className="prose prose-sm max-w-none"
      style={{
        color: theme.colors.textSecondary,
        fontFamily: theme.typography.bodyFont,
        fontSize: `${theme.typography.bodySize}px`,
        lineHeight: theme.typography.lineHeight ?? "1.5",
      }}
    >
      <ReactMarkdown
        components={{
          p: ({ children }) => (
            <p
              style={{
                margin: 0,
                padding: 0,
                color: theme.colors.textSecondary,
                fontFamily: theme.typography.bodyFont,
                fontSize: `${theme.typography.bodySize}px`,
                lineHeight: theme.typography.lineHeight ?? "1.5",
              }}
            >
              {children}
            </p>
          ),
          strong: ({ children }) => (
            <strong
              style={{
                fontWeight: "bold",
                color: theme.colors.textPrimary,
              }}
            >
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em
              style={{
                fontStyle: "italic",
                color: theme.colors.textSecondary,
              }}
            >
              {children}
            </em>
          ),
          ul: ({ children }) => (
            <ul
              style={{
                margin: "0.5em 0",
                paddingLeft: "1.5em",
                color: theme.colors.textSecondary,
                listStyleType: "disc",
              }}
            >
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol
              style={{
                margin: "0.5em 0",
                paddingLeft: "1.5em",
                color: theme.colors.textSecondary,
              }}
            >
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li
              style={{
                margin: "0.25em 0",
                color: theme.colors.textSecondary,
                fontFamily: theme.typography.bodyFont,
                fontSize: `${theme.typography.bodySize}px`,
                lineHeight: theme.typography.lineHeight ?? "1.5",
              }}
            >
              {children}
            </li>
          ),
          a: ({ children, href }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: theme.colors.secondary,
                textDecoration: 'underline',
              }}
            >
              {children}
            </a>
          ),
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}

function renderPlainTextBlock(text: string, theme: CVTheme): ReactNode {
  if (!text.trim()) return null;

  return (
    <div
      className="prose prose-sm max-w-none"
      style={{
        color: theme.colors.textSecondary,
        fontFamily: theme.typography.bodyFont,
        fontSize: `${theme.typography.bodySize}px`,
        lineHeight: theme.typography.lineHeight ?? "1.5",
      }}
    >
      <ReactMarkdown
        components={{
          p: ({ children }) => (
            <p
              style={{
                margin: 0,
                padding: 0,
                color: theme.colors.textSecondary,
                fontFamily: theme.typography.bodyFont,
                fontSize: `${theme.typography.bodySize}px`,
                lineHeight: theme.typography.lineHeight ?? "1.5",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                overflowWrap: "anywhere",
              }}
            >
              {children}
            </p>
          ),
          strong: ({ children }) => (
            <strong
              style={{
                fontWeight: "bold",
                color: theme.colors.textPrimary,
              }}
            >
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em
              style={{
                fontStyle: "italic",
                color: theme.colors.textSecondary,
              }}
            >
              {children}
            </em>
          ),
          ul: ({ children }) => (
            <ul
              style={{
                margin: "0.5em 0",
                paddingLeft: "1.5em",
                color: theme.colors.textSecondary,
              }}
            >
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol
              style={{
                margin: "0.5em 0",
                paddingLeft: "1.5em",
                color: theme.colors.textSecondary,
              }}
            >
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li
              style={{
                margin: "0.25em 0",
                color: theme.colors.textSecondary,
                fontFamily: theme.typography.bodyFont,
                fontSize: `${theme.typography.bodySize}px`,
                lineHeight: theme.typography.lineHeight ?? "1.5",
              }}
            >
              {children}
            </li>
          ),
          a: ({ children, href }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: theme.colors.secondary,
                textDecoration: 'underline',
              }}
            >
              {children}
            </a>
          ),
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}

function groupBy<T>(items: T[], getKey: (item: T) => string): Record<string, T[]> {
  return items.reduce<Record<string, T[]>>((accumulator, item) => {
    const key = getKey(item) || "General";
    if (!accumulator[key]) {
      accumulator[key] = [];
    }
    accumulator[key].push(item);
    return accumulator;
  }, {});
}

function buildSectionOrder(cv: any, customSections: any[]): SectionOrderItem[] {
  const parsed = parseJSONField<SectionOrderItem[]>(cv?.sectionOrder) || [];
  if (parsed.length) {
    return parsed
      .filter((item) => item.enabled !== false)
      .map((item) => {
        if (item.isCustom) {
          return item;
        }
        const custom = customSections.find(
          (section) => section?.id === item.id || section?.title === item.title,
        );
        if (custom) {
          return {
            ...item,
            id: custom.id || item.id,
            title: custom.title || item.title,
            isCustom: true,
          };
        }
        return item;
      });
  }

  const defaults: SectionOrderItem[] = [
    { id: "experience" },
    { id: "education" },
    { id: "projects" },
    { id: "skills" },
    { id: "certifications" },
    { id: "awards" },
    { id: "languages" },
    { id: "publications" },
    { id: "references" },
  ];

  const customOrder = customSections.map((section, index) => ({
    id: section?.id || section?.title || `custom-${index}`,
    title: section?.title,
    isCustom: true,
  }));

  return [...defaults, ...customOrder];
}

export function CVPreviewContent({ cv, themeId, layoutId, customTheme, staticMode = false }: CVPreviewProps) {
  const baseTheme = getTheme(themeId ?? cv?.theme ?? "modern-blue");
  const theme = mergeTheme(baseTheme, customTheme);
  const layout = CV_LAYOUTS.find((item) => item.id === (layoutId ?? cv?.layout)) ?? CV_LAYOUTS[0];
  const themeData = parseJSONField<Record<string, any>>(cv?.themeData) || {};
  const photoPlacement = (cv?.photoPlacement || themeData?.photoPlacement || "left") as
    | "left"
    | "right"
    | "top"
    | "none";

  const customSections = normalizeArray<any>(cv?.customSections);
  const sectionOrder = buildSectionOrder(cv, customSections);
  const contacts = buildContactEntries(cv);
  const sectionSpacingClass = getSpacingClass(layout.spacing);
  const sectionSpacingValue = theme.layout.spacing ?? 24;
  const contentPaddingRaw = theme.layout.sectionPadding ?? 24;
  const contentPadding =
    typeof contentPaddingRaw === "number" ? `${contentPaddingRaw}px` : contentPaddingRaw;

  const citationStyle = (cv?.citationStyle || "APA") as CitationStyle;
  const showNumbering = Boolean(cv?.showNumbering);

  const renderContactCard = (entry: ContactEntry) => {
    const Wrapper = (entry.href ? "a" : "div") as "a" | "div";
    const wrapperProps = entry.href
      ? {
          href: entry.href,
          target: entry.isExternal ? "_blank" : undefined,
          rel: entry.isExternal ? "noreferrer" : undefined,
        }
      : {};
    return (
      <Wrapper
        key={entry.key}
        className="flex min-w-0 items-center gap-3 rounded-lg border px-3 py-2 text-sm transition hover:opacity-90"
        style={{
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.surface,
          color: theme.colors.textPrimary,
        }}
        {...(wrapperProps as Record<string, unknown>)}
      >
        <span
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md"
          style={{
            backgroundColor: theme.colors.primaryLight,
            color: theme.colors.primary,
          }}
        >
          <entry.icon className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <div
            className="text-[11px] uppercase tracking-wide"
            style={{
              color: theme.colors.textSecondary,
              fontFamily: theme.typography.bodyFont,
            }}
          >
            {entry.label}
          </div>
          <div
            className="text-sm font-medium whitespace-pre-line break-words"
            style={{
              color: theme.colors.textPrimary,
              fontFamily: theme.typography.bodyFont,
            }}
            title={entry.value}
          >
            {entry.value}
          </div>
        </div>
      </Wrapper>
    );
  };

  const renderContactChip = (entry: ContactEntry) => {
    const Wrapper = (entry.href ? "a" : "div") as "a" | "div";
    const wrapperProps = entry.href
      ? {
          href: entry.href,
          target: entry.isExternal ? "_blank" : undefined,
          rel: entry.isExternal ? "noreferrer" : undefined,
        }
      : {};
    return (
      <Wrapper
        key={entry.key}
        className="flex items-center gap-2 rounded-full border px-3 py-1 text-xs"
        style={{
          borderColor: theme.colors.border,
          color: theme.colors.secondary,
          fontFamily: theme.typography.bodyFont,
        }}
        {...(wrapperProps as Record<string, unknown>)}
      >
        <entry.icon className="h-3.5 w-3.5" />
        <span className="truncate" title={entry.value}>
          {entry.value}
        </span>
      </Wrapper>
    );
  };

  const renderPhoto = () => {
    if (!cv?.profileImage || theme.showPhoto === false || photoPlacement === "none") {
      return null;
    }

    const baseSize = PHOTO_SIZES[theme.photoSize ?? "medium"] ?? PHOTO_SIZES.medium;
    const aspectMultiplier = PHOTO_ASPECTS[theme.photoAspect ?? "square"] ?? 1;
    
    const width = baseSize;
    const height = Math.round(baseSize * aspectMultiplier);
    
    // For circle shape, use square dimensions
    const isCircle = theme.style.profileImageShape === "circle";
    const finalWidth = width;
    const finalHeight = isCircle ? width : height;
    
    const borderRadius =
      isCircle
        ? "50%"
        : theme.style.profileImageShape === "rounded"
        ? "16px"
        : "6px";

    return (
      <div
        className="flex-shrink-0 overflow-hidden"
        style={{
          width: finalWidth,
          height: finalHeight,
          minWidth: finalWidth,
          minHeight: finalHeight,
          borderRadius,
          border: `${theme.photoBorderWidth ?? 2}px solid ${theme.photoBorderColor ?? "#ffffff"}`,
          boxShadow: theme.photoShadow ? "0 10px 24px rgba(15, 23, 42, 0.18)" : "none",
        }}
      >
        <img
          src={cv.profileImage}
          alt={cv.fullName || "Profile photo"}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center center",
            filter: theme.photoGrayscale ? "grayscale(100%)" : "none",
          }}
        />
      </div>
    );
  };

  const renderHeader = () => {
    const photo = renderPhoto();
    const headline = cv?.headline ? String(cv.headline).trim() : "";
    const summary = cv?.summary ? String(cv.summary).trim() : "";

    const headerLayoutClass =
      photoPlacement === "top"
        ? "flex flex-col items-center gap-2 text-center"
        : "flex items-center gap-3 sm:gap-4";

    const headerTextAlignment = photoPlacement === "top" ? "text-center" : "text-left";

    const headerBackground =
      theme.style.headerStyle === "solid"
        ? theme.colors.primaryLight
        : theme.style.headerStyle === "gradient"
        ? `linear-gradient(135deg, ${theme.colors.secondary}, ${theme.colors.primary})`
        : theme.colors.surface;

    return (
      <header
        className="border-b"
        style={{
          background: headerBackground,
          borderColor: theme.colors.border,
          padding: `${theme.layout.headerPadding}px`,
          paddingBottom: `${Math.max(theme.layout.headerPadding - 4, 12)}px`,
        }}
      >
        <div className={headerLayoutClass}>
          {photo && <div className="flex-shrink-0">{photo}</div>}
          <div className={`flex min-w-0 flex-col gap-1 ${headerTextAlignment}`}>
            <h1
              className="font-semibold tracking-tight"
              style={{
                fontFamily: theme.typography.headingFont,
                fontSize: `${theme.typography.nameSize}px`,
                letterSpacing: theme.typography.letterSpacing,
                color: theme.colors.primary,
                wordBreak: "break-word",
                overflowWrap: "anywhere",
              }}
            >
              {cv?.fullName || "Your Name"}
            </h1>
            {headline && (
              <div
                className="prose prose-sm max-w-none text-sm font-medium"
                style={{
                  fontFamily: theme.typography.bodyFont,
                  fontSize: `${Math.max(theme.typography.bodySize, 11)}px`,
                  color: theme.colors.textSecondary,
                  wordBreak: "break-word",
                  overflowWrap: "anywhere",
                }}
              >
                <ReactMarkdown
                  components={{
                    p: ({ children }) => (
                      <p
                        style={{
                          margin: 0,
                          padding: 0,
                          fontFamily: theme.typography.bodyFont,
                          fontSize: `${Math.max(theme.typography.bodySize, 11)}px`,
                          color: theme.colors.textSecondary,
                          wordBreak: "break-word",
                          overflowWrap: "anywhere",
                        }}
                      >
                        {children}
                      </p>
                    ),
                    strong: ({ children }) => (
                      <strong
                        style={{
                          fontWeight: "bold",
                          color: theme.colors.textPrimary,
                        }}
                      >
                        {children}
                      </strong>
                    ),
                    em: ({ children }) => (
                      <em
                        style={{
                          fontStyle: "italic",
                          color: theme.colors.textSecondary,
                        }}
                      >
                        {children}
                      </em>
                    ),
                  }}
                >
                  {headline}
                </ReactMarkdown>
              </div>
            )}
            {summary && renderPlainTextBlock(summary, theme)}
          </div>
        </div>
        {contacts.primary.length > 0 && (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {contacts.primary.map(renderContactCard)}
          </div>
        )}
        {contacts.secondary.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {contacts.secondary.map(renderContactChip)}
          </div>
        )}
      </header>
    );
  };

  const renderSectionWrapper = (
    sectionId: string,
    title: string,
    orderIndex: number,
    content: ReactNode,
  ): ReactNode => {
    const nodes = Children.toArray(content).filter(Boolean);
    if (nodes.length === 0) return null;
    return (
      <section
        key={sectionId}
        className="flex flex-col gap-3"
        style={{
          paddingBottom: theme.style.sectionDividers ? sectionSpacingValue / 2 : 0,
          borderBottom: theme.style.sectionDividers
            ? `1px solid ${theme.colors.border}`
            : undefined,
        }}
      >
        <div className="flex items-center gap-3">
          {showNumbering && (
            <span
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold"
              style={{
                backgroundColor: theme.colors.secondary + '20', // secondary with opacity
                color: theme.colors.secondary,
                fontFamily: theme.typography.headingFont,
              }}
            >
              {String(orderIndex + 1).padStart(2, "0")}
            </span>
          )}
          <h2
            className={`text-base tracking-wide ${
              theme.style.headingStyle === 'bold' ? 'font-bold' :
              theme.style.headingStyle === 'underline' ? 'underline' :
              theme.style.headingStyle === 'background' ? 'bg-primary/10 px-2 py-1 rounded' :
              'font-semibold'
            }`}
            style={{
              fontFamily: theme.typography.headingFont,
              fontSize: `${theme.typography.sectionTitleSize}px`,
              letterSpacing: theme.typography.letterSpacing,
              color: theme.colors.primary,
              ...(theme.style.headingStyle === 'background' ? {
                backgroundColor: theme.colors.primaryLight,
                color: theme.colors.primary,
              } : {}),
            }}
          >
            {transformHeading(theme, title)}
          </h2>
        </div>
        <div className="space-y-3">{nodes}</div>
      </section>
    );
  };

  const renderExperienceSection = (orderIndex: number) => {
    const experienceItems = pickFirstArray<any>(
      cv?.experience,
      cv?.experiences,
      cv?.workExperience,
    ).filter((item) => item && (item?.title || item?.company || item?.summary || item?.description));

    if (!experienceItems.length) return null;

    const content = experienceItems.map((item, index) => {
      const title = item?.title || item?.position || "Role";
      const company = item?.company || item?.organization || "";
      const location = item?.location || item?.city || "";
      const start = formatDateValue(theme, item?.startDate);
      const end = item?.isCurrent ? "Present" : formatDateValue(theme, item?.endDate);
      const dateRange = [start, end].filter(Boolean).join(" - ");
      const summaryBlock = item?.summary ? renderPlainTextBlock(String(item.summary), theme) : null;
      const descriptionBlock = item?.description
        ? renderPlainTextBlock(String(item.description), theme)
        : null;
      const highlights = Array.isArray(item?.highlights)
        ? item.highlights.filter(Boolean).map((point: any) => String(point))
        : [];
      const highlightsBlock = highlights.length
        ? renderRichText(highlights.join("\n"), theme)
        : null;

      return (
        <div
          key={item?.id ?? `experience-${index}`}
          className="space-y-2 avoid-page-break"
        >
          <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
            <div>
              <h3
                className="text-sm font-semibold"
                style={{
                  color: theme.colors.textPrimary,
                  fontFamily: theme.typography.headingFont,
                  fontSize: `${Math.max(theme.typography.entryTitleSize, 12)}px`,
                }}
              >
                {title}
              </h3>
              {company && (
                <div
                  className="text-sm font-medium"
                  style={{
                    color: theme.colors.textSecondary,
                    fontFamily: theme.typography.bodyFont,
                  }}
                >
                  {company}
                </div>
              )}
              {location && (
                <div
                  className="text-xs"
                  style={{
                    color: theme.colors.textSecondary,
                    fontFamily: theme.typography.bodyFont,
                  }}
                >
                  {location}
                </div>
              )}
            </div>
            {dateRange && (
              <div
                className="text-xs font-medium"
                style={{
                  color: theme.colors.textSecondary,
                  fontFamily: theme.typography.bodyFont,
                }}
              >
                {dateRange}
              </div>
            )}
          </div>
          <div className="space-y-2">
            {summaryBlock}
            {descriptionBlock}
            {highlightsBlock}
          </div>
        </div>
      );
    });

    return renderSectionWrapper(
      "experience",
      "Experience",
      orderIndex,
      content,
    );
  };

  const renderEducationSection = (orderIndex: number) => {
    const educationItems = pickFirstArray<any>(cv?.education, cv?.educations).filter(
      (item) => item && (item?.school || item?.degree || item?.field),
    );
    if (!educationItems.length) return null;

    const content = educationItems.map((item, index) => {
      const degree = item?.degree || item?.qualification || "";
      const field = item?.field || item?.fieldOfStudy || "";
      const school = item?.school || item?.institution || item?.university || "";
      const start = formatDateValue(theme, item?.startDate);
      const end = item?.isCurrent ? "Present" : formatDateValue(theme, item?.endDate);
      const dateRange = [start, end].filter(Boolean).join(" - ");
      const grade = item?.grade || item?.gpa;
      const descriptionBlock = item?.description
        ? renderPlainTextBlock(String(item.description), theme)
        : null;

      return (
        <div
          key={item?.id ?? `education-${index}`}
          className="space-y-2 avoid-page-break"
        >
          <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
            <div>
              <h3
                className="text-sm font-semibold"
                style={{
                  color: theme.colors.textPrimary,
                  fontFamily: theme.typography.headingFont,
                  fontSize: `${Math.max(theme.typography.entryTitleSize, 12)}px`,
                }}
              >
                {[degree, field].filter(Boolean).join(" in ") || "Education"}
              </h3>
              {school && (
                <div
                  className="text-sm font-medium"
                  style={{
                    color: theme.colors.textSecondary,
                    fontFamily: theme.typography.bodyFont,
                  }}
                >
                  {school}
                </div>
              )}
            </div>
            <div className="flex flex-col items-end gap-1 text-xs font-medium" style={{ color: theme.colors.textSecondary, fontFamily: theme.typography.bodyFont }}>
              {dateRange && <span>{dateRange}</span>}
              {grade && <span>{grade}</span>}
            </div>
          </div>
          {descriptionBlock}
        </div>
      );
    });

    return renderSectionWrapper("education", "Education", orderIndex, content);
  };

  const renderProjectsSection = (orderIndex: number) => {
    const projects = pickFirstArray<any>(cv?.projects, cv?.projectExperience).filter(
      (item) => item && (item?.name || item?.title || item?.summary),
    );
    if (!projects.length) return null;

    const content = projects.map((item, index) => {
      const name = item?.name || item?.title || "Project";
      const role = item?.role ? String(item.role) : "";
      const descriptionBlock = item?.description
        ? renderPlainTextBlock(String(item.description), theme)
        : item?.summary
        ? renderPlainTextBlock(String(item.summary), theme)
        : null;
      const highlights = Array.isArray(item?.highlights)
        ? item.highlights.filter(Boolean).map((point: any) => String(point))
        : [];
      const highlightsBlock = highlights.length
        ? renderRichText(highlights.join("\n"), theme)
        : null;
      const link = item?.url || item?.link;

      return (
        <div
          key={item?.id ?? `project-${index}`}
          className="space-y-2 avoid-page-break"
        >
          <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
            <div>
              <h3
                className="text-sm font-semibold"
                style={{
                  color: theme.colors.textPrimary,
                  fontFamily: theme.typography.headingFont,
                  fontSize: `${Math.max(theme.typography.entryTitleSize, 12)}px`,
                }}
              >
                {name}
              </h3>
              {role && (
                <div
                  className="text-xs uppercase tracking-wide"
                  style={{
                    color: theme.colors.textSecondary,
                    fontFamily: theme.typography.bodyFont,
                  }}
                >
                  {role}
                </div>
              )}
            </div>
            {link && (
              <a
                href={ensureProtocol(link)}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-medium"
                style={{
                  color: theme.colors.secondary,
                  fontFamily: theme.typography.bodyFont,
                }}
              >
                {ensureProtocol(link)}
              </a>
            )}
          </div>
          <div className="space-y-2">
            {descriptionBlock}
            {highlightsBlock}
          </div>
        </div>
      );
    });

    return renderSectionWrapper("projects", "Projects", orderIndex, content);
  };

  const renderSkillsSection = (orderIndex: number) => {
    const skillsRaw = pickFirstArray<any>(cv?.skills, cv?.skillGroups, cv?.skillsSummary);
    const normalized = skillsRaw
      .map((item: any) => {
        if (!item) return null;
        if (typeof item === "string") {
          return { name: item, category: "General" };
        }
        const name = item?.name || item?.skill || item?.title || "";
        if (!name) return null;
        return {
          name,
          category: item?.category || item?.group || "General",
          level: item?.level || item?.proficiency,
          details: item?.details || item?.description,
        };
      })
      .filter(Boolean) as Array<{ name: string; category?: string; level?: string; details?: string }>;

    if (!normalized.length) return null;

    const grouped = groupBy(normalized, (skill) => skill.category || "General");

    const content = Object.entries(grouped).map(([category, items]) => {
      const details = items.filter((item) => item.details);
      return (
        <div key={category} className="space-y-2">
          {category !== "General" && (
            <h3
              className="text-sm font-semibold"
              style={{
                color: theme.colors.textPrimary,
                fontFamily: theme.typography.bodyFont,
              }}
            >
              {category}
            </h3>
          )}
          <div className={theme.style.skillPills ? "flex flex-wrap gap-2" : "space-y-1"}>
            {items.map((skill, index) => (
              theme.style.skillPills ? (
                <span
                  key={`${category}-${skill.name}-${index}`}
                  className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs"
                  style={{
                    borderColor: theme.colors.border,
                    backgroundColor: theme.colors.surface,
                    color: theme.colors.textSecondary,
                    fontFamily: theme.typography.bodyFont,
                  }}
                >
                  <span className="font-medium" style={{ color: theme.colors.textPrimary }}>
                    {skill.name}
                  </span>
                  {skill.level && (
                    <span
                      className="text-[11px]"
                      style={{
                        color: theme.colors.textSecondary,
                      }}
                    >
                      {skill.level}
                    </span>
                  )}
                </span>
              ) : (
                <div
                  key={`${category}-${skill.name}-${index}`}
                  className="text-sm"
                  style={{
                    color: theme.colors.textSecondary,
                    fontFamily: theme.typography.bodyFont,
                  }}
                >
                  <span className="font-medium" style={{ color: theme.colors.textPrimary }}>
                    {skill.name}
                  </span>
                  {skill.level && (
                    <span className="ml-2 text-xs">
                      ({skill.level})
                    </span>
                  )}
                </div>
              )
            ))}
          </div>
          {details.length > 0 && (
            <div className="space-y-1 text-sm" style={{ color: theme.colors.textSecondary }}>
              {details.map((skill, index) => (
                <div key={`detail-${category}-${index}`}>
                  <span className="font-medium" style={{ color: theme.colors.textPrimary }}>
                    {skill.name}:
                  </span>{" "}
                  {skill.details}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    });

    return renderSectionWrapper("skills", "Skills", orderIndex, content);
  };

  const renderCertificationsSection = (orderIndex: number) => {
    const certifications = pickFirstArray<any>(cv?.certifications).filter(
      (item) => item && (item?.name || item?.title || item?.issuer),
    );
    if (!certifications.length) return null;

    const content = certifications.map((item, index) => {
      const name = item?.name || item?.title || "Certification";
      const issuer = item?.issuer || item?.organization || "";
      const date = formatDateValue(theme, item?.dateAwarded || item?.date);
      const credential = item?.credentialId || item?.licenseNumber;
      const descriptionBlock = item?.description
        ? renderPlainTextBlock(String(item.description), theme)
        : null;

      return (
        <div
          key={item?.id ?? `cert-${index}`}
          className="space-y-2 avoid-page-break"
        >
          <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
            <div>
              <h3
                className="text-sm font-semibold"
                style={{
                  color: theme.colors.textPrimary,
                  fontFamily: theme.typography.headingFont,
                }}
              >
                {name}
              </h3>
              {issuer && (
                <div
                  className="text-xs uppercase tracking-wide"
                  style={{
                    color: theme.colors.textSecondary,
                    fontFamily: theme.typography.bodyFont,
                  }}
                >
                  {issuer}
                </div>
              )}
            </div>
            <div className="flex flex-col items-end gap-1 text-xs font-medium" style={{ color: theme.colors.textSecondary }}>
              {date && <span>{date}</span>}
              {credential && <span>ID: {credential}</span>}
            </div>
          </div>
          {descriptionBlock}
        </div>
      );
    });

    return renderSectionWrapper("certifications", "Certifications", orderIndex, content);
  };

  const renderAwardsSection = (orderIndex: number) => {
    const awards = pickFirstArray<any>(cv?.awards, cv?.honors).filter(
      (item) => item && (item?.title || item?.name || item?.issuer),
    );
    if (!awards.length) return null;

    const content = awards.map((item, index) => {
      const title = item?.title || item?.name || "Award";
      const issuer = item?.issuer || item?.organization || "";
      const date = formatDateValue(theme, item?.date) || item?.year;
      const descriptionBlock = item?.description
        ? renderPlainTextBlock(String(item.description), theme)
        : null;

      return (
        <div
          key={item?.id ?? `award-${index}`}
          className="space-y-2 avoid-page-break"
        >
          <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
            <div>
              <h3
                className="text-sm font-semibold"
                style={{
                  color: theme.colors.textPrimary,
                  fontFamily: theme.typography.headingFont,
                }}
              >
                {title}
              </h3>
              {issuer && (
                <div
                  className="text-xs uppercase tracking-wide"
                  style={{
                    color: theme.colors.textSecondary,
                    fontFamily: theme.typography.bodyFont,
                  }}
                >
                  {issuer}
                </div>
              )}
            </div>
            {date && (
              <div
                className="text-xs font-medium"
                style={{
                  color: theme.colors.textSecondary,
                  fontFamily: theme.typography.bodyFont,
                }}
              >
                {date}
              </div>
            )}
          </div>
          {descriptionBlock}
        </div>
      );
    });

    return renderSectionWrapper("awards", "Awards", orderIndex, content);
  };

  const renderLanguagesSection = (orderIndex: number) => {
    const languages = pickFirstArray<any>(cv?.languages, cv?.languageSkills).reduce<
      Array<{ language: string; proficiency?: string }>
    >((accumulator, item) => {
      if (!item) return accumulator;
      if (typeof item === "string") {
        accumulator.push({ language: item, proficiency: "" });
        return accumulator;
      }
      const language = item?.language || item?.name;
      if (!language) return accumulator;
      accumulator.push({ language, proficiency: item?.proficiency || item?.level });
      return accumulator;
    }, []);

    if (!languages.length) return null;

    const content = (
      <div className="flex flex-wrap gap-2">
        {languages.map((item, index) => (
          <span
            key={`${item.language}-${index}`}
            className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs"
            style={{
              borderColor: theme.colors.border,
              color: theme.colors.textSecondary,
              backgroundColor: theme.colors.surface,
              fontFamily: theme.typography.bodyFont,
            }}
          >
            <span className="font-medium" style={{ color: theme.colors.textPrimary }}>
              {item.language}
            </span>
            {item.proficiency && <span>{item.proficiency}</span>}
          </span>
        ))}
      </div>
    );

    return renderSectionWrapper("languages", "Languages", orderIndex, content);
  };

  const renderPublicationsSection = (orderIndex: number) => {
    const publications = pickFirstArray<any>(cv?.publications).filter(
      (item) => item && (item?.title || item?.citation || item?.authors),
    );
    if (!publications.length) return null;

    const content = (
      <ol className="list-decimal space-y-3 pl-5">
        {publications.map((item, index) => {
          const formattedCitation = item?.citation
            ? String(item.citation)
            : formatCitation(item, citationStyle);
          return (
            <li
              key={item?.id ?? `publication-${index}`}
              style={{
                color: theme.colors.textSecondary,
                fontFamily: theme.typography.bodyFont,
                fontSize: `${theme.typography.bodySize}px`,
                lineHeight: theme.typography.lineHeight ?? "1.5",
              }}
            >
              {formattedCitation}
            </li>
          );
        })}
      </ol>
    );

    return renderSectionWrapper("publications", "Publications", orderIndex, content);
  };

  const renderReferencesSection = (orderIndex: number) => {
    // Check if "available on request" is enabled
    if (cv?.referencesAvailableOnRequest) {
      const content = (
        <div
          className="text-sm italic"
          style={{
            color: theme.colors.textSecondary,
            fontFamily: theme.typography.bodyFont,
          }}
        >
          Available upon request
        </div>
      );
      return renderSectionWrapper("references", "References", orderIndex, content);
    }

    const references = pickFirstArray<any>(cv?.references, cv?.referees).filter(
      (item) => item && (item?.name || item?.email || item?.phone),
    );
    if (!references.length) return null;

    const content = references.map((item, index) => {
      const name = item?.name || item?.fullName || "Reference";
      const title = item?.title || item?.position || "";
      const company = item?.company || item?.organization || "";
      const email = item?.email ? String(item.email) : "";
      const phone = item?.phone ? String(item.phone) : "";

      return (
        <div
          key={item?.id ?? `reference-${index}`}
          className="space-y-1 text-sm avoid-page-break"
        >
          <div
            className="font-semibold"
            style={{
              color: theme.colors.textPrimary,
              fontFamily: theme.typography.headingFont,
            }}
          >
            {name}
          </div>
          <div
            className="text-xs uppercase tracking-wide"
            style={{
              color: theme.colors.textSecondary,
              fontFamily: theme.typography.bodyFont,
            }}
          >
            {[title, company].filter(Boolean).join(" | ")}
          </div>
          <div className="flex flex-wrap gap-3 text-xs" style={{ color: theme.colors.textSecondary }}>
            {email && <span>Email: {email}</span>}
            {phone && <span>Phone: {phone}</span>}
          </div>
        </div>
      );
    });

    return renderSectionWrapper("references", "References", orderIndex, content);
  };

  const renderCustomSection = (sectionData: any, orderIndex: number) => {
    if (!sectionData) return null;
    const sectionId = sectionData?.id || sectionData?.title || `custom-${orderIndex}`;
    const title = sectionData?.title || "Custom Section";

    const items = normalizeArray<any>(sectionData?.items).filter((item) =>
      item && (item?.title || item?.label || item?.content || item?.description),
    );

    let content: ReactNode = null;

    if (items.length) {
      content = items.map((item, index) => {
        const itemTitle = item?.title || item?.label || "";
        const itemSubtitle = item?.subtitle || item?.meta || "";
        const itemDescription = item?.content || item?.description || item?.value || "";
        const details = Array.isArray(item?.details)
          ? item.details.filter(Boolean).map((detail: any) => String(detail)).join("\n")
          : "";

        return (
          <div
            key={item?.id ?? `custom-${sectionId}-${index}`}
            className="space-y-1 avoid-page-break"
          >
            {itemTitle && (
              <h3
                className="text-sm font-semibold"
                style={{
                  color: theme.colors.textPrimary,
                  fontFamily: theme.typography.headingFont,
                }}
              >
                {itemTitle}
              </h3>
            )}
            {itemSubtitle && (
              <div
                className="text-xs uppercase tracking-wide"
                style={{
                  color: theme.colors.textSecondary,
                  fontFamily: theme.typography.bodyFont,
                }}
              >
                {itemSubtitle}
              </div>
            )}
            {itemDescription && renderPlainTextBlock(String(itemDescription), theme)}
            {details && renderRichText(details, theme)}
          </div>
        );
      });
    } else if (sectionData?.content) {
      content = renderPlainTextBlock(String(sectionData.content), theme);
    } else if (sectionData?.description) {
      content = renderPlainTextBlock(String(sectionData.description), theme);
    }

    if (!content) return null;

    return renderSectionWrapper(sectionId, title, orderIndex, content);
  };

  const renderSection = (section: SectionOrderItem, orderIndex: number): ReactNode | null => {
    const normalizedId = (section.id || section.title || "").toLowerCase();
    switch (normalizedId) {
      case "summary":
      case "objective":
      case "about": {
        const summaryText = cv?.summary ? String(cv.summary).trim() : "";
        if (!summaryText) return null;
        return renderSectionWrapper(
          section.id ?? "summary",
          section.title || "Summary",
          orderIndex,
          renderPlainTextBlock(summaryText, theme),
        );
      }
      case "experience":
      case "work experience":
      case "employment":
        return renderExperienceSection(orderIndex);
      case "education":
        return renderEducationSection(orderIndex);
      case "projects":
        return renderProjectsSection(orderIndex);
      case "skills":
        return renderSkillsSection(orderIndex);
      case "certifications":
      case "licenses":
        return renderCertificationsSection(orderIndex);
      case "awards":
      case "honors":
        return renderAwardsSection(orderIndex);
      case "languages":
        return renderLanguagesSection(orderIndex);
      case "publications":
        return renderPublicationsSection(orderIndex);
      case "references":
      case "referees":
        return renderReferencesSection(orderIndex);
      default: {
        const custom = customSections.find(
          (item) =>
            item?.id === section.id ||
            (section.title && item?.title && item.title.toLowerCase() === section.title.toLowerCase()),
        );
        if (custom || section.isCustom) {
          return renderCustomSection(custom ?? section, orderIndex);
        }
        return null;
      }
    }
  };

  const renderedSections: ReactNode[] = [];
  let visibleIndex = 0;
  sectionOrder.forEach((section) => {
    const node = renderSection(section, visibleIndex);
    if (node) {
      renderedSections.push(node);
      visibleIndex += 1;
    }
  });

  const containerClassName = staticMode
    ? "flex w-full flex-col overflow-hidden rounded-lg border shadow-sm"
    : "flex h-full w-full flex-col overflow-hidden rounded-lg border shadow-sm";

  const contentWrapperClassName = staticMode ? undefined : "flex-1 overflow-auto";

  return (
    <div
      className={containerClassName}
      style={{
        backgroundColor: theme.colors.background,
        color: theme.colors.textPrimary,
        borderColor: theme.colors.border,
        fontFamily: theme.typography.bodyFont,
      }}
    >
      {renderHeader()}
      <div
        className={contentWrapperClassName}
        style={{
          backgroundColor: theme.colors.background,
          padding: contentPadding,
        }}
      >
        <div className={`flex flex-col ${sectionSpacingClass}`}>
          {renderedSections.length > 0 ? (
            renderedSections
          ) : (
            <div
              className="rounded-lg border border-dashed p-8 text-center text-sm"
              style={{
                borderColor: theme.colors.border,
                color: theme.colors.textSecondary,
                backgroundColor: theme.colors.surface,
              }}
            >
              Add sections to your CV to see them previewed here.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
