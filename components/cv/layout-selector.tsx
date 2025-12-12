"use client";

import { useState } from "react";
import { CV_LAYOUTS, CVLayout } from "@/lib/cv-layouts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Columns, Rows, SidebarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface LayoutSelectorProps {
  currentLayoutId: string;
  onLayoutChange: (layoutId: string) => void;
}

export function LayoutSelector({ currentLayoutId, onLayoutChange }: LayoutSelectorProps) {
  const [selectedLayout, setSelectedLayout] = useState(currentLayoutId);

  const handleLayoutSelect = (layoutId: string) => {
    setSelectedLayout(layoutId);
    onLayoutChange(layoutId);
  };

  const getLayoutIcon = (layout: CVLayout) => {
    if (layout.columns === 1) return <Rows className="h-5 w-5" />;
    if (layout.columnRatios && layout.columnRatios[0] !== layout.columnRatios[1]) {
      return <SidebarIcon className="h-5 w-5" />;
    }
    return <Columns className="h-5 w-5" />;
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">CV Layout</h3>
        <p className="text-sm text-muted-foreground">
          Choose a layout structure for your CV. Layouts control section positioning and organization.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {CV_LAYOUTS.map((layout) => (
          <Card
            key={layout.id}
            className={cn(
              "cursor-pointer transition-all hover:shadow-md hover:border-primary/50",
              selectedLayout === layout.id && "border-primary ring-2 ring-primary/20"
            )}
            onClick={() => handleLayoutSelect(layout.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {getLayoutIcon(layout)}
                  <CardTitle className="text-sm">{layout.name}</CardTitle>
                </div>
                {selectedLayout === layout.id && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <CardDescription className="text-xs line-clamp-2">
                {layout.description}
              </CardDescription>
              
              {/* Layout Preview */}
              <div className="bg-muted rounded p-2 h-24 flex items-center justify-center">
                <LayoutPreview layout={layout} />
              </div>

              {/* Layout Info */}
              <div className="flex flex-wrap gap-1">
                <Badge variant="secondary" className="text-xs">
                  {layout.columns} {layout.columns === 1 ? "Column" : "Columns"}
                </Badge>
                <Badge variant="outline" className="text-xs capitalize">
                  {layout.spacing} spacing
                </Badge>
                <Badge variant="outline" className="text-xs capitalize">
                  {layout.headerStyle} header
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function LayoutPreview({ layout }: { layout: CVLayout }) {
  if (layout.columns === 1) {
    return (
      <div className="w-full h-full flex flex-col gap-1 p-1">
        <div className="bg-primary/20 h-3 rounded-sm" />
        <div className="bg-primary/10 h-2 rounded-sm" />
        <div className="bg-primary/10 h-2 rounded-sm" />
        <div className="bg-primary/10 h-2 rounded-sm" />
        <div className="bg-primary/10 h-2 rounded-sm" />
      </div>
    );
  }

  if (layout.columnRatios) {
    const leftRatio = layout.columnRatios[0];
    const rightRatio = layout.columnRatios[1];
    const total = leftRatio + rightRatio;
    const leftWidth = `${(leftRatio / total) * 100}%`;
    const rightWidth = `${(rightRatio / total) * 100}%`;

    return (
      <div className="w-full h-full flex gap-1 p-1">
        <div className="flex flex-col gap-1" style={{ width: leftWidth }}>
          <div className="bg-primary/20 h-2 rounded-sm" />
          <div className="bg-primary/10 h-2 rounded-sm" />
          <div className="bg-primary/10 h-2 rounded-sm" />
          <div className="bg-primary/10 h-2 rounded-sm" />
        </div>
        <div className="flex flex-col gap-1" style={{ width: rightWidth }}>
          <div className="bg-primary/20 h-2 rounded-sm" />
          <div className="bg-primary/10 h-2 rounded-sm" />
          <div className="bg-primary/10 h-2 rounded-sm" />
          <div className="bg-primary/10 h-2 rounded-sm" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex gap-1 p-1">
      <div className="flex-1 flex flex-col gap-1">
        <div className="bg-primary/20 h-2 rounded-sm" />
        <div className="bg-primary/10 h-2 rounded-sm" />
        <div className="bg-primary/10 h-2 rounded-sm" />
        <div className="bg-primary/10 h-2 rounded-sm" />
      </div>
      <div className="flex-1 flex flex-col gap-1">
        <div className="bg-primary/20 h-2 rounded-sm" />
        <div className="bg-primary/10 h-2 rounded-sm" />
        <div className="bg-primary/10 h-2 rounded-sm" />
        <div className="bg-primary/10 h-2 rounded-sm" />
      </div>
    </div>
  );
}
