"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FileText, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BibTeXImportProps {
  onImport: (publications: any[]) => void;
}

export function BibTeXImport({ onImport }: BibTeXImportProps) {
  const [open, setOpen] = useState(false);
  const [bibTexText, setBibTexText] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const parseBibTeX = (bibtex: string): any[] => {
    const publications: any[] = [];
    
    // Split by @ entries
    const entries = bibtex.split(/@(?=article|inproceedings|conference|book|incollection|phdthesis|mastersthesis)/gi);
    
    entries.forEach(entry => {
      if (!entry.trim()) return;
      
      // Extract entry type
      const typeMatch = entry.match(/^(article|inproceedings|conference|book|incollection|phdthesis|mastersthesis)/i);
      if (!typeMatch) return;
      
      const type = typeMatch[1].toLowerCase();
      
      // Extract fields using regex
      const getField = (fieldName: string): string => {
        const regex = new RegExp(`${fieldName}\\s*=\\s*[{"']([^}"']*)[}"']`, 'i');
        const match = entry.match(regex);
        return match ? match[1].trim() : '';
      };
      
      const getFieldBraces = (fieldName: string): string => {
        const regex = new RegExp(`${fieldName}\\s*=\\s*{([^}]*)}`, 'i');
        const match = entry.match(regex);
        return match ? match[1].trim() : getField(fieldName);
      };
      
      // Determine if it's journal or conference
      const journal = getFieldBraces('journal');
      const booktitle = getFieldBraces('booktitle');
      const venue = journal || booktitle;
      const publicationType = journal ? 'journal' : 'conference';
      
      const publication = {
        id: Date.now().toString() + Math.random(),
        title: getFieldBraces('title'),
        authors: getFieldBraces('author').replace(/\s+and\s+/gi, ', '),
        journal: journal,
        conference: booktitle,
        venue: venue, // Store both in venue for easy access
        publicationType: publicationType, // 'journal' or 'conference'
        year: getField('year'),
        volume: getField('volume'),
        number: getField('number'),
        pages: getField('pages'),
        doi: getField('doi'),
        url: getField('url'),
        abstract: getFieldBraces('abstract'),
        publisher: getFieldBraces('publisher'),
        organization: getFieldBraces('organization'),
        issn: getField('issn'),
        isbn: getField('isbn'),
        keywords: getFieldBraces('keywords'),
        month: getField('month'),
        note: getFieldBraces('note'),
      };
      
      // Only add if has at least title and authors
      if (publication.title && publication.authors) {
        publications.push(publication);
      }
    });
    
    return publications;
  };

  const handleImport = () => {
    if (!bibTexText.trim()) {
      toast({
        title: "Error",
        description: "Please paste BibTeX entries",
      });
      return;
    }

    setLoading(true);
    try {
      const parsedPublications = parseBibTeX(bibTexText);
      
      if (parsedPublications.length === 0) {
        toast({
          title: "No Publications Found",
          description: "Could not parse any valid BibTeX entries. Please check the format.",
        });
        return;
      }

      onImport(parsedPublications);
      
      toast({
        title: "Import Successful",
        description: `Imported ${parsedPublications.length} publication(s)`,
      });
      
      setOpen(false);
      setBibTexText("");
    } catch (error) {
      console.error("BibTeX import error:", error);
      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : "Failed to parse BibTeX",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <FileText className="h-4 w-4 mr-2" />
          Import BibTeX
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Publications from BibTeX</DialogTitle>
          <DialogDescription>
            Paste one or more BibTeX entries below. The parser supports @article, @inproceedings, @conference, @book, and thesis entries.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="bibtex">BibTeX Entries</Label>
            <Textarea
              id="bibtex"
              placeholder={`@article{einstein1905,
  author = {Einstein, Albert},
  title = {On the Electrodynamics of Moving Bodies},
  journal = {Annalen der Physik},
  year = {1905},
  volume = {17},
  pages = {891--921},
  doi = {10.1002/andp.19053221004}
}

@inproceedings{turing1950,
  author = {Turing, Alan M.},
  title = {Computing Machinery and Intelligence},
  booktitle = {Mind},
  year = {1950},
  volume = {59},
  pages = {433--460}
}`}
              value={bibTexText}
              onChange={(e) => setBibTexText(e.target.value)}
              className="font-mono text-xs h-96"
            />
            <p className="text-xs text-muted-foreground">
              Tip: You can paste multiple entries at once. Each entry should start with @article, @inproceedings, @conference, etc.
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={loading}>
            <Upload className="h-4 w-4 mr-2" />
            {loading ? "Importing..." : "Import Publications"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
