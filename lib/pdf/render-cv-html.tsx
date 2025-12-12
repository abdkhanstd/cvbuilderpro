import "server-only";
import { CVPreviewContent, type CVPreviewProps } from "@/components/cv/cv-preview-content";

const MM_TO_PX = (mm: number) => Math.round((mm / 25.4) * 96);
const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;
// Default page margins (can be overridden via options later if needed)
const PAGE_MARGIN_MM = { top: 22, right: 18, bottom: 22, left: 18 } as const;

const PAGE_WIDTH_PX = MM_TO_PX(A4_WIDTH_MM);
const PAGE_HEIGHT_PX = MM_TO_PX(A4_HEIGHT_MM);
const CONTENT_WIDTH_PX = MM_TO_PX(A4_WIDTH_MM - PAGE_MARGIN_MM.left - PAGE_MARGIN_MM.right);

type RenderOptions = Pick<CVPreviewProps, "themeId" | "layoutId" | "customTheme"> & {
  scale?: number;
};

const GOOGLE_FONTS = [
  "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
  "https://fonts.googleapis.com/css2?family=Source+Serif+Pro:wght@400;600;700&display=swap",
];

export async function renderCVToHTML(cv: any, options: RenderOptions = {}): Promise<string> {
  const { renderToStaticMarkup } = await import("react-dom/server");

  const { themeId, layoutId, customTheme, scale = 1 } = options;

  const content = renderToStaticMarkup(
    <div className="cv-page">
      <div
        className="cv-page-inner"
        style={{
          transform: scale !== 1 ? `scale(${scale})` : undefined,
          transformOrigin: scale !== 1 ? "top left" : undefined,
        }}
      >
        <CVPreviewContent
          cv={cv}
          themeId={themeId}
          layoutId={layoutId}
          customTheme={customTheme ?? null}
          staticMode
        />
      </div>
    </div>
  );

  const fontLinks = GOOGLE_FONTS.map(
    (href) => `<link rel="stylesheet" href="${href}" />`
  ).join("\n");

  const tailwindConfig = `
    <script>
      tailwind.config = {
        important: true,
        corePlugins: { preflight: false },
        theme: {
          extend: {
            fontFamily: {
              sans: ["Inter", "sans-serif"],
              serif: ["Source Serif Pro", "serif"],
            },
          },
        },
      };
    </script>
  `;

  const baseStyles = `
    <style>
      @page {
        size: ${A4_WIDTH_MM}mm ${A4_HEIGHT_MM}mm;
        margin: ${PAGE_MARGIN_MM.top}mm ${PAGE_MARGIN_MM.right}mm ${PAGE_MARGIN_MM.bottom}mm ${PAGE_MARGIN_MM.left}mm;
      }
      :root {
        color-scheme: light;
      }
      html, body {
        margin: 0;
        padding: 0;
        background: #ffffff;
        font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      }
      body {
        box-sizing: border-box;
        min-height: 100vh;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      img {
        max-width: 100%;
      }
      /* Profile photo styles to prevent squeezing */
      img[alt="Profile photo"], img[alt*="Profile"] {
        object-fit: cover !important;
        object-position: center center !important;
      }
      a {
        color: inherit;
        text-decoration: none;
      }
      .cv-page {
        width: ${CONTENT_WIDTH_PX}px;
        max-width: ${CONTENT_WIDTH_PX}px;
        margin: 0 auto;
        background: #ffffff;
        box-sizing: border-box;
      }
      /* Removed page-frame overlay */
      .cv-page-inner {
        width: 100%;
        box-sizing: border-box;
        background: #ffffff;
      }
      section {
        break-inside: auto;
        page-break-inside: auto;
      }
      .avoid-page-break {
        break-inside: avoid;
        page-break-inside: avoid;
        -webkit-column-break-inside: avoid;
      }
      @media print {
        html, body {
          width: ${A4_WIDTH_MM}mm;
          height: ${A4_HEIGHT_MM}mm;
          background: #ffffff;
          padding: 0;
        }
        .cv-page {
          width: ${CONTENT_WIDTH_PX}px;
          max-width: ${CONTENT_WIDTH_PX}px;
        }
        /* page-frame removed */
      }
    </style>
  `;

  return `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>${cv?.title ? String(cv.title) : "CV Preview"}</title>
      ${fontLinks}
      ${baseStyles}
      ${tailwindConfig}
      <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body>
      ${content}
    </body>
  </html>`;
}
