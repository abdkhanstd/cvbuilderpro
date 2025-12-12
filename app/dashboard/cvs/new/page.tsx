"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  FileText,
  Briefcase,
  GraduationCap,
  Sparkles,
  Palette,
  Cpu,
  Gem,
  Moon,
  type LucideIcon,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CVPreview } from "@/components/cv/cv-preview";
import { getLayoutById } from "@/lib/cv-layouts";
import { getTheme, CVTheme, CV_THEMES } from "@/lib/cv-themes";

type TemplateOption = {
  id:
    | "MODERN"
    | "PROFESSIONAL"
    | "ACADEMIC"
    | "MINIMAL"
    | "CREATIVE"
    | "TECHNICAL"
    | "ELEGANT"
    | "DARK";
  name: string;
  description: string;
  icon: LucideIcon;
  layoutId: string;
  themeId: string;
  accent: string;
  headline: string;
  summary: string;
  persona: string;
  themeOptions?: string[];
  layoutOptions?: string[];
};

type ProfileResponse = {
  user: {
    name: string;
    email: string;
    image: string | null;
  };
  profile: {
    phone: string;
    location: string;
    website: string;
    bio: string;
    profileImage: string;
    linkedin: string;
    googleScholar: string;
    orcid: string;
    researchGate: string;
    github: string;
    twitter: string;
    hIndex?: number | null;
    totalCitations?: number | null;
  };
};

type BuildPreviewContext = {
  sessionUser?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  profile?: ProfileResponse["profile"] | null;
};

type PhotoPlacement = "left" | "right" | "top" | "none";

const templates: TemplateOption[] = [
  {
    id: "MODERN",
    name: "Modern",
    description: "Clean and contemporary design",
    icon: Sparkles,
    layoutId: "modern-two-column",
    themeId: "modern-blue",
    accent: "#2563eb",
    headline: "Lead Product Designer",
    summary: "Product designer blending research, strategy, and interaction design for intuitive enterprise software.",
    persona: "Product & UX professionals",
    themeOptions: ["modern-blue", "minimal-gray", "tech-cyan"],
    layoutOptions: ["modern-two-column", "classic-single", "minimal-clean"],
  },
  {
    id: "PROFESSIONAL",
    name: "Professional",
    description: "Classic executive layout",
    icon: Briefcase,
    layoutId: "executive-sidebar-left",
    themeId: "professional-green",
    accent: "#047857",
    headline: "Operations & Strategy Executive",
    summary: "Operator specializing in scalable processes, high-performing teams, and sustainable growth playbooks.",
    persona: "Business & operations leaders",
    themeOptions: ["professional-green", "warm-amber", "bold-red"],
    layoutOptions: ["executive-sidebar-left", "executive-sidebar-right", "classic-single"],
  },
  {
    id: "ACADEMIC",
    name: "Academic",
    description: "Perfect for academia and research",
    icon: GraduationCap,
    layoutId: "academic-timeline",
    themeId: "classic-indigo",
    accent: "#4338ca",
    headline: "Associate Professor · Computer Vision",
    summary: "Researcher focusing on embodied AI, geometric deep learning, and collaborative robotics.",
    persona: "Faculty, researchers, PhD candidates",
    themeOptions: ["classic-indigo", "modern-blue", "minimal-gray"],
    layoutOptions: ["academic-timeline", "classic-single", "modern-two-column"],
  },
  {
    id: "MINIMAL",
    name: "Minimal",
    description: "Simple and elegant",
    icon: FileText,
    layoutId: "minimal-clean",
    themeId: "minimal-gray",
    accent: "#1f2937",
    headline: "Product Analytics Lead",
    summary: "Product analyst translating data into roadmap decisions and crisp KPI narratives.",
    persona: "Analysts & consultants",
    themeOptions: ["minimal-gray", "dark-slate", "modern-blue"],
    layoutOptions: ["minimal-clean", "classic-single", "modern-two-column"],
  },
  {
    id: "CREATIVE",
    name: "Creative",
    description: "Asymmetric layout for standout portfolios",
    icon: Palette,
    layoutId: "creative-asymmetric",
    themeId: "creative-orange",
    accent: "#ea580c",
    headline: "Brand & Experience Designer",
    summary: "Story-driven designer crafting human experiences across retail, hospitality, and digital platforms.",
    persona: "Designers & creatives",
    themeOptions: ["creative-orange", "elegant-purple", "warm-amber"],
    layoutOptions: ["creative-asymmetric", "modern-two-column", "technical-grid"],
  },
  {
    id: "TECHNICAL",
    name: "Technical",
    description: "Grid layout highlighting skills and projects",
    icon: Cpu,
    layoutId: "technical-grid",
    themeId: "tech-cyan",
    accent: "#0891b2",
    headline: "Principal Machine Learning Engineer",
    summary: "Engineer specializing in retrieval augmented systems and real-time inference at scale.",
    persona: "Engineers & technical leads",
    themeOptions: ["tech-cyan", "modern-blue", "minimal-gray"],
    layoutOptions: ["technical-grid", "modern-two-column", "minimal-clean"],
  },
  {
    id: "ELEGANT",
    name: "Elegant",
    description: "Refined layout with a polished sidebar",
    icon: Gem,
    layoutId: "executive-sidebar-right",
    themeId: "elegant-purple",
    accent: "#7c3aed",
    headline: "Global Marketing Director",
    summary: "Strategist weaving brand narratives across markets and high-touch experiences.",
    persona: "Marketing & client-facing leaders",
    themeOptions: ["elegant-purple", "warm-amber", "modern-blue"],
    layoutOptions: ["executive-sidebar-right", "executive-sidebar-left", "classic-single"],
  },
  {
    id: "DARK",
    name: "Midnight",
    description: "Bold monochrome single-column",
    icon: Moon,
    layoutId: "classic-single",
    themeId: "dark-slate",
    accent: "#0f172a",
    headline: "Head of Platform Security",
    summary: "Security leader building resilient cloud infrastructure and zero-trust programs.",
    persona: "Security & infrastructure experts",
    themeOptions: ["dark-slate", "minimal-gray", "modern-blue"],
    layoutOptions: ["classic-single", "minimal-clean", "modern-two-column"],
  },
];

