"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FileText,
  Eye,
  Download,
  Share2,
  Copy,
  Trash2,
  Search,
  Filter,
  MoreVertical,
  Edit,
  MessageSquareText,
  Loader2,
  Wand2,
  Check,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface CV {
  id: string;
  title: string;
  template: string;
  isPublic: boolean;
  viewCount: number;
  downloadCount: number;
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    shares: number;
    comments: number;
    exports: number;
  };
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

interface CVListProps {
  cvs: CV[];
}

export function CVList({ cvs }: CVListProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTemplate, setFilterTemplate] = useState<string>("all");
  const [showAIReviewDialog, setShowAIReviewDialog] = useState(false);
  const [selectedCvForReview, setSelectedCvForReview] = useState<CV | null>(null);
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewResult, setReviewResult] = useState<AIReviewResult | null>(null);
  const [appliedFixes, setAppliedFixes] = useState<Set<number>>(new Set());
  const [applyingFix, setApplyingFix] = useState<number | null>(null);
  const [addingSkills, setAddingSkills] = useState(false);

  const filteredCVs = cvs.filter((cv) => {
    const matchesSearch = cv.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesTemplate =
      filterTemplate === "all" || cv.template === filterTemplate;
    return matchesSearch && matchesTemplate;
  });

  const templates = Array.from(new Set(cvs.map((cv) => cv.template)));

  const handleDuplicate = async (cvId: string) => {
    try {
      const response = await fetch(`/api/cvs/${cvId}/duplicate`, {
        method: "POST",
      });
      if (response.ok) {
        window.location.reload();
      }
    } catch (error) {
      console.error("Failed to duplicate CV:", error);
    }
  };

  const handleDelete = async (cvId: string) => {
    if (!confirm("Are you sure you want to delete this CV?")) return;

    try {
      const response = await fetch(`/api/cvs/${cvId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        window.location.reload();
      }
    } catch (error) {
      console.error("Failed to delete CV:", error);
    }
  };

  const handleExportPDF = (cvId: string) => {
    window.open(`/api/cvs/${cvId}/export?format=pdf`, "_blank");
  };

  const handleShare = (cvId: string) => {
    router.push(`/dashboard/cvs/${cvId}/edit?tab=share`);
  };

  const handleOpenAIReview = (cv: CV) => {
    setSelectedCvForReview(cv);
    setReviewResult(null);
    setAppliedFixes(new Set());
    setShowAIReviewDialog(true);
  };

  const handleAIReview = async () => {
    if (!selectedCvForReview) return;

    setIsReviewing(true);
    setReviewResult(null);

    try {
      const response = await fetch(`/api/cvs/${selectedCvForReview.id}/ai-review`, {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to get AI review");
      }

      const data = await response.json();
      setReviewResult(data.suggestions);
      setAppliedFixes(new Set());
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
    if (!selectedCvForReview || !improvement.replacementText) return;

    setApplyingFix(index);
    try {
      const response = await fetch(`/api/cvs/${selectedCvForReview.id}/ai-fix`, {
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
    if (!selectedCvForReview || !reviewResult?.suggestedSkills?.length) return;

    setAddingSkills(true);
    try {
      const response = await fetch(`/api/cvs/${selectedCvForReview.id}/ai-fix`, {
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

  if (cvs.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No CVs yet
        </h3>
        <p className="text-gray-600 mb-6">
          Get started by creating your first CV
        </p>
        <Link href="/dashboard/cvs/new">
          <Button size="lg">Create Your First CV</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search CVs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filterTemplate}
            onChange={(e) => setFilterTemplate(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Templates</option>
            {templates.map((template) => (
              <option key={template} value={template}>
                {template}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* CV Grid */}
      {filteredCVs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">No CVs match your search criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCVs.map((cv) => (
            <Card key={cv.id} className="hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {cv.title}
                    </h3>
                    <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                      {cv.template}
                    </span>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => router.push(`/dashboard/cvs/${cv.id}/edit`)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push(`/dashboard/cvs/${cv.id}/preview`)}>
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDuplicate(cv.id)}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleExportPDF(cv.id)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Export PDF
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleShare(cv.id)}
                      >
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleOpenAIReview(cv)}
                      >
                        <MessageSquareText className="h-4 w-4 mr-2" />
                        Review with AI
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDelete(cv.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      <span>{cv.viewCount} views</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Download className="h-4 w-4" />
                      <span>{cv.downloadCount} downloads</span>
                    </div>
                  </div>
                  {cv._count && (
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Share2 className="h-4 w-4" />
                        <span>{cv._count.shares} shares</span>
                      </div>
                    </div>
                  )}
                  <p className="text-xs">
                    Updated {formatDistanceToNow(new Date(cv.updatedAt))} ago
                  </p>
                </div>

                <div className="flex gap-2">
                  <Link href={`/dashboard/cvs/${cv.id}/edit`} className="flex-1">
                    <Button variant="outline" className="w-full">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </Link>
                  <Link href={`/dashboard/cvs/${cv.id}/preview`}>
                    <Button variant="outline">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* AI Review Dialog */}
      <Dialog open={showAIReviewDialog} onOpenChange={(open) => {
        setShowAIReviewDialog(open);
        if (!open) {
          setReviewResult(null);
          setSelectedCvForReview(null);
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>AI CV Review</DialogTitle>
            <DialogDescription>
              {selectedCvForReview ? `Reviewing: ${selectedCvForReview.title}` : "Get AI-powered suggestions to improve your CV"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {!reviewResult && (
              <Button 
                onClick={handleAIReview} 
                className="w-full" 
                disabled={isReviewing}
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
                  Review Again
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
