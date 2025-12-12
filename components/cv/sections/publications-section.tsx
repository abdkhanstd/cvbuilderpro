"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Trash2, Copy } from "lucide-react";
import { AISuggestButton } from "@/components/cv/ai-suggest-button";
import { BibTeXImport } from "@/components/cv/bibtex-import";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PublicationsSectionProps {
  cv: any;
  setCVData: (data: any) => void;
}

export function PublicationsSection({ cv, setCVData }: PublicationsSectionProps) {
  const [publications, setPublications] = useState(cv.publications || []);
  const [groupBy, setGroupBy] = useState<'none' | 'type'>(cv.publicationsGroupBy || 'none');
  const [sortBy, setSortBy] = useState<'date' | 'rank' | 'custom'>(cv.publicationsSortBy || 'date');
  const [citationStyle, setCitationStyle] = useState(cv.citationStyle || 'APA');
  const [showNumbering, setShowNumbering] = useState(cv.showNumbering ?? true);
  const [numberingStyle, setNumberingStyle] = useState(cv.numberingStyle || 'grouped');

  const handleGroupByChange = (value: 'none' | 'type') => {
    setGroupBy(value);
    setCVData((prev: any) => ({ ...prev, publicationsGroupBy: value }));
  };

  const handleSortByChange = (value: 'date' | 'rank' | 'custom') => {
    setSortBy(value);
    setCVData((prev: any) => ({ ...prev, publicationsSortBy: value }));
  };

  const handleCitationStyleChange = (value: string) => {
    setCitationStyle(value);
    setCVData((prev: any) => ({ ...prev, citationStyle: value }));
  };

  const handleNumberingChange = (value: string) => {
    setShowNumbering(value === 'true');
    setCVData((prev: any) => ({ ...prev, showNumbering: value === 'true' }));
  };

  const handleNumberingStyleChange = (value: string) => {
    setNumberingStyle(value);
    setCVData((prev: any) => ({ ...prev, numberingStyle: value }));
  };

  const handleBibTeXImport = (importedPubs: any[]) => {
    const updated = [...publications, ...importedPubs];
    setPublications(updated);
    setCVData((prev: any) => ({ ...prev, publications: updated }));
  };

  const addPublication = () => {
    const newPublication = {
      id: Date.now().toString(),
      title: "",
      authors: "",
      journal: "",
      conference: "",
      venue: "",
      publicationType: "journal", // 'journal' or 'conference'
      year: new Date().getFullYear().toString(),
      volume: "",
      pages: "",
      doi: "",
      url: "",
      abstract: "",
      publicationDate: "",
      citationFormat: "APA",
    };
    const updated = [...publications, newPublication];
    setPublications(updated);
    setCVData((prev: any) => ({ ...prev, publications: updated }));
  };

  const updatePublication = (index: number, field: string, value: any) => {
    const updated = [...publications];
    updated[index] = { ...updated[index], [field]: value };
    setPublications(updated);
    setCVData((prev: any) => ({ ...prev, publications: updated }));
  };

  const removePublication = (index: number) => {
    const updated = publications.filter((_: any, i: number) => i !== index);
    setPublications(updated);
    setCVData((prev: any) => ({ ...prev, publications: updated }));
  };

  const generateCitation = (pub: any, format: string) => {
    // Simple citation generator
    switch (format) {
      case "APA":
        return `${pub.authors} (${pub.year}). ${pub.title}. ${pub.journal}${
          pub.volume ? `, ${pub.volume}` : ""
        }${pub.pages ? `, ${pub.pages}` : ""}${pub.doi ? `. https://doi.org/${pub.doi}` : ""}`;
      case "IEEE":
        return `${pub.authors}, "${pub.title}," ${pub.journal}${
          pub.volume ? `, vol. ${pub.volume}` : ""
        }${pub.pages ? `, pp. ${pub.pages}` : ""}, ${pub.year}${
          pub.doi ? `, doi: ${pub.doi}` : ""
        }.`;
      default:
        return `${pub.authors}. ${pub.title}. ${pub.journal}, ${pub.year}.`;
    }
  };

  // Sort publications
  const getSortedPublications = () => {
    let sorted = [...publications];
    
    switch (sortBy) {
      case 'date':
        sorted.sort((a, b) => parseInt(b.year || '0') - parseInt(a.year || '0'));
        break;
      case 'rank':
        // For now, just sort by year (can be enhanced with journal ranking data)
        sorted.sort((a, b) => parseInt(b.year || '0') - parseInt(a.year || '0'));
        break;
      case 'custom':
        // Keep original order (can be enhanced with drag-and-drop)
        break;
    }
    
    return sorted;
  };

  // Group publications by type
  const getGroupedPublications = () => {
    const sorted = getSortedPublications();
    
    if (groupBy === 'type') {
      const journals = sorted.filter(p => p.publicationType === 'journal' || p.journal);
      const conferences = sorted.filter(p => p.publicationType === 'conference' || (!p.journal && p.conference));
      return { journals, conferences };
    }
    
    return { all: sorted };
  };

  const groupedPubs = getGroupedPublications();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Publications</h2>
          <p className="text-sm text-gray-500">
            Add publications manually or import from BibTeX
          </p>
        </div>
        <div className="flex gap-2">
          <BibTeXImport onImport={handleBibTeXImport} />
        </div>
      </div>

      {/* Display and Sorting Options */}
      <Card className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label>Citation Style</Label>
            <Select value={citationStyle} onValueChange={handleCitationStyleChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="APA">APA</SelectItem>
                <SelectItem value="IEEE">IEEE</SelectItem>
                <SelectItem value="MLA">MLA</SelectItem>
                <SelectItem value="Chicago">Chicago</SelectItem>
                <SelectItem value="Harvard">Harvard</SelectItem>
                <SelectItem value="Vancouver">Vancouver</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Show Numbering</Label>
            <Select value={showNumbering.toString()} onValueChange={handleNumberingChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Yes</SelectItem>
                <SelectItem value="false">No</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Numbering Style</Label>
            <Select 
              value={numberingStyle} 
              onValueChange={handleNumberingStyleChange}
              disabled={!showNumbering}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sequential">Sequential [1], [2]</SelectItem>
                <SelectItem value="grouped">Grouped [J1], [C1]</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Group By</Label>
            <Select value={groupBy} onValueChange={handleGroupByChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Grouping</SelectItem>
                <SelectItem value="type">By Type (Journal/Conference)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 mt-4">
          <div className="space-y-2">
            <Label>Sort By</Label>
            <Select value={sortBy} onValueChange={handleSortByChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date (Newest First)</SelectItem>
                <SelectItem value="rank">Journal Rank</SelectItem>
                <SelectItem value="custom">Custom Order</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Display Grouped Publications */}
      <div className="space-y-4">
        {groupBy === 'type' ? (
          <>
            {groupedPubs.journals && groupedPubs.journals.length > 0 && (
              <div>
                <h3 className="text-md font-semibold text-gray-800 mb-3">
                  Journal Articles ({groupedPubs.journals.length})
                </h3>
                {groupedPubs.journals.map((pub: any, index: number) => (
                  <PublicationCard
                    key={pub.id || index}
                    pub={pub}
                    index={publications.indexOf(pub)}
                    displayNumber={index + 1}
                    updatePublication={updatePublication}
                    removePublication={removePublication}
                  />
                ))}
              </div>
            )}
            
            {groupedPubs.conferences && groupedPubs.conferences.length > 0 && (
              <div className="mt-6">
                <h3 className="text-md font-semibold text-gray-800 mb-3">
                  Conference Papers ({groupedPubs.conferences.length})
                </h3>
                {groupedPubs.conferences.map((pub: any, index: number) => (
                  <PublicationCard
                    key={pub.id || index}
                    pub={pub}
                    index={publications.indexOf(pub)}
                    displayNumber={index + 1}
                    updatePublication={updatePublication}
                    removePublication={removePublication}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          groupedPubs.all?.map((pub: any, index: number) => (
            <PublicationCard
              key={pub.id || index}
              pub={pub}
              index={index}
              displayNumber={index + 1}
              updatePublication={updatePublication}
              removePublication={removePublication}
            />
          ))
        )}
      </div>

      <Button onClick={addPublication} variant="outline" className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        Add Publication Manually
      </Button>
    </div>
  );
}

// Separate component for publication card
function PublicationCard({ pub, index, displayNumber, updatePublication, removePublication }: any) {
  return (
    <Card className="p-4 mb-4">
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-medium text-gray-900">
          [{displayNumber}] Publication
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => removePublication(index)}
        >
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
      </div>

      <div className="space-y-4">
        <div>
          <Label>Publication Type</Label>
          <Select 
            value={pub.publicationType || 'journal'} 
            onValueChange={(value) => updatePublication(index, 'publicationType', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="journal">Journal Article</SelectItem>
              <SelectItem value="conference">Conference Paper</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Title *</Label>
          <Input
            value={pub.title}
            onChange={(e) =>
              updatePublication(index, "title", e.target.value)
            }
            placeholder="Publication title"
          />
        </div>

        <div>
          <Label>Authors *</Label>
          <Input
            value={pub.authors}
            onChange={(e) =>
              updatePublication(index, "authors", e.target.value)
            }
            placeholder="Smith, J., Doe, A., & Johnson, B."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>{pub.publicationType === 'conference' ? 'Conference Name' : 'Journal Name'} *</Label>
            <Input
              value={pub.publicationType === 'conference' ? pub.conference : pub.journal}
              onChange={(e) =>
                updatePublication(index, pub.publicationType === 'conference' ? 'conference' : 'journal', e.target.value)
              }
              placeholder={pub.publicationType === 'conference' ? 'Conference name' : 'Journal name'}
            />
          </div>
          
          <div>
            <Label>Year *</Label>
            <Input
              value={pub.year}
              onChange={(e) =>
                updatePublication(index, "year", e.target.value)
              }
              placeholder="2024"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label>Volume</Label>
            <Input
              value={pub.volume}
              onChange={(e) =>
                updatePublication(index, "volume", e.target.value)
              }
              placeholder="Vol"
            />
          </div>
          
          <div>
            <Label>Number</Label>
            <Input
              value={pub.number || ''}
              onChange={(e) =>
                updatePublication(index, "number", e.target.value)
              }
              placeholder="No"
            />
          </div>
          
          <div>
            <Label>Pages</Label>
            <Input
              value={pub.pages}
              onChange={(e) =>
                updatePublication(index, "pages", e.target.value)
              }
              placeholder="1-10"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>DOI</Label>
            <Input
              value={pub.doi}
              onChange={(e) =>
                updatePublication(index, "doi", e.target.value)
              }
              placeholder="10.1000/xyz123"
            />
          </div>
          
          <div>
            <Label>URL</Label>
            <Input
              value={pub.url}
              onChange={(e) =>
                updatePublication(index, "url", e.target.value)
              }
              placeholder="https://..."
            />
          </div>
        </div>
      </div>
    </Card>
  );
}