const TEMPLATE_PREVIEW_CONTENT: Record<TemplateOption["id"], any> = {
  MODERN: {
    fullName: "Jordan Alvarez",
    email: "jordan@lumina.studio",
    phone: "(415) 555-0199",
    location: "San Francisco, CA",
    website: "lumina.studio",
    linkedin: "linkedin.com/in/jordanalvarez",
    github: "github.com/jordanalvarez",
    profileImage: "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=256&q=80",
    experience: [
      {
        position: "Lead Product Designer",
        company: "Lumina Studio",
        location: "San Francisco, CA",
        startDate: "2021-04-01",
        current: true,
        description:
          "Guiding the end-to-end experience for the Lumina analytics platform with a cross-functional squad of 8.",
      },
      {
        position: "Senior UX Designer",
        company: "Arcadia Labs",
        location: "Remote",
        startDate: "2018-01-01",
        endDate: "2021-03-01",
        description:
          "Led design system modernization, improving weekly retention by 32% across core workflows.",
      },
    ],
    education: [
      {
        degree: "B.S. Human-Computer Interaction",
        institution: "University of Washington",
        location: "Seattle, WA",
        startDate: "2011-09-01",
        endDate: "2015-06-01",
        gpa: "3.8",
      },
    ],
    skills: [
      { name: "Design Strategy", level: "Expert" },
      { name: "UX Research", level: "Advanced" },
      { name: "Interaction Design", level: "Advanced" },
      { name: "Design Systems", level: "Advanced" },
      { name: "Figma", level: "Expert" },
    ],
    projects: [
      {
        name: "Lumina Dashboard Redesign",
        organization: "Lumina Studio",
        startDate: "2022-01-01",
        endDate: "2022-08-01",
        description:
          "Shipped personalized dashboards adopted by 12k monthly users within six weeks of launch.",
      },
    ],
    languages: [
      { name: "English", proficiency: "Native" },
      { name: "Spanish", proficiency: "Professional" },
    ],
  },
  PROFESSIONAL: {
    fullName: "Morgan Patel",
    email: "morgan@northwindops.com",
    phone: "(312) 555-0144",
    location: "Chicago, IL",
    website: "northwindops.com",
    linkedin: "linkedin.com/in/morganpatel",
    profileImage: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=256&q=80",
    experience: [
      {
        position: "VP Operations",
        company: "Northwind Logistics",
        location: "Chicago, IL",
        startDate: "2020-01-01",
        current: true,
        description:
          "Scaling a 200-person operations org across four hubs while maintaining 98% on-time delivery.",
      },
      {
        position: "Director of Strategy",
        company: "Mercury Supply Co.",
        location: "Chicago, IL",
        startDate: "2016-07-01",
        endDate: "2019-12-01",
        description:
          "Launched cross-border expansion generating $48M in incremental ARR within the first 18 months.",
      },
    ],
    education: [
      {
        degree: "MBA, Operations Management",
        institution: "Kellogg School of Management",
        startDate: "2014-08-01",
        endDate: "2016-05-01",
      },
      {
        degree: "B.S. Industrial Engineering",
        institution: "Georgia Tech",
        startDate: "2008-08-01",
        endDate: "2012-05-01",
      },
    ],
    skills: [
      { name: "Operational Excellence", level: "Expert" },
      { name: "P&L Ownership", level: "Advanced" },
      { name: "Lean Six Sigma", level: "Advanced" },
      { name: "Team Leadership", level: "Expert" },
    ],
    certifications: [
      {
        name: "Lean Six Sigma Black Belt",
        issuer: "ASQ",
        issueDate: "2018-04-01",
      },
    ],
    languages: [
      { name: "English", proficiency: "Native" },
      { name: "Hindi", proficiency: "Professional" },
    ],
  },
  ACADEMIC: {
    fullName: "Dr. Amara Singh",
    email: "amara.singh@mit.edu",
    phone: "(617) 555-0128",
    location: "Cambridge, MA",
    website: "csail.mit.edu/~asingh",
    linkedin: "linkedin.com/in/amara-singh",
    googleScholar: "scholar.google.com/citations?user=amarasingh",
    orcid: "0000-0002-1825-0097",
    profileImage: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=256&q=80",
    experience: [
      {
        position: "Associate Professor, Computer Science",
        company: "MIT CSAIL",
        location: "Cambridge, MA",
        startDate: "2019-08-01",
        current: true,
        description:
          "Leading the Embodied Perception Lab exploring geometric deep learning for collaborative robotics.",
      },
      {
        position: "Assistant Professor, Computer Science",
        company: "MIT CSAIL",
        location: "Cambridge, MA",
        startDate: "2015-08-01",
        endDate: "2019-07-01",
        description:
          "Published 18 peer-reviewed papers on vision-language navigation and multi-modal reasoning.",
      },
    ],
    education: [
      {
        degree: "Ph.D. Computer Science",
        institution: "Carnegie Mellon University",
        startDate: "2010-08-01",
        endDate: "2015-05-01",
        description: "Thesis: Learning Spatial Representations for Autonomous Agents",
      },
      {
        degree: "B.Tech Electrical Engineering",
        institution: "IIT Delhi",
        startDate: "2006-08-01",
        endDate: "2010-05-01",
      },
    ],
    publications: [
      {
        title: "Vision Transformers for Real-Time Navigation",
        authors: "Singh, A., Chen, L., & Zhao, M.",
        journal: "IEEE Transactions on Robotics",
        year: 2024,
        doi: "10.1109/TRO.2024.123456",
        type: "journal",
      },
      {
        title: "Embodied Agents with Multi-Modal Memory",
        authors: "Singh, A. & Patel, R.",
        conference: "CVPR",
        pages: "1123-1132",
        year: 2023,
        type: "conference",
      },
    ],
    projects: [
      {
        name: "Embodied Perception Lab",
        organization: "MIT CSAIL",
        startDate: "2019-09-01",
        description:
          "Directing a 12-person research group exploring embodied AI and human-robot collaboration.",
      },
    ],
    awards: [
      {
        title: "NSF CAREER Award",
        issuer: "National Science Foundation",
        date: "2021-07-01",
      },
    ],
    languages: [
      { name: "English", proficiency: "Native" },
      { name: "Hindi", proficiency: "Fluent" },
    ],
    hIndex: 29,
    totalCitations: 2450,
    i10Index: 37,
  },
  MINIMAL: {
    fullName: "Noah Reed",
    email: "noah@metricwave.com",
    phone: "(646) 555-0175",
    location: "New York, NY",
    website: "metricwave.com",
    linkedin: "linkedin.com/in/noahreed",
    profileImage: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=256&q=80",
    experience: [
      {
        position: "Product Analytics Lead",
        company: "MetricWave",
        location: "New York, NY",
        startDate: "2022-03-01",
        current: true,
        description:
          "Building self-serve instrumentation and experimentation frameworks across growth squads.",
      },
      {
        position: "Senior Data Analyst",
        company: "Brightline Health",
        location: "New York, NY",
        startDate: "2018-07-01",
        endDate: "2022-02-01",
        description:
          "Drove experimentation roadmap improving activation conversion by 9.4% YoY.",
      },
    ],
    education: [
      {
        degree: "B.S. Statistics",
        institution: "University of Michigan",
        startDate: "2014-09-01",
        endDate: "2018-05-01",
      },
    ],
    skills: [
      { name: "Experiment Design", level: "Advanced" },
      { name: "SQL & dbt", level: "Advanced" },
      { name: "Product Storytelling", level: "Advanced" },
      { name: "Amplitude", level: "Advanced" },
    ],
    projects: [
      {
        name: "Northstar Metrics Initiative",
        organization: "MetricWave",
        startDate: "2023-01-01",
        description:
          "Unified engagement metrics across four product surfaces to align quarterly OKRs.",
      },
    ],
    languages: [
      { name: "English", proficiency: "Native" },
    ],
  },
  CREATIVE: {
    fullName: "Skylar Bennett",
    email: "hello@skylarbennett.com",
    phone: "(347) 555-0110",
    location: "Brooklyn, NY",
    website: "skylarbennett.com",
    linkedin: "linkedin.com/in/skylarbennett",
    instagram: "instagram.com/skylar.designs",
    profileImage: "https://images.unsplash.com/photo-1487412912498-0447578fcca8?auto=format&fit=crop&w=256&q=80",
    experience: [
      {
        position: "Senior Brand Designer",
        company: "Palette & Co.",
        location: "New York, NY",
        startDate: "2021-05-01",
        current: true,
        description:
          "Leading experiential campaigns for hospitality clients including Marriott, Sonder, and CitizenM.",
      },
      {
        position: "Visual Designer",
        company: "Syn Studio",
        location: "Montreal, QC",
        startDate: "2017-02-01",
        endDate: "2021-04-01",
        description:
          "Delivered multi-channel brand refresh projects with cross-functional creative and strategy teams.",
      },
    ],
    education: [
      {
        degree: "B.Des. Graphic Design",
        institution: "Parsons School of Design",
        startDate: "2011-08-01",
        endDate: "2015-05-01",
      },
    ],
    projects: [
      {
        name: "Aurora Boutique Rebrand",
        organization: "Palette & Co.",
        startDate: "2023-01-01",
        endDate: "2023-06-01",
        description: "Repositioned boutique chain with immersive spatial branding across 12 locations.",
      },
      {
        name: "Canvas Festival Identity",
        organization: "Syn Studio",
        startDate: "2020-02-01",
        endDate: "2020-09-01",
        description: "Directed visual identity and signage for a 40k attendee digital art festival.",
      },
    ],
    skills: [
      { name: "Brand Systems", level: "Expert" },
      { name: "Art Direction", level: "Advanced" },
      { name: "Motion Design", level: "Advanced" },
      { name: "Adobe CC", level: "Expert" },
    ],
    awards: [
      { title: "AIGA Design Award", issuer: "AIGA", date: "2022-10-01" },
    ],
    languages: [
      { name: "English", proficiency: "Native" },
      { name: "French", proficiency: "Professional" },
    ],
  },
  TECHNICAL: {
    fullName: "Elliot Zhang",
    email: "elliot@vectorai.dev",
    phone: "(206) 555-0194",
    location: "Seattle, WA",
    website: "vectorai.dev",
    linkedin: "linkedin.com/in/elliotzhang",
    github: "github.com/elliotzhang",
    profileImage: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=256&q=80",
    experience: [
      {
        position: "Principal Machine Learning Engineer",
        company: "Vector AI",
        location: "Seattle, WA",
        startDate: "2021-09-01",
        current: true,
        description:
          "Architecting retrieval-augmented generation systems serving 40M weekly queries with sub-200ms latency.",
      },
      {
        position: "Senior ML Engineer",
        company: "Nimbus Cloud",
        location: "Seattle, WA",
        startDate: "2017-03-01",
        endDate: "2021-08-01",
        description:
          "Shipped adaptive ranking models improving trial-to-paid conversion by 14% YoY.",
      },
    ],
    education: [
      {
        degree: "M.S. Computer Science",
        institution: "University of Washington",
        startDate: "2013-09-01",
        endDate: "2015-06-01",
      },
      {
        degree: "B.S. Electrical Engineering",
        institution: "University of Washington",
        startDate: "2009-09-01",
        endDate: "2013-06-01",
      },
    ],
    skills: [
      { name: "Distributed Systems", level: "Expert" },
      { name: "MLOps", level: "Advanced" },
      { name: "Applied NLP", level: "Advanced" },
      { name: "Python & Rust", level: "Advanced" },
    ],
    projects: [
      {
        name: "RAG Platform",
        organization: "Vector AI",
        startDate: "2022-02-01",
        description: "Designed modular retrieval platform powering personalized agent experiences for enterprise customers.",
      },
      {
        name: "Real-time Feature Store",
        organization: "Nimbus Cloud",
        startDate: "2019-05-01",
        endDate: "2020-10-01",
        description: "Implemented streaming feature infrastructure supporting 15ms SLA for model inference.",
      },
    ],
    certifications: [
      { name: "TensorFlow Professional Developer", issuer: "Google", issueDate: "2020-07-01" },
    ],
    languages: [
      { name: "English", proficiency: "Native" },
      { name: "Mandarin", proficiency: "Professional" },
    ],
  },
  ELEGANT: {
    fullName: "Anika Laurent",
    email: "anika@storyline.studio",
    phone: "(212) 555-0188",
    location: "Paris · New York",
    website: "storyline.studio",
    linkedin: "linkedin.com/in/anika-laurent",
    profileImage: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=256&q=80",
    experience: [
      {
        position: "Global Marketing Director",
        company: "Storyline Studio",
        location: "Paris, France",
        startDate: "2019-02-01",
        current: true,
        description:
          "Leading integrated brand programs across luxury hospitality, lifestyle, and retail portfolios.",
      },
      {
        position: "Regional Marketing Lead",
        company: "Maison Lyra",
        location: "London, UK",
        startDate: "2014-05-01",
        endDate: "2018-12-01",
        description:
          "Launched omnichannel campaigns growing EMEA revenue by 27% YoY for flagship collections.",
      },
    ],
    education: [
      {
        degree: "MBA, Strategic Marketing",
        institution: "INSEAD",
        startDate: "2011-08-01",
        endDate: "2012-12-01",
      },
      {
        degree: "B.A. Communications",
        institution: "University of Toronto",
        startDate: "2006-09-01",
        endDate: "2010-06-01",
      },
    ],
    projects: [
      {
        name: "Maison Atlas Launch",
        organization: "Storyline Studio",
        startDate: "2023-03-01",
        endDate: "2023-11-01",
        description: "Directed global rollout across seven markets with localized experiential activations.",
      },
    ],
    skills: [
      { name: "Brand Strategy", level: "Expert" },
      { name: "Luxury Marketing", level: "Expert" },
      { name: "Client Partnerships", level: "Advanced" },
    ],
    languages: [
      { name: "English", proficiency: "Native" },
      { name: "French", proficiency: "Fluent" },
    ],
  },
  DARK: {
    fullName: "Rohan Desai",
    email: "rohan@sentinelsec.io",
    phone: "(917) 555-0135",
    location: "Austin, TX",
    website: "sentinelsec.io",
    linkedin: "linkedin.com/in/rohansdesai",
    github: "github.com/rohansdesai",
    profileImage: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=256&q=80",
    experience: [
      {
        position: "Head of Platform Security",
        company: "Sentinel Security",
        location: "Austin, TX",
        startDate: "2020-06-01",
        current: true,
        description:
          "Owning zero-trust architecture and secure-by-default platform initiatives across cloud environments.",
      },
      {
        position: "Security Engineering Manager",
        company: "Cloudfort Labs",
        location: "Austin, TX",
        startDate: "2015-09-01",
        endDate: "2020-05-01",
        description:
          "Scaled threat detection programs and led 24/7 incident response for SaaS infrastructure.",
      },
    ],
    education: [
      {
        degree: "M.S. Cybersecurity",
        institution: "Georgia Tech",
        startDate: "2012-08-01",
        endDate: "2014-05-01",
      },
      {
        degree: "B.S. Computer Engineering",
        institution: "UT Austin",
        startDate: "2008-08-01",
        endDate: "2012-05-01",
      },
    ],
    projects: [
      {
        name: "Zero Trust Rollout",
        organization: "Sentinel Security",
        startDate: "2021-02-01",
        description: "Led adoption of device posture checks and continuous authentication across 3.5k employees.",
      },
    ],
    skills: [
      { name: "Cloud Security", level: "Expert" },
      { name: "Incident Response", level: "Advanced" },
      { name: "Threat Modeling", level: "Advanced" },
    ],
    certifications: [
      { name: "CISSP", issuer: "ISC²", issueDate: "2018-03-01" },
      { name: "CCSP", issuer: "ISC²", issueDate: "2020-09-01" },
    ],
    languages: [
      { name: "English", proficiency: "Native" },
    ],
  },
};

