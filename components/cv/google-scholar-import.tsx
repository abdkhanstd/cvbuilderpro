"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { ExternalLink, Loader2, Download } from "lucide-react";

interface GoogleScholarImportProps {
  onImport: (data: {
    publications: any[];
    profile: {
      name: string;
      hIndex: number;
      totalCitations: number;
      i10Index?: number;
    };
  }) => void;
}

export function GoogleScholarImport({ onImport }: GoogleScholarImportProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scholarUrl, setScholarUrl] = useState("");

  const handleImport = async () => {
    if (!scholarUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a Google Scholar profile URL",
      });
      return;
    }

    // Validate URL format
    if (!scholarUrl.includes("scholar.google.com/citations?user=")) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid Google Scholar profile URL (e.g., https://scholar.google.com/citations?user=XXXXX)",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/scholar/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: scholarUrl }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to import from Google Scholar");
      }

      const data = await response.json();
      
      onImport(data);
      
      toast({
        title: "Import Successful",
        description: `Imported ${data.publications.length} publications and profile metrics`,
      });
      
      setOpen(false);
      setScholarUrl("");
    } catch (error) {
      console.error("Google Scholar import error:", error);
      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : "Failed to import from Google Scholar",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Import from Google Scholar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Import from Google Scholar</DialogTitle>
          <DialogDescription>
            Enter your Google Scholar profile URL to automatically import your publications, citations, and h-index.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="scholar-url">Google Scholar Profile URL</Label>
            <Input
              id="scholar-url"
              placeholder="https://scholar.google.com/citations?user=XXXXX"
              value={scholarUrl}
              onChange={(e) => setScholarUrl(e.target.value)}
              disabled={loading}
            />
            <p className="text-xs text-gray-500">
              Go to your Google Scholar profile, copy the URL from your browser's address bar
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">What will be imported:</h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>✓ Your name (editable after import)</li>
              <li>✓ All your publications with citations</li>
              <li>✓ h-index and total citations</li>
              <li>✓ Publication metadata (title, authors, journal, year)</li>
            </ul>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-500">
            <ExternalLink className="h-3 w-3" />
            <a
              href="https://scholar.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Don't have a profile? Create one on Google Scholar
            </a>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {loading ? "Importing..." : "Import"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
