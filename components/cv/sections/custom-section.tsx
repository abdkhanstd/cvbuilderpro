"use client";

import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Trash2, Eye, Edit2, Bold, Italic, List, ListOrdered, Link } from "lucide-react";

interface CustomSectionProps {
  sectionId: string;
  sectionTitle: string;
  cv: any;
  setCVData: (data: any) => void;
}

export function CustomSection({ sectionId, sectionTitle, cv, setCVData }: CustomSectionProps) {
  // Get or initialize custom sections data
  const customSections = cv.customSections || [];
  const existingSection = customSections.find((s: any) => {
    if (s?.id && sectionId) {
      return s.id === sectionId;
    }
    return s.title === sectionTitle;
  });
  
  const [content, setContent] = useState(existingSection?.content || "");
  const [isRichTextMode, setIsRichTextMode] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  // Update content when cv data changes (e.g., after import)
  useEffect(() => {
    const sections = cv.customSections || [];
    const section = sections.find((s: any) => {
      if (s?.id && sectionId) {
        return s.id === sectionId;
      }
      return s.title === sectionTitle;
    });
    if (section?.content !== undefined && section.content !== content) {
      setContent(section.content);
    }
  }, [cv.customSections, sectionId, sectionTitle]);

  const updateContent = (newContent: string) => {
    setContent(newContent);

    const targetId = existingSection?.id || sectionId;
    const hasContent = newContent.trim() !== "";

    let updatedCustomSections = customSections.map((s: any) => {
      if ((s?.id && targetId && s.id === targetId) || (!s?.id && s.title === sectionTitle)) {
        return {
          ...s,
          id: targetId,
          title: sectionTitle,
          content: newContent,
          order: s.order ?? existingSection?.order ?? customSections.length,
        };
      }
      return s;
    });

    if (!customSections.some((s: any) => (s?.id && targetId && s.id === targetId) || (!s?.id && s.title === sectionTitle))) {
      if (hasContent) {
        updatedCustomSections = [
          ...customSections,
          {
            id: targetId,
            title: sectionTitle,
            content: newContent,
            order: existingSection?.order ?? customSections.length,
          },
        ];
      }
    } else if (!hasContent) {
      updatedCustomSections = updatedCustomSections.filter((s: any) => {
        if (s?.id && targetId) {
          return s.id !== targetId;
        }
        return s.title !== sectionTitle;
      });
    }

    setCVData((prev: any) => ({ ...prev, customSections: updatedCustomSections }));
  };

  const applyFormatting = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const insertMarkdown = (before: string, after: string = '') => {
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = content;
    const selectedText = text.substring(start, end) || 'text';
    const newContent = text.substring(0, start) + before + selectedText + after + text.substring(end);
    
    updateContent(newContent);
    
    // Restore cursor position
    setTimeout(() => {
      textarea.selectionStart = start + before.length;
      textarea.selectionEnd = start + before.length + selectedText.length;
      textarea.focus();
    }, 0);
  };

  const insertLink = () => {
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const url = prompt('Enter the URL:');
    if (!url) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = content;
    const selectedText = text.substring(start, end) || 'link text';
    const linkMarkdown = `[${selectedText}](${url})`;
    const newContent = text.substring(0, start) + linkMarkdown + text.substring(end);
    
    updateContent(newContent);
    
    // Restore cursor position
    setTimeout(() => {
      textarea.selectionStart = start + linkMarkdown.length;
      textarea.selectionEnd = start + linkMarkdown.length;
      textarea.focus();
    }, 0);
  };

  const deleteSection = () => {
    if (confirm(`Delete "${sectionTitle}" section? This cannot be undone.`)) {
      const updatedCustomSections = customSections.filter((s: any) => {
        if (s?.id && sectionId) {
          return s.id !== sectionId;
        }
        return s.title !== sectionTitle;
      });
      setCVData((prev: any) => ({ ...prev, customSections: updatedCustomSections }));
    }
  };

  const parseMarkdown = (text: string) => {
    return text
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/^### (.+?)$/gm, '<h3 style="font-weight: 600; margin: 8px 0;">$1</h3>')
      .replace(/^## (.+?)$/gm, '<h2 style="font-weight: 700; margin: 10px 0;">$1</h2>')
      .replace(/^# (.+?)$/gm, '<h1 style="font-weight: 800; margin: 12px 0;">$1</h1>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color: #2563eb; text-decoration: underline;">$1</a>')
      .replace(/\n- (.+?)(?=\n|$)/g, '<div style="margin-left: 20px;">• $1</div>')
      .replace(/\n\d+\. (.+?)(?=\n|$)/g, '<div style="margin-left: 20px;">1. $1</div>')
      .replace(/\n\n/g, '<br/><br/>');
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{sectionTitle}</h3>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPreviewMode(!previewMode)}
              className="flex gap-1"
            >
              {previewMode ? (
                <>
                  <Edit2 className="h-4 w-4" />
                  Edit
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4" />
                  Preview
                </>
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={deleteSection}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {!previewMode ? (
          <>
            {/* Rich Text Toolbar */}
            <div className="flex gap-1 flex-wrap p-2 border rounded-md bg-gray-50">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => insertMarkdown('**', '**')}
                className="flex gap-1"
                title="Bold (wrap text with **)"
              >
                <Bold className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => insertMarkdown('*', '*')}
                className="flex gap-1"
                title="Italic (wrap text with *)"
              >
                <Italic className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={insertLink}
                className="flex gap-1"
                title="Insert Link"
              >
                <Link className="h-4 w-4" />
              </Button>
              <div className="w-px bg-gray-300 mx-1" />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => insertMarkdown('\n- ', '')}
                className="flex gap-1"
                title="Bullet List"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => insertMarkdown('\n1. ', '')}
                className="flex gap-1"
                title="Numbered List"
              >
                <ListOrdered className="h-4 w-4" />
              </Button>
              <div className="w-px bg-gray-300 mx-1" />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => insertMarkdown('# ', '')}
                className="text-xs"
                title="Heading 1"
              >
                H1
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => insertMarkdown('## ', '')}
                className="text-xs"
                title="Heading 2"
              >
                H2
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => insertMarkdown('### ', '')}
                className="text-xs"
                title="Heading 3"
              >
                H3
              </Button>
            </div>

            <div>
              <Label>Content (Supports Markdown)</Label>
              <Textarea
                value={content}
                onChange={(e) => updateContent(e.target.value)}
                placeholder={`Add content for ${sectionTitle}...
                
Use markdown formatting:
**bold text** or *italic text*
[link text](https://example.com)
# Heading 1
## Heading 2
### Heading 3
- Bullet point
1. Numbered item`}
                rows={12}
                className="mt-1 font-mono text-sm"
              />
              <p className="text-sm text-gray-500 mt-2">
                💡 Tip: Use markdown formatting (**, *, #, -, 1.) or switch to preview mode to see how it looks.
              </p>
            </div>
          </>
        ) : (
          /* Preview Mode */
          <div className="border rounded-md p-4 bg-white min-h-64">
            <div
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{
                __html: parseMarkdown(content) || '<p style="color: #999;">No content yet</p>',
              }}
            />
          </div>
        )}
      </div>
    </Card>
  );
}
