"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Copy, Sparkles, Loader2, Download, MessageSquareText, Wand2, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CV {
  id: string;
  title: string;
}

interface AIReviewResult {
  overallScore: number;
  summary: string;
  strengths: string[];
  improvements: Array<{
    section: string;
    field?: string;
    issue: string;
    suggestion: string;
    replacementText?: string;
    priority: string;
  }>;
  missingElements: string[];
  industryTips: string[];
  suggestedSkills?: string[];
}

export function QuickActions() {
  const router = useRouter();
  const { toast } = useToast();
  const [isImporting, setIsImporting] = useState(false);
  const [cvs, setCvs] = useState<CV[]>([]);
  const [selectedCvId, setSelectedCvId] = useState<string>("");
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showAIReviewDialog, setShowAIReviewDialog] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewResult, setReviewResult] = useState<AIReviewResult | null>(null);
  const [appliedFixes, setAppliedFixes] = useState<Set<number>>(new Set());
  const [applyingFix, setApplyingFix] = useState<number | null>(null);
  const [addingSkills, setAddingSkills] = useState(false);

  // Fetch CVs for selection
  useEffect(() => {
    const fetchCVs = async () => {
      try {
        const response = await fetch("/api/cvs");
        if (response.ok) {
          const data = await response.json();
          setCvs(data);
          if (data.length > 0) {
            setSelectedCvId(data[0].id);
          }
        }
      } catch (error) {
        console.error("Failed to fetch CVs:", error);
      }
    };
    fetchCVs();
  }, []);

  const handleImportWithAI = async () => {
    setIsImporting(true);
    try {
      const response = await fetch("/api/cvs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Imported CV",
          template: "MODERN",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create CV");
      }

      const data = await response.json();
      router.push(`/dashboard/cvs/${data.id}/edit?import=ai`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create CV. Please try again.",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleExportPDF = () => {
    if (!selectedCvId) {
      toast({
        title: "No CV Selected",
        description: "Please select a CV to export.",
      });
      return;
    }
    window.open(`/api/cvs/${selectedCvId}/export?format=pdf`, "_blank");
    setShowExportDialog(false);
  };

  const handleAIReview = async () => {
    if (!selectedCvId) {
      toast({
        title: "No CV Selected",
        description: "Please select a CV to review.",
      });
      return;
    }

    setIsReviewing(true);
    setReviewResult(null);

    try {
      const response = await fetch(`/api/cvs/${selectedCvId}/ai-review`, {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to get AI review");
      }

      const data = await response.json();
      setReviewResult(data.suggestions);
      setAppliedFixes(new Set()); // Reset applied fixes for new review
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to get AI suggestions.",
      });
    } finally {
      setIsReviewing(false);
    }
  };

  const handleApplyFix = async (index: number, improvement: AIReviewResult['improvements'][0]) => {
    if (!selectedCvId || !improvement.replacementText) return;

    setApplyingFix(index);
    try {
      const response = await fetch(`/api/cvs/${selectedCvId}/ai-fix`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          section: improvement.section,
          field: improvement.field || improvement.section.toLowerCase(),
          value: improvement.replacementText,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to apply fix");
      }

      setAppliedFixes(prev => new Set([...prev, index]));
      toast({
        title: "Fix Applied",
        description: `Successfully updated ${improvement.section}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to apply fix.",
      });
    } finally {
      setApplyingFix(null);
    }
  };

  const handleAddSuggestedSkills = async () => {
    if (!selectedCvId || !reviewResult?.suggestedSkills?.length) return;

    setAddingSkills(true);
    try {
      const response = await fetch(`/api/cvs/${selectedCvId}/ai-fix`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          section: "skills",
          action: "add",
          value: reviewResult.suggestedSkills,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to add skills");
      }

      toast({
        title: "Skills Added",
        description: `Added ${reviewResult.suggestedSkills.length} skills to your CV`,
      });
      
      // Remove suggested skills from the result
      setReviewResult(prev => prev ? { ...prev, suggestedSkills: [] } : null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add skills.",
      });
    } finally {
      setAddingSkills(false);
    }
  };

  const actions = [
    {
      title: "Create New CV",
      description: "Start from scratch",
      icon: Plus,
      href: "/dashboard/cvs/new",
      variant: "default" as const,
    },
    {
      title: "Import with AI",
      description: "Upload existing CV",
      icon: Sparkles,
      onClick: handleImportWithAI,
      variant: "outline" as const,
    },
    {
      title: "Export PDF",
      description: "Download your CV",
      icon: Download,
      onClick: () => setShowExportDialog(true),
      variant: "outline" as const,
    },
    {
      title: "AI CV Review",
      description: "Get suggestions",
      icon: MessageSquareText,
      onClick: () => setShowAIReviewDialog(true),
      variant: "outline" as const,
    },
    {
      title: "Duplicate CV",
      description: "Clone existing CV",
      icon: Copy,
      href: "/dashboard/cvs",
      variant: "outline" as const,
    },
  ];

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {actions.map((action) => {
              const Icon = action.icon;
              
              if (action.onClick) {
                return (
                  <Button 
                    key={action.title}
                    variant={action.variant} 
                    className="w-full justify-start" 
                    size="lg"
                    onClick={action.onClick}
                    disabled={isImporting && action.title === "Import with AI"}
                  >
                    {isImporting && action.title === "Import with AI" ? (
                      <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                    ) : (
                      <Icon className="mr-3 h-5 w-5" />
                    )}
                    <div className="text-left">
                      <div className="font-semibold">{action.title}</div>
                      <div className="text-xs text-muted-foreground">{action.description}</div>
                    </div>
                  </Button>
                );
              }
              
              return (
                <Link key={action.title} href={action.href!} className="block">
                  <Button variant={action.variant} className="w-full justify-start" size="lg">
                    <Icon className="mr-3 h-5 w-5" />
                    <div className="text-left">
                      <div className="font-semibold">{action.title}</div>
                      <div className="text-xs text-muted-foreground">{action.description}</div>
                    </div>
                  </Button>
                </Link>
              );
            })}
          </div>

        <div className="mt-6 pt-6 border-t space-y-4">
          <div>
            <h4 className="text-sm font-semibold mb-2">Resources</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/docs" className="hover:text-primary">
                  • Documentation
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-2">Need Help?</h4>
            <Link href="/support">
              <Button variant="outline" size="sm" className="w-full">
                Contact Support
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>

    {/* Export PDF Dialog */}
    <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export CV as PDF</DialogTitle>
          <DialogDescription>
            Select which CV you want to export
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Select value={selectedCvId} onValueChange={setSelectedCvId}>
            <SelectTrigger>
              <SelectValue placeholder="Select a CV" />
            </SelectTrigger>
            <SelectContent>
              {cvs.map((cv) => (
                <SelectItem key={cv.id} value={cv.id}>
                  {cv.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleExportPDF} className="w-full" disabled={!selectedCvId}>
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </DialogContent>
    </Dialog>

    {/* AI Review Dialog */}
    <Dialog open={showAIReviewDialog} onOpenChange={(open) => {
      setShowAIReviewDialog(open);
      if (!open) setReviewResult(null);
    }}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>AI CV Review</DialogTitle>
          <DialogDescription>
            Get AI-powered suggestions to improve your CV
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {!reviewResult && (
            <>
              <Select value={selectedCvId} onValueChange={setSelectedCvId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a CV to review" />
                </SelectTrigger>
                <SelectContent>
                  {cvs.map((cv) => (
                    <SelectItem key={cv.id} value={cv.id}>
                      {cv.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                onClick={handleAIReview} 
                className="w-full" 
                disabled={!selectedCvId || isReviewing}
              >
                {isReviewing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <MessageSquareText className="mr-2 h-4 w-4" />
                    Get AI Suggestions
                  </>
                )}
              </Button>
            </>
          )}

          {reviewResult && (
            <div className="space-y-6">
              {/* Score */}
              <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                <div className="text-4xl font-bold text-primary">
                  {reviewResult.overallScore}
                </div>
                <div>
                  <div className="font-semibold">Overall Score</div>
                  <div className="text-sm text-muted-foreground">{reviewResult.summary}</div>
                </div>
              </div>

              {/* Strengths */}
              {reviewResult.strengths?.length > 0 && (
                <div>
                  <h4 className="font-semibold text-green-600 mb-2">✓ Strengths</h4>
                  <ul className="space-y-1 text-sm">
                    {reviewResult.strengths.map((s, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-green-600">•</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Improvements */}
              {reviewResult.improvements?.length > 0 && (
                <div>
                  <h4 className="font-semibold text-amber-600 mb-2">⚡ Suggested Improvements</h4>
                  <div className="space-y-3">
                    {reviewResult.improvements.map((imp, i) => (
                      <div key={i} className={`p-3 rounded-lg border ${
                        appliedFixes.has(i) 
                          ? 'bg-green-50 border-green-200' 
                          : 'bg-amber-50 border-amber-200'
                      }`}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium px-2 py-0.5 bg-amber-200 rounded">
                              {imp.section}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded ${
                              imp.priority === 'high' ? 'bg-red-200 text-red-700' :
                              imp.priority === 'medium' ? 'bg-amber-200 text-amber-700' :
                              'bg-gray-200 text-gray-700'
                            }`}>
                              {imp.priority}
                            </span>
                          </div>
                          {appliedFixes.has(i) && (
                            <span className="text-xs text-green-600 flex items-center gap-1">
                              <Check className="h-3 w-3" /> Applied
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-700">{imp.issue}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          <strong>Suggestion:</strong> {imp.suggestion}
                        </p>
                        {imp.replacementText && !appliedFixes.has(i) && (
                          <div className="mt-2 pt-2 border-t border-amber-200">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <p className="text-xs text-gray-500 mb-1">Replacement text:</p>
                                <p className="text-sm text-gray-700 bg-white p-2 rounded border border-amber-100">
                                  {imp.replacementText.length > 150 
                                    ? `${imp.replacementText.substring(0, 150)}...` 
                                    : imp.replacementText}
                                </p>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                className="shrink-0 border-amber-400 hover:bg-amber-100"
                                onClick={() => handleApplyFix(i, imp)}
                                disabled={applyingFix === i}
                              >
                                {applyingFix === i ? (
                                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                ) : (
                                  <Wand2 className="h-3 w-3 mr-1" />
                                )}
                                Fix
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggested Skills */}
              {reviewResult.suggestedSkills && reviewResult.suggestedSkills.length > 0 && (
                <div>
                  <h4 className="font-semibold text-purple-600 mb-2">🎯 Suggested Skills to Add</h4>
                  <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex flex-wrap gap-2 mb-3">
                      {reviewResult.suggestedSkills.map((skill, i) => (
                        <span key={i} className="text-xs px-2 py-1 bg-purple-200 text-purple-700 rounded">
                          {skill}
                        </span>
                      ))}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full border-purple-400 hover:bg-purple-100"
                      onClick={handleAddSuggestedSkills}
                      disabled={addingSkills}
                    >
                      {addingSkills ? (
                        <>
                          <Loader2 className="h-3 w-3 animate-spin mr-1" />
                          Adding...
                        </>
                      ) : (
                        <>
                          <Wand2 className="h-3 w-3 mr-1" />
                          Add All Skills to CV
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* Missing Elements */}
              {reviewResult.missingElements?.length > 0 && (
                <div>
                  <h4 className="font-semibold text-red-600 mb-2">⚠ Missing Elements</h4>
                  <ul className="space-y-1 text-sm">
                    {reviewResult.missingElements.map((m, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-red-600">•</span>
                        {m}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Industry Tips */}
              {reviewResult.industryTips?.length > 0 && (
                <div>
                  <h4 className="font-semibold text-blue-600 mb-2">💡 Pro Tips</h4>
                  <ul className="space-y-1 text-sm">
                    {reviewResult.industryTips.map((t, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-blue-600">•</span>
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <Button 
                variant="outline" 
                onClick={() => setReviewResult(null)}
                className="w-full"
              >
                Review Another CV
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}
