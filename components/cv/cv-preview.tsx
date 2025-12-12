"use client";

import { CVPreviewContent, type CVPreviewProps } from "./cv-preview-content";
import React from "react";

// A4 content width calculation mirroring PDF renderer (210mm - horizontal margins)
const A4_WIDTH_MM = 210;
const H_MARGIN_MM = 18; // keep in sync with PDF horizontal margins
const MM_TO_PX = (mm: number) => (mm / 25.4) * 96;
const CONTENT_WIDTH_PX = Math.round(MM_TO_PX(A4_WIDTH_MM - H_MARGIN_MM * 2));

export type { CVPreviewProps } from "./cv-preview-content";

export function CVPreview(props: CVPreviewProps) {
  return (
    <div
      className="cv-preview-a4-wrapper"
      style={{
        width: CONTENT_WIDTH_PX,
        maxWidth: CONTENT_WIDTH_PX,
        margin: "0 auto",
      }}
    >
      <CVPreviewContent {...props} />
    </div>
  );
}

