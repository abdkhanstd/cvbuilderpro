"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Eye,
  Download,
  Share2,
  ArrowLeft,
  Plus,
  GripVertical,
  Pencil,
  Loader2,
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PersonalInfoSection } from "@/components/cv/sections/personal-info-section";
import { EducationSection } from "@/components/cv/sections/education-section";
import { ExperienceSection } from "@/components/cv/sections/experience-section";
import { SkillsSection } from "@/components/cv/sections/skills-section";
import { PublicationsSection } from "@/components/cv/sections/publications-section";
import { ProjectsSection } from "@/components/cv/sections/projects-section";
import { CertificationsSection } from "@/components/cv/sections/certifications-section";
import { AwardsSection } from "@/components/cv/sections/awards-section";
import { LanguagesSection } from "@/components/cv/sections/languages-section";
import { ReferencesSection } from "@/components/cv/sections/references-section";
import { CustomSection } from "@/components/cv/sections/custom-section";
import { CVPreview } from "@/components/cv/cv-preview";
import { SectionManager } from "@/components/cv/section-manager";
import { ThemeEditor } from "@/components/cv/theme-editor";
import { CVUploadDialog } from "@/components/cv/cv-upload-dialog";
import { ShareDialog } from "@/components/cv/share-dialog";
import { CV_THEMES, CVTheme } from "@/lib/cv-themes";
import { useToast } from "@/hooks/use-toast";

interface CVEditorProps {
  cv: any;
  profile: any;
}

function extractThemeFromData(themeData: unknown): CVTheme | null {
  if (!themeData) return null;

  let candidate: unknown = themeData;
  if (typeof candidate === "string") {
    try {
      candidate = JSON.parse(candidate);
    } catch {
      return null;
    }
  }

  if (!candidate || typeof candidate !== "object") {
    return null;
  }

  const record = candidate as Record<string, unknown>;
  const hasThemeShape =
    typeof record.colors === "object" &&
    typeof record.layout === "object" &&
    typeof record.typography === "object" &&
    typeof record.style === "object";

  return hasThemeShape ? ((record as unknown) as CVTheme) : null;
}

