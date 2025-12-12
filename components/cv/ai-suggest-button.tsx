"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Loader2 } from "lucide-react";

interface AISuggestButtonProps {
  section: string;
  field: string;
  context: any;
  currentValue: string;
  onSuggestion: (suggestion: string) => void;
  className?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
}

export function AISuggestButton({
  section,
  field,
  context,
  currentValue,
  onSuggestion,
  className,
  variant = "outline",
  size = "sm",
}: AISuggestButtonProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSuggest = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/ai/suggest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          section,
          field,
          context,
          currentValue,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate suggestion");
      }

      const data = await response.json();
      
      if (data.suggestion) {
        onSuggestion(data.suggestion);
        toast({
          title: "AI Suggestion Generated",
          description: "The suggestion has been generated. Review and edit as needed.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate AI suggestion",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={handleSuggest}
      disabled={loading}
      className={className}
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Sparkles className="h-4 w-4 mr-2" />
          AI Suggest
        </>
      )}
    </Button>
  );
}
