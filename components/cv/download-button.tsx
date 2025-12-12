"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface DownloadButtonProps {
  cvId: string;
  shareId: string;
}

export function DownloadButton({ cvId, shareId }: DownloadButtonProps) {
  return (
    <Button
      variant="outline"
      onClick={() => window.open(`/api/cvs/${cvId}/export?format=pdf&shareId=${shareId}`, "_blank")}
    >
      <Download className="h-4 w-4 mr-2" />
      Download PDF
    </Button>
  );
}