const PREVIEW_BASE_WIDTH = 816;
const PREVIEW_BASE_HEIGHT = 1056;
const PREVIEW_SCALE = 0.48;
const DEFAULT_PREVIEW_PHOTO = "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=256&q=80";

function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

function buildContactEntries(data: any) {
  const entries: any[] = [];
  const add = (type: string, value?: string, label?: string, isPrimary = false) => {
    if (!value) return;
    entries.push({
      id: `contact-${type}`,
      type,
      value,
      label: label || undefined,
      isPrimary,
      order: entries.length,
    });
  };

  add("email", data.email, "Email", true);
  add("phone", data.phone, "Phone");
  add("location", data.location, "Location");
  add("website", data.website, "Website");
  add("linkedin", data.linkedin, "LinkedIn");
  add("github", data.github, "GitHub");
  add("googleScholar", data.googleScholar, "Google Scholar");
  add("orcid", data.orcid, "ORCID");
  add("researchGate", data.researchGate, "ResearchGate");
  add("instagram", data.instagram, "Instagram");
  add("twitter", data.twitter, "Twitter");

  return entries;
}

function buildSocialLinks(data: any) {
  const links: any[] = [];
  const add = (platform: string, url?: string) => {
    if (!url) return;
    links.push({ platform, url });
  };

  add("Website", data.website);
  add("LinkedIn", data.linkedin);
  add("GitHub", data.github);
  add("Google Scholar", data.googleScholar);
  add("ORCID", data.orcid);
  add("ResearchGate", data.researchGate);
  add("Instagram", data.instagram);
  add("Twitter", data.twitter);

  return links;
}

