"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, Loader2, CheckCircle2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface CVUploadDialogProps {
  onParsedData: (data: any) => void;
  triggerButton?: React.ReactNode;
  initialOpen?: boolean;
}

export function CVUploadDialog({ onParsedData, triggerButton, initialOpen = false }: CVUploadDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(initialOpen);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle initialOpen changes
  useEffect(() => {
    if (initialOpen) {
      setOpen(true);
    }
  }, [initialOpen]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      const validTypes = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
      const validExtensions = [".pdf", ".docx"];
      
      const isValidType = validTypes.includes(selectedFile.type) || 
                          validExtensions.some(ext => selectedFile.name.toLowerCase().endsWith(ext));
      
      if (!isValidType) {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF or DOCX file.",
        });
        return;
      }

      // Check file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload a file smaller than 10MB.",
        });
        return;
      }

      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setProgress(10);

    try {
      const formData = new FormData();
      formData.append("file", file);

      setProgress(30);

      const response = await fetch("/api/cvs/parse-upload", {
        method: "POST",
        body: formData,
      });

      setProgress(70);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to parse CV");
      }

      const data = await response.json();
      setProgress(100);

      toast({
        title: "CV Parsed Successfully",
        description: "Review the extracted data and make any necessary adjustments.",
      });

      onParsedData(data.parsedData);
      setOpen(false);
      
      // Reset state
      setTimeout(() => {
        setFile(null);
        setProgress(0);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }, 500);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to parse CV",
      });
      setProgress(0);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button variant="outline" className="gap-2">
            <Upload className="h-4 w-4" />
            Import from CV
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import CV Data</DialogTitle>
          <DialogDescription>
            Upload your existing CV (PDF or DOCX) and we'll extract the information using AI.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-gray-300 p-8">
            {!file ? (
              <>
                <FileText className="h-12 w-12 text-gray-400" />
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">
                    Drag and drop or click to upload
                  </p>
                  <p className="text-xs text-gray-500">
                    PDF or DOCX (max 10MB)
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  Select File
                </Button>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2 w-full">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
                <p className="text-sm font-medium truncate max-w-full px-4">
                  {file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
                {!uploading && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setFile(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                      }
                    }}
                  >
                    Change File
                  </Button>
                )}
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {uploading && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-center text-gray-500">
                {progress < 30 && "Uploading file..."}
                {progress >= 30 && progress < 70 && "Processing with AI..."}
                {progress >= 70 && "Finalizing..."}
              </p>
            </div>
          )}

          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="gap-2"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Import CV
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
