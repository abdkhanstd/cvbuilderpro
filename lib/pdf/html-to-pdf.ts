import puppeteer from "puppeteer";

const DEFAULT_PDF_OPTIONS = {
  printBackground: true,
  preferCSSPageSize: true,
  displayHeaderFooter: false,
};

export async function htmlToPdfBuffer(html: string): Promise<Buffer> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    // Align Puppeteer margins with CSS @page margins (updated defaults: 22mm top/bottom, 18mm sides)
    const pdfData = await page.pdf({
      ...DEFAULT_PDF_OPTIONS,
      margin: {
        top: "22mm",
        right: "18mm",
        bottom: "22mm",
        left: "18mm",
      },
      format: "A4",
    });

    await page.close();
    const pdfBuffer = Buffer.isBuffer(pdfData) ? pdfData : Buffer.from(pdfData);
    return pdfBuffer;
  } finally {
    await browser.close();
  }
}