function buildPreviewCV(
  template: TemplateOption,
  themeOverride?: string,
  context?: BuildPreviewContext,
  options?: { photoPlacement?: PhotoPlacement; layoutId?: string }
) {
  const content = TEMPLATE_PREVIEW_CONTENT[template.id] || TEMPLATE_PREVIEW_CONTENT.MODERN;
  const data = deepClone(content);

  const sessionUser = context?.sessionUser;
  const profile = context?.profile || null;
  const photoPlacement = options?.photoPlacement || "left";
  const layoutOverride = options?.layoutId;

  const normalize = (value?: string | null) => {
    if (typeof value !== "string") return "";
    return value.trim();
  };

  const assignString = (key: string, value?: string | null) => {
    const normalized = normalize(value);
    if (normalized) {
      (data as Record<string, any>)[key] = normalized;
    } else {
      delete (data as Record<string, any>)[key];
    }
  };

  const assignNumber = (key: string, value?: number | null) => {
    if (typeof value === "number" && !Number.isNaN(value)) {
      (data as Record<string, any>)[key] = value;
    } else {
      delete (data as Record<string, any>)[key];
    }
  };

  const userName = normalize(sessionUser?.name);
  const firstName = userName ? userName.split(/\s+/)[0] : "";
  const summaryFromProfile = profile ? normalize(profile.bio) : "";

  data.headline = sessionUser
    ? "Professional headline (e.g., Senior Data Scientist)"
    : template.headline;
  data.summary = summaryFromProfile
    ? summaryFromProfile
    : sessionUser
    ? firstName
      ? `Summarize ${firstName}'s experience and focus areas in a few sentences.`
      : "Summarize your experience and focus areas in a few sentences."
    : template.summary;
  data.template = template.id;
  data.layout = layoutOverride || template.layoutId;
  data.theme = themeOverride || template.themeId;
  data.photoPlacement = photoPlacement;
  data.themeData = JSON.stringify({ photoPlacement });

  if (sessionUser) {
    assignString("fullName", sessionUser.name || data.fullName);
    assignString("email", sessionUser.email || data.email);
    assignString("profileImage", sessionUser.image);
  }

  if (profile) {
    assignString("phone", profile.phone);
    assignString("location", profile.location);
    assignString("website", profile.website);
    assignString("linkedin", profile.linkedin);
    assignString("googleScholar", profile.googleScholar);
    assignString("orcid", profile.orcid);
    assignString("researchGate", profile.researchGate);
    assignString("github", profile.github);
    assignString("twitter", profile.twitter);
    assignString("profileImage", profile.profileImage);
    assignNumber("hIndex", profile.hIndex ?? null);
    assignNumber("totalCitations", profile.totalCitations ?? null);
  }

  if (!normalize((data as Record<string, any>).profileImage)) {
    (data as Record<string, any>).profileImage = DEFAULT_PREVIEW_PHOTO;
  }

  const hasUserContext = Boolean(sessionUser || profile);
  if (hasUserContext) {
    (data as Record<string, any>).experience = [];
    (data as Record<string, any>).education = [];
    (data as Record<string, any>).publications = [];
    (data as Record<string, any>).projects = [];
    (data as Record<string, any>).certifications = [];
    (data as Record<string, any>).awards = [];
    (data as Record<string, any>).languages = [];
    (data as Record<string, any>).skills = [];
    (data as Record<string, any>).references = [];
  }

  (data as Record<string, any>).contactInfo = buildContactEntries(data);
  (data as Record<string, any>).socialLinks = buildSocialLinks(data);

  return data;
}

