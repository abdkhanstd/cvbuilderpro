declare module "html-to-docx" {
  export default function HTMLToDOCX(
    html: string,
    template?: unknown,
    options?: Record<string, unknown>,
  ): Promise<Buffer>;
}
