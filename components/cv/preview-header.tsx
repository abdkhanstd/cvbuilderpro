"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Share2 } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PreviewHeaderProps {
  cvId: string;
  cvTitle: string;
}

export function PreviewHeader({ cvId, cvTitle }: PreviewHeaderProps) {
  return (
    <div className="bg-white border-b sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/cvs">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to CVs
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {cvTitle}
              </h1>
              <p className="text-sm text-gray-500">Preview Mode</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href={`/dashboard/cvs/${cvId}/edit`}>
              <Button variant="outline">Edit CV</Button>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() =>
                    window.open(
                      `/api/cvs/${cvId}/export?format=pdf`,
                      "_blank"
                    )
                  }
                >
                  Export as PDF
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    window.open(
                      `/api/cvs/${cvId}/export?format=html`,
                      "_blank"
                    )
                  }
                >
                  Export as HTML
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    window.open(
                      `/api/cvs/${cvId}/export?format=word`,
                      "_blank"
                    )
                  }
                >
                  Export as Word
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    window.open(
                      `/api/cvs/${cvId}/export?format=latex`,
                      "_blank"
                    )
                  }
                >
                  Export as LaTeX
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