interface TemplatePreviewPanelProps {
  template: TemplateOption;
  cv: any;
  layoutName: string;
  layoutDescription?: string;
  themeName: string;
  theme: CVTheme;
  selectedThemeId: string;
  onThemeChange: (themeId: string) => void;
  allThemeOptions: Array<{ id: string; name: string; colors: string[] }>;
  recommendedThemeIds: string[];
  layoutOptions: Array<{ id: string; name: string; description?: string }>;
  selectedLayoutId: string;
  onLayoutChange: (layoutId: string) => void;
  photoPlacement: PhotoPlacement;
  onPhotoPlacementChange: (placement: PhotoPlacement) => void;
}

function TemplatePreviewPanel({
  template,
  cv,
  layoutName,
  layoutDescription,
  themeName,
  theme,
  selectedThemeId,
  onThemeChange,
  allThemeOptions,
  recommendedThemeIds,
  layoutOptions,
  selectedLayoutId,
  onLayoutChange,
  photoPlacement,
  onPhotoPlacementChange,
}: TemplatePreviewPanelProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState<number>(PREVIEW_SCALE);
  const headerAccent = theme.colors.primary || template.accent;
  const paletteSwatches = [theme.colors.primary, theme.colors.secondary, theme.colors.accent].filter(
    (color): color is string => Boolean(color)
  );
  const recommendedThemes = useMemo(() => {
    const uniqueIds = Array.from(new Set([template.themeId, ...recommendedThemeIds]));
    const optionMap = new Map(allThemeOptions.map((option) => [option.id, option]));
    return uniqueIds
      .map((id) => optionMap.get(id))
      .filter(Boolean) as Array<{ id: string; name: string; colors: string[] }>;
  }, [allThemeOptions, recommendedThemeIds, template.themeId]);
  const placementLabels: Record<PhotoPlacement, string> = {
    left: "Left of name",
    right: "Right of name",
    top: "Above",
    none: "Hide photo",
  };

  useEffect(() => {
    if (typeof window === "undefined" || typeof ResizeObserver === "undefined") {
      return;
    }

    const computeScale = (width: number) => {
      if (!width) return PREVIEW_SCALE;
      const availableWidth = Math.max(width - 32, 0); // account for horizontal padding
      if (!availableWidth) return PREVIEW_SCALE;
      const ratio = availableWidth / PREVIEW_BASE_WIDTH;
      // Keep the preview readable but allow it to expand
      return Math.max(0.35, Math.min(1, Number(ratio.toFixed(3))));
    };

    const element = containerRef.current;
    if (!element) {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      setScale(computeScale(entry.contentRect.width));
    });

    observer.observe(element);
    setScale(computeScale(element.getBoundingClientRect().width));

    return () => observer.disconnect();
  }, []);

  const scaledWidth = PREVIEW_BASE_WIDTH * scale;
  const scaledHeight = PREVIEW_BASE_HEIGHT * scale;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold text-gray-900">Live Preview</h2>
        <p className="text-sm text-gray-600">
          Fine-tune the theme, layout, and header photo before jumping into the editor.
        </p>
      </div>
  <div className="grid gap-6 lg:grid-cols-[minmax(0,360px)_1fr]">
        <Card className="space-y-6 p-5">
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-gray-900">{template.name} template</p>
                <p className="text-xs text-gray-500">{template.persona}</p>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-2 py-1 text-[11px] font-medium uppercase tracking-wide text-slate-600">
                Accent
                <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: headerAccent }} />
              </span>
            </div>
            <p className="text-xs text-gray-500">{layoutName}</p>
            {layoutDescription ? <p className="text-xs text-gray-500">{layoutDescription}</p> : null}
          </div>

          <div className="space-y-3">
            <Label
              htmlFor="preview-theme"
              className="text-xs font-semibold uppercase tracking-wide text-gray-600"
            >
              Color palette
            </Label>
            <Select value={selectedThemeId} onValueChange={onThemeChange}>
              <SelectTrigger id="preview-theme">
                <SelectValue placeholder="Choose palette" />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                {allThemeOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{option.name}</span>
                      <span className="flex items-center gap-1">
                        {option.colors.slice(0, 3).map((color, index) => (
                          <span
                            key={`${option.id}-swatch-${index}`}
                            className="h-3 w-3 rounded-full border border-white/40 shadow"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </span>
                      {option.id === template.themeId ? (
                        <span className="text-[10px] uppercase tracking-wide text-gray-400">Default</span>
                      ) : null}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {recommendedThemes.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {recommendedThemes.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => onThemeChange(option.id)}
                    className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium transition ${
                      selectedThemeId === option.id
                        ? "border-transparent bg-slate-900 text-white"
                        : "border-slate-200 bg-white text-gray-600 hover:border-slate-400"
                    }`}
                  >
                    <span className="flex items-center gap-1">
                      {option.colors.slice(0, 3).map((color, index) => (
                        <span
                          key={`${option.id}-recommended-${index}`}
                          className="h-3 w-3 rounded-full border border-white/40"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </span>
                    {option.name}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-600">Layout</span>
            <div className="space-y-2">
              {layoutOptions.map((option) => {
                const isActive = option.id === selectedLayoutId;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => onLayoutChange(option.id)}
                    className={`w-full rounded-lg border px-3 py-2 text-left transition ${
                      isActive
                        ? "border-slate-900 bg-slate-900 text-white shadow-md"
                        : "border-slate-200 bg-white text-gray-700 hover:border-slate-400"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <p className="text-sm font-semibold leading-tight">
                          {option.name}
                        </p>
                        {option.description ? (
                          <p className={`text-xs ${isActive ? "text-white/80" : "text-gray-500"}`}>
                            {option.description}
                          </p>
                        ) : null}
                      </div>
                      {isActive ? (
                        <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white">
                          Selected
                        </span>
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-600">Photo placement</span>
            <div className="flex flex-wrap gap-2">
              {["left", "right", "top", "none"].map((placement) => {
                const typedPlacement = placement as PhotoPlacement;
                const isActive = photoPlacement === typedPlacement;
                return (
                  <button
                    key={placement}
                    type="button"
                    onClick={() => onPhotoPlacementChange(typedPlacement)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                      isActive
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {placementLabels[typedPlacement]}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-gray-500">
              Choose how the profile photo anchors your header. You can fine-tune in the editor later.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
            <span className="font-semibold uppercase tracking-wide text-gray-600">Palette</span>
            {paletteSwatches.map((color, index) => (
              <span
                key={`${color}-${index}`}
                className="h-6 w-6 rounded-md border border-white/50 shadow"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </Card>
        <div className="rounded-xl border bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-5 py-4 text-xs text-slate-600">
            <span className="font-medium text-slate-700">{layoutName}</span>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-600">{themeName}</span>
          </div>
          <div ref={containerRef} className="bg-slate-100 px-4 py-6">
            <div
              className="mx-auto overflow-hidden rounded-lg border bg-white shadow"
              style={{ width: scaledWidth, height: scaledHeight }}
            >
              <div
                className="pointer-events-none"
                style={{
                  transform: `scale(${scale})`,
                  transformOrigin: "top left",
                  width: PREVIEW_BASE_WIDTH,
                  height: PREVIEW_BASE_HEIGHT,
                }}
              >
                <CVPreview cv={cv} themeId={selectedThemeId} layoutId={selectedLayoutId} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NewCVPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [title, setTitle] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateOption["id"]>("MODERN");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedThemeId, setSelectedThemeId] = useState<string>(templates[0].themeId);
  const [selectedLayoutId, setSelectedLayoutId] = useState<string>(templates[0].layoutId);
  const [photoPlacement, setPhotoPlacement] = useState<PhotoPlacement>("left");
  const [profileData, setProfileData] = useState<ProfileResponse | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const selectedTemplateConfig = useMemo(
    () => templates.find((template) => template.id === selectedTemplate) ?? templates[0],
    [selectedTemplate]
  );
  useEffect(() => {
    setSelectedThemeId(selectedTemplateConfig.themeId);
    setSelectedLayoutId(selectedTemplateConfig.layoutId);
    setPhotoPlacement("left");
  }, [selectedTemplateConfig.themeId, selectedTemplateConfig.layoutId]);

  useEffect(() => {
    let isMounted = true;

    const fetchProfile = async () => {
      try {
        const response = await fetch("/api/profile", { cache: "no-store" });
        if (!response.ok) {
          const errorBody = await response.json().catch(() => ({}));
          throw new Error(errorBody?.error || "Failed to load profile");
        }
        const data = (await response.json()) as ProfileResponse;
        if (isMounted) {
          setProfileData(data);
          setProfileError(null);
        }
      } catch (error) {
        console.error("Error loading profile for preview:", error);
        if (isMounted) {
          setProfileError(error instanceof Error ? error.message : "Unable to load profile");
        }
      }
    };

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const previewUser =
    (profileData?.user as { name?: string | null; email?: string | null; image?: string | null } | undefined) ??
    (session?.user as { name?: string | null; email?: string | null; image?: string | null } | undefined);
  const sessionSignature = useMemo(
    () => `${previewUser?.name ?? ""}|${previewUser?.email ?? ""}|${previewUser?.image ?? ""}`,
    [previewUser?.name, previewUser?.email, previewUser?.image]
  );

  const layoutOptions = useMemo(() => {
    const ids = new Set<string>();
    ids.add(selectedTemplateConfig.layoutId);
    (selectedTemplateConfig.layoutOptions || []).forEach((id) => ids.add(id));
    return Array.from(ids)
      .map((id) => getLayoutById(id))
      .filter((layout): layout is NonNullable<ReturnType<typeof getLayoutById>> => Boolean(layout));
  }, [selectedTemplateConfig]);

  const layoutMeta = useMemo(
    () => getLayoutById(selectedLayoutId) || layoutOptions[0] || getLayoutById(selectedTemplateConfig.layoutId),
    [selectedLayoutId, layoutOptions, selectedTemplateConfig.layoutId]
  );

  const layoutDescription = layoutMeta?.description;
  const defaultThemeName = useMemo(
    () => getTheme(selectedTemplateConfig.themeId).name,
    [selectedTemplateConfig.themeId]
  );
  const allThemeOptions = useMemo(
    () =>
      CV_THEMES.map((theme) => ({
        id: theme.id,
        name: theme.name,
        colors: [theme.colors.primary, theme.colors.secondary, theme.colors.accent].filter(
          (color): color is string => typeof color === "string" && color.length > 0
        ),
      })),
    []
  );
  const recommendedThemeIds = useMemo(() => {
    const ids = new Set<string>();
    ids.add(selectedTemplateConfig.themeId);
    (selectedTemplateConfig.themeOptions || []).forEach((id) => ids.add(id));
    return Array.from(ids);
  }, [selectedTemplateConfig]);

  const isThemeValid = useMemo(
    () => CV_THEMES.some((theme) => theme.id === selectedThemeId),
    [selectedThemeId]
  );

  const safeThemeId = useMemo(
    () => (isThemeValid ? selectedThemeId : selectedTemplateConfig.themeId),
    [isThemeValid, selectedThemeId, selectedTemplateConfig.themeId]
  );

  const handleThemeChange = (themeId: string) => {
    const fallback = selectedTemplateConfig.themeId;
    const nextThemeId = CV_THEMES.some((theme) => theme.id === themeId) ? themeId : fallback;
    setSelectedThemeId(nextThemeId);
  };

  const handleLayoutChange = (layoutId: string) => {
    const fallback = selectedTemplateConfig.layoutId;
    const nextLayoutId = layoutOptions.some((layout) => layout.id === layoutId)
      ? layoutId
      : fallback;
    setSelectedLayoutId(nextLayoutId);
  };

  const previewCVData = useMemo(
    () =>
      buildPreviewCV(selectedTemplateConfig, safeThemeId, {
        sessionUser: previewUser,
        profile: profileData?.profile ?? null,
      }, { photoPlacement, layoutId: selectedLayoutId }),
    [selectedTemplateConfig, safeThemeId, sessionSignature, profileData, photoPlacement, selectedLayoutId, previewUser]
  );

  const selectedTheme = useMemo(() => getTheme(safeThemeId), [safeThemeId]);
  const selectedThemeName = selectedTheme.name;

  // Auto-fill title with user's name + " CV" on mount
  useEffect(() => {
    if (session?.user?.name && !title) {
      setTitle(`${session.user.name}'s CV`);
    }
  }, [session, title]);

  const handleCreate = async () => {
    if (!title.trim()) {
      alert("Please enter a CV title");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/cvs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          template: selectedTemplate,
          theme: safeThemeId,
          layout: selectedLayoutId,
          photoPlacement,
        }),
      });

      const result = await response.json().catch(() => null);

      if (response.ok && result) {
        const cv = result;
        router.push(`/dashboard/cvs/${cv.id}/edit`);
      } else {
        const message = result?.error || "Failed to create CV";
        alert(message);
      }
    } catch (error) {
      console.error("Error creating CV:", error);
      alert("Failed to create CV");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader user={session?.user} />

  <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create New CV</h1>
          <p className="mt-2 text-gray-600">
            Choose a template and give your CV a title to get started
          </p>
        </div>

  <div className="grid gap-8 lg:gap-12 lg:items-start lg:grid-cols-[minmax(420px,0.65fr)_minmax(0,1.35fr)] xl:grid-cols-[minmax(500px,0.6fr)_minmax(0,1.4fr)] 2xl:grid-cols-[minmax(560px,0.58fr)_minmax(0,1.42fr)]">
          <div className="space-y-8">
            {/* CV Title */}
            <Card className="p-5">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">CV Title</Label>
                  <Input
                    id="title"
                    type="text"
                    placeholder="e.g., Software Engineer Resume, Academic CV"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="mt-2"
                  />
                </div>
              </div>
            </Card>

            {/* Template Selection */}
            <Card className="p-5">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Choose a Template</h2>
                  <p className="text-sm text-gray-600">
                    Each template picks a starting layout and theme. You can switch later in the editor.
                  </p>
                </div>
                <span className="hidden text-sm text-gray-500 md:inline">
                  Default palette: {defaultThemeName}
                </span>
              </div>
              <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                {templates.map((template) => {
                  const Icon = template.icon;
                  const isActive = template.id === selectedTemplateConfig.id;
                  const layoutInfo = getLayoutById(template.layoutId);
                  const templateThemeName = getTheme(template.themeId).name;
                  const accentBg = `${template.accent}1A`;
                  return (
                    <Card
                      key={template.id}
                      role="button"
                      tabIndex={0}
                      className={`cursor-pointer transition-all hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 ${
                        isActive ? "ring-2 ring-offset-2 ring-blue-500 shadow-lg" : ""
                      }`}
                      onClick={() => setSelectedTemplate(template.id)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          setSelectedTemplate(template.id);
                        }
                      }}
                    >
                      <div className="flex h-full flex-col gap-4 p-4">
                        <div className="flex items-start gap-4">
                          <div
                            className="rounded-full p-2.5"
                            style={{ backgroundColor: accentBg, color: template.accent }}
                          >
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{template.name}</h3>
                            <p className="text-sm text-gray-600">{template.description}</p>
                            <p className="mt-1 text-xs italic text-gray-500">{template.persona}</p>
                          </div>
                        </div>
                        <div className="space-y-2 text-xs text-gray-600">
                          <div className="rounded-md border border-dashed px-3 py-2">
                            <span className="font-medium text-gray-900">Layout:</span>{" "}
                            {layoutInfo?.name || "Custom Layout"}
                          </div>
                          <div className="rounded-md border border-dashed px-3 py-2">
                            <span className="font-medium text-gray-900">Theme:</span>{" "}
                            {templateThemeName}
                          </div>
                        </div>
                        {isActive && (
                          <span className="inline-flex items-center self-start rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                            Selected
                          </span>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
              <div className="mt-4 text-sm text-gray-500 md:hidden">
                Default palette: {defaultThemeName}
              </div>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4">
              <Button
                variant="outline"
                onClick={() => router.push("/dashboard/cvs")}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={isLoading}>
                {isLoading ? "Creating..." : "Create CV"}
              </Button>
            </div>
          </div>

          <div className="lg:sticky lg:top-28">
            {profileError && (
              <Card className="mb-4 border-dashed border-amber-200 bg-amber-50">
                <div className="p-4 text-sm text-amber-700">
                  We could not load your saved profile details. The preview is using template defaults for now.
                </div>
              </Card>
            )}
            <TemplatePreviewPanel
              template={selectedTemplateConfig}
              cv={previewCVData}
              layoutName={layoutMeta?.name || "Selected Layout"}
              layoutDescription={layoutDescription}
              themeName={selectedThemeName}
              theme={selectedTheme}
              selectedThemeId={safeThemeId}
              onThemeChange={handleThemeChange}
              allThemeOptions={allThemeOptions}
              recommendedThemeIds={recommendedThemeIds}
              layoutOptions={layoutOptions}
              selectedLayoutId={selectedLayoutId}
              onLayoutChange={handleLayoutChange}
              photoPlacement={photoPlacement}
              onPhotoPlacementChange={setPhotoPlacement}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