export function CVEditor({ cv, profile }: CVEditorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [cvData, setCVData] = useState(cv);
  const [activeSection, setActiveSection] = useState("personal");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showSectionManager, setShowSectionManager] = useState(false);
  const [activeTab, setActiveTab] = useState<"design" | "content">("content");
  const [customTheme, setCustomTheme] = useState<CVTheme | null>(() => extractThemeFromData(cv.themeData));
  const profileImageSynced = useRef(false);
  const [isRenamingTitle, setIsRenamingTitle] = useState(false);
  const [titleBeforeEdit, setTitleBeforeEdit] = useState(cv.title || "");
  const titleInputRef = useRef<HTMLInputElement | null>(null);
  const [showShareDialog, setShowShareDialog] = useState(false);
  
  // Check if we should auto-open the AI import dialog
  const shouldOpenAIImport = searchParams.get("import") === "ai";
  
  // Check if we should auto-open the share dialog
  const shouldOpenShareDialog = searchParams.get("tab") === "share";
  
  // Auto-open share dialog if tab=share is in URL
  useEffect(() => {
    if (shouldOpenShareDialog) {
      setShowShareDialog(true);
    }
  }, [shouldOpenShareDialog]);
  
  console.log('🎨 CVEditor initialized with CV:', {
    id: cv.id,
    fullName: cv.fullName,
    profileImage: cv.profileImage ? 'present: ' + cv.profileImage.substring(0, 50) : 'MISSING',
  });
  console.log('🎨 CVEditor initialized with Profile:', {
    profileImage: profile?.profileImage ? 'present: ' + profile.profileImage.substring(0, 50) : 'MISSING',
  });
  
  const [sections, setSections] = useState([
    { id: "personal", title: "Personal Info", label: "Personal Info", icon: "👤", enabled: true, order: 0, isCustom: false },
    { id: "education", title: "Education", label: "Education", icon: "🎓", enabled: true, order: 1, isCustom: false },
    { id: "experience", title: "Experience", label: "Experience", icon: "💼", enabled: true, order: 2, isCustom: false },
    { id: "skills", title: "Skills", label: "Skills", icon: "⚡", enabled: true, order: 3, isCustom: false },
    { id: "publications", title: "Publications", label: "Publications", icon: "📚", enabled: true, order: 4, isCustom: false },
    { id: "projects", title: "Projects", label: "Projects", icon: "🚀", enabled: true, order: 5, isCustom: false },
    { id: "certifications", title: "Certifications", label: "Certifications", icon: "🏆", enabled: true, order: 6, isCustom: false },
    { id: "awards", title: "Awards", label: "Awards", icon: "🏅", enabled: true, order: 7, isCustom: false },
    { id: "languages", title: "Languages", label: "Languages", icon: "🌍", enabled: true, order: 8, isCustom: false },
    { id: "references", title: "References", label: "References", icon: "👥", enabled: true, order: 9, isCustom: false },
  ]);

  // Load saved section configuration on mount
  useEffect(() => {
    // Load custom sections from CV data
    const customSections = (cv.customSections || []).map((cs: any, index: number) => ({
      id: cs.id || cs.title,
      title: cs.title,
      label: cs.title,
      icon: "📄",
      enabled: true,
      order: 10 + index,
      isCustom: true,
    }));

    if (cv.sectionOrder && Array.isArray(cv.sectionOrder) && cv.sectionOrder.length > 0) {
      const defaultSectionsMap = new Map(sections.map(s => [s.id, s]));
      
      const savedSections = cv.sectionOrder
        .filter((saved: any) => saved.id !== 'design' && saved.id !== 'layout') // Exclude design and layout
        .map((saved: any) => {
          const defaultSection = defaultSectionsMap.get(saved.id);
          return {
            id: saved.id,
            title: saved.title,
            label: defaultSection?.label || saved.title,
            icon: defaultSection?.icon || (saved.isCustom ? "📄" : "📋"),
            enabled: saved.enabled !== undefined ? saved.enabled : true,
            order: saved.order,
            isCustom: saved.isCustom || false,
          };
        });
      setSections([...savedSections, ...customSections.filter((cs: any) => !savedSections.find((s: any) => s.id === cs.id))]);
    } else if (customSections.length > 0) {
      setSections([...sections, ...customSections]);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setCustomTheme(extractThemeFromData(cvData.themeData));
  }, [cvData.themeData]);

  // Track when CV data changes (but skip initial render)
  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    setHasUnsavedChanges(true);
  }, [cvData]);

  useEffect(() => {
    if (profileImageSynced.current) {
      return;
    }
    const profileImage = typeof profile?.profileImage === "string" ? profile.profileImage.trim() : "";
    if (!cvData?.profileImage && profileImage) {
      setCVData((prev: any) => {
        if (prev?.profileImage) {
          return prev;
        }
        return { ...prev, profileImage };
      });
      profileImageSynced.current = true;
    } else if (cvData?.profileImage) {
      profileImageSynced.current = true;
    }
  }, [cvData?.profileImage, profile?.profileImage]);

  useEffect(() => {
    if (isRenamingTitle) {
      titleInputRef.current?.focus();
      titleInputRef.current?.select();
    }
  }, [isRenamingTitle]);

  const handleSave = async (isAutoSave = false): Promise<boolean> => {
    setIsSaving(true);
    try {
      console.log("=== Starting CV Save ===");
      console.log("Full cvData object:", JSON.stringify({
        id: cvData.id,
        fullName: cvData.fullName,
        email: cvData.email,
        title: cvData.title,
        profileImage: cvData.profileImage ? 'present: ' + cvData.profileImage.substring(0, 50) : 'MISSING',
        educationCount: cvData.education?.length || 0,
        experienceCount: cvData.experience?.length || 0,
        projectsCount: cvData.projects?.length || 0,
        skillsCount: cvData.skills?.length || 0,
        publicationsCount: cvData.publications?.length || 0,
        certificationsCount: cvData.certifications?.length || 0,
        customSectionsCount: cvData.customSections?.length || 0,
      }, null, 2));
      
      const response = await fetch(`/api/cvs/${cv.id}/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cvData),
      });

      console.log("Response status:", response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log("✅ Save successful:", result);
        if (!isAutoSave) {
          toast({
            title: "Success",
            description: "CV saved successfully",
          });
        }
        setHasUnsavedChanges(false);
        return true;
      } else {
        const error = await response.json();
        console.error("❌ Save failed with status:", response.status);
        console.error("Error details:", error);
        toast({
          title: "Error",
          description: error.details || error.error || "Failed to save CV",
        });
        throw new Error(error.error || "Failed to save");
      }
    } catch (error) {
      console.error("❌ Error saving CV:", error);
      const message = error instanceof Error ? error.message : "Failed to save CV";
      toast({
        title: isAutoSave ? "Auto-save failed" : "Error",
        description: message,
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // Auto-save functionality with proper dependency tracking
  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const autoSave = setTimeout(async () => {
      const success = await handleSave(true);
      if (!success) {
        console.warn("Auto-save attempt failed; unsaved changes remain.");
      }
    }, 5000); // Auto-save 5 seconds after last change

    return () => clearTimeout(autoSave);
  }, [hasUnsavedChanges]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleTitleChange = (value: string) => {
    setCVData((prev: any) => ({
      ...prev,
      title: value,
    }));
    setHasUnsavedChanges(true);
  };

  const finishTitleEdit = () => {
    setCVData((prev: any) => {
      const trimmed = (prev.title || "").trim();
      return {
        ...prev,
        title: trimmed || "Untitled CV",
      };
    });
    setIsRenamingTitle(false);
  };

  const handleParsedCVData = (parsedData: any) => {
    console.log("📥 Received parsed CV data:", parsedData);
    
    // Map AI field names to frontend field names for education
    const mappedEducation = (parsedData.education || []).map((edu: any) => ({
      ...edu,
      institution: edu.school || edu.institution || "", // AI uses "school", frontend uses "institution"
    }));
    
    // Map AI field names to frontend field names for experience
    const mappedExperience = (parsedData.experience || []).map((exp: any) => ({
      ...exp,
      position: exp.title || exp.position || "", // AI uses "title", frontend uses "position"
    }));
    
    console.log("📚 Mapped education:", mappedEducation.map((e: any) => ({ degree: e.degree, institution: e.institution })));
    console.log("💼 Mapped experience:", mappedExperience.map((e: any) => ({ position: e.position, company: e.company })));
    
    // Merge parsed data with existing CV data
    setCVData((prev: any) => {
      const merged = {
        ...prev,
        // Update personal info fields
        fullName: parsedData.fullName || prev.fullName,
        email: parsedData.email || prev.email,
        phone: parsedData.phone || prev.phone,
        location: parsedData.location || prev.location,
        headline: parsedData.headline || prev.headline,
        summary: parsedData.summary || prev.summary,
        website: parsedData.website || prev.website,
        linkedin: parsedData.linkedin || prev.linkedin,
        github: parsedData.github || prev.github,
        // Merge arrays - new items first (use mapped data for education/experience)
        education: [...mappedEducation, ...(prev.education || [])],
        experience: [...mappedExperience, ...(prev.experience || [])],
        skills: [...(parsedData.skills || []), ...(prev.skills || [])],
        projects: [...(parsedData.projects || []), ...(prev.projects || [])],
        certifications: [...(parsedData.certifications || []), ...(prev.certifications || [])],
        languages: [...(parsedData.languages || []), ...(prev.languages || [])],
        publications: [...(parsedData.publications || []), ...(prev.publications || [])],
        awards: [...(parsedData.awards || []), ...(prev.awards || [])],
        contactInfo: [...(parsedData.contactInfo || []), ...(prev.contactInfo || [])],
        customSections: [...(prev.customSections || [])],
      };
      
      // Process otherSections from AI into custom sections
      if (parsedData.otherSections && Array.isArray(parsedData.otherSections)) {
        console.log("📋 Processing", parsedData.otherSections.length, "unknown sections from AI");
        
        parsedData.otherSections.forEach((section: any) => {
          if (!section.sectionTitle || !section.items || !Array.isArray(section.items)) {
            console.warn("⚠️ Skipping invalid section:", section);
            return;
          }
          
          // Format items as markdown list
          const content = section.items.map((item: string, index: number) => {
            // If item is already detailed, use as-is, otherwise add bullet
            if (item.includes('\n') || item.length > 100) {
              return `**${index + 1}.** ${item.trim()}`;
            }
            return `• ${item.trim()}`;
          }).join('\n\n');
          
          const customSection = {
            id: `imported-${section.sectionTitle.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
            title: section.sectionTitle,
            content: content,
            order: (merged.customSections?.length || 0) + parsedData.otherSections.indexOf(section),
          };
          
          merged.customSections = [...(merged.customSections || []), customSection];
          console.log(`✅ Added custom section: "${section.sectionTitle}" with ${section.items.length} items`);
        });
      }
      
      return merged;
    });

    toast({
      title: "CV Data Imported",
      description: "Review the imported data and make any necessary adjustments before saving.",
    });

    // Auto-save after import with a delay
    setTimeout(() => {
      console.log("💾 Auto-saving imported CV data...");
      handleSave(false);
    }, 1500);
  };

  const renderSection = () => {
    // Handle Design and Layout tabs
    if (activeTab === "design") {
      return (
        <ThemeEditor
          currentTheme={customTheme || CV_THEMES.find(t => t.id === cvData.theme) || CV_THEMES[0]}
          onThemeChange={(theme) => {
            setCustomTheme(theme);
            setCVData((prev: any) => ({
              ...prev,
              theme: theme.id,
              themeData: theme,
            }));
          }}
          onSaveCustomTheme={async (theme, name, description) => {
            try {
              const response = await fetch('/api/themes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  name,
                  description: description || null,
                  themeData: theme,
                }),
              });

              if (response.ok) {
                toast({
                  title: "Success",
                  description: `Theme "${name}" saved successfully!`,
                });
                // Apply the saved theme
                setCustomTheme(theme);
                setCVData((prev: any) => ({
                  ...prev,
                  theme: theme.id,
                  themeData: theme,
                }));
              } else {
                throw new Error('Failed to save theme');
              }
            } catch (error) {
              toast({
                title: "Error",
                description: "Failed to save custom theme",
              });
            }
          }}
        />
      );
    }

    // Handle Content tab sections
    const section = sections.find(s => s.id === activeSection);
    
    // Handle custom sections
    if (section?.isCustom) {
      return (
        <CustomSection
          sectionId={section.id}
          sectionTitle={section.title}
          cv={cvData}
          setCVData={setCVData}
        />
      );
    }
    
    // Handle built-in sections
    switch (activeSection) {
      case "personal":
        return <PersonalInfoSection cv={cvData} setCVData={setCVData} profile={profile} />;
      case "education":
        return <EducationSection cv={cvData} setCVData={setCVData} />;
      case "experience":
        return <ExperienceSection cv={cvData} setCVData={setCVData} />;
      case "skills":
        return <SkillsSection cv={cvData} setCVData={setCVData} />;
      case "publications":
        return <PublicationsSection cv={cvData} setCVData={setCVData} />;
      case "projects":
        return <ProjectsSection cv={cvData} setCVData={setCVData} />;
      case "certifications":
        return <CertificationsSection cv={cvData} setCVData={setCVData} />;
      case "awards":
        return <AwardsSection cv={cvData} setCVData={setCVData} />;
      case "languages":
        return <LanguagesSection cv={cvData} setCVData={setCVData} />;
      case "references":
        return <ReferencesSection cv={cvData} setCVData={setCVData} />;
      default:
        return <div className="text-gray-500">Section coming soon...</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dashboard Header */}
      <DashboardHeader user={session?.user} />
      
      {/* Editor Header */}
      <div className="bg-white border-b sticky top-16 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/dashboard/cvs")}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <div className="flex items-center gap-2">
                  {isRenamingTitle ? (
                    <Input
                      ref={titleInputRef}
                      value={cvData.title || ""}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      onBlur={finishTitleEdit}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          finishTitleEdit();
                        }
                        if (event.key === "Escape") {
                          event.preventDefault();
                          setCVData((prev: any) => ({
                            ...prev,
                            title: titleBeforeEdit,
                          }));
                          setIsRenamingTitle(false);
                        }
                      }}
                      className="h-8 w-64"
                    />
                  ) : (
                    <>
                      <h1 className="text-xl font-semibold text-gray-900">
                        {cvData.title || "Untitled CV"}
                      </h1>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => {
                          setTitleBeforeEdit(cvData.title || "");
                          setIsRenamingTitle(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  {isSaving ? "Saving..." : hasUnsavedChanges ? "Unsaved changes" : "All changes saved"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <CVUploadDialog onParsedData={handleParsedCVData} initialOpen={shouldOpenAIImport} />
              <Button
                variant="outline"
                onClick={() => setShowPreview(!showPreview)}
              >
                <Eye className="h-4 w-4 mr-2" />
                {showPreview ? "Hide" : "Preview"}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => window.open(`/api/cvs/${cv.id}/export?format=pdf`, "_blank")}
                  >
                    Export as PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="outline" onClick={() => setShowShareDialog(true)}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button
                onClick={() => handleSave(false)}
                disabled={isSaving}
                className="gap-2"
                title={hasUnsavedChanges ? "Save your latest edits" : "All changes saved"}
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : hasUnsavedChanges ? (
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                )}
                <span>{isSaving ? "Saving..." : hasUnsavedChanges ? "Save changes" : "Saved"}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top Tabs for Design, Layout, Content */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("content")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "content"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                📝 Content
              </button>
              <button
                onClick={() => setActiveTab("design")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "design"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                🎨 Design & Theme
              </button>
            </nav>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar - Only show for Content tab */}
          {activeTab === "content" && (
            <div className="col-span-3">
              <Card className="p-4 sticky top-24">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-gray-900">Sections</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSectionManager(true)}
                    className="h-8 w-8 p-0"
                  >
                    <GripVertical className="h-4 w-4" />
                  </Button>
                </div>
                <nav className="space-y-1">
                  {sections
                    .filter(s => s.enabled)
                    .sort((a, b) => a.order - b.order)
                    .map((section) => (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                          activeSection === section.id
                            ? "bg-blue-50 text-blue-700 font-medium"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <span>{section.icon}</span>
                        <span>{section.label}</span>
                      </button>
                    ))}
                </nav>
              </Card>
            </div>
          )}

          {/* Main Content */}
          <div className={
            activeTab === "content" 
              ? (showPreview ? "col-span-5" : "col-span-9")
              : (showPreview ? "col-span-8" : "col-span-12")
          }>
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">
                  {sections.find((s) => s.id === activeSection)?.label}
                </h2>
              </div>
              {renderSection()}
            </Card>
          </div>

          {/* Preview Panel */}
          {showPreview && (
            <div className="col-span-4">
              <Card className="p-6 sticky top-24">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Live Preview
                </h2>
                <div className="border rounded-lg overflow-auto bg-white" style={{ maxHeight: '80vh' }}>
                  <div style={{ 
                    transform: 'scale(0.35)', 
                    transformOrigin: 'top left', 
                    width: '285.7%',
                    minHeight: '400px'
                  }}>
                    <CVPreview 
                      key={`${JSON.stringify(cvData.sectionOrder || [])}_${cvData.theme}_${JSON.stringify(customTheme)}`} 
                      cv={cvData} 
                      themeId={cvData.theme} 
                      layoutId={cvData.layout} 
                      customTheme={customTheme} 
                    />
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
      
      {/* Section Manager Modal */}
      {showSectionManager && (
        <SectionManager
          sections={sections}
          onUpdate={(newSections) => {
            console.log("Section order updated:", newSections);
            // Update sections with new titles/labels
            const mergedSections = newSections
              .filter(ns => ns.id !== 'design' && ns.id !== 'layout') // Exclude design/layout
              .map(ns => {
                const existing = sections.find(s => s.id === ns.id);
                return {
                  ...ns,
                  label: ns.title, // Use the updated title as label
                  icon: existing?.icon || "📄"
                };
              });
            setSections(mergedSections);
            
            // Save section configuration to CV data
            const updatedCVData = {
              ...cvData,
              sectionOrder: mergedSections.map(s => ({
                id: s.id,
                title: s.title,
                enabled: s.enabled,
                order: s.order,
                isCustom: s.isCustom,
              }))
            };
            setCVData(updatedCVData);
            
            // Trigger immediate save
            setHasUnsavedChanges(true);
            setTimeout(() => {
              handleSave(true);
            }, 100);
          }}
          onClose={() => setShowSectionManager(false)}
        />
      )}

      {/* Share Dialog */}
      <ShareDialog
        cvId={cv.id}
        isOpen={showShareDialog}
        onClose={() => {
          setShowShareDialog(false);
          // Clear the tab=share from URL when dialog closes
          if (shouldOpenShareDialog) {
            const newUrl = new URL(window.location.href);
            newUrl.searchParams.delete('tab');
            window.history.replaceState({}, '', newUrl.toString());
          }
        }}
      />
    </div>
  );
}
