"use client";

import { useState, useEffect } from "react";
import { CVTheme, CV_THEMES } from "@/lib/cv-themes";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Palette, 
  Type, 
  Layout, 
  Sparkles, 
  Copy, 
  RotateCcw,
  Save,
  Eye,
  Trash2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ThemeEditorProps {
  currentTheme: CVTheme;
  onThemeChange: (theme: CVTheme) => void;
  onSaveCustomTheme?: (theme: CVTheme, name: string, description?: string) => void;
}

export function ThemeEditor({ currentTheme, onThemeChange, onSaveCustomTheme }: ThemeEditorProps) {
  const [theme, setTheme] = useState<CVTheme>(currentTheme);
  const [previewMode, setPreviewMode] = useState<"colors" | "typography" | "full">("colors");
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [themeName, setThemeName] = useState("");
  const [themeDescription, setThemeDescription] = useState("");
  const [savedThemes, setSavedThemes] = useState<CVTheme[]>([]);
  const [loadingThemes, setLoadingThemes] = useState(true);
  const [deletingThemeId, setDeletingThemeId] = useState<string | null>(null);

  // Load saved themes on mount
  useEffect(() => {
    loadSavedThemes();
  }, []);

  useEffect(() => {
    setTheme(currentTheme);
  }, [currentTheme]);

  const loadSavedThemes = async () => {
    try {
      const response = await fetch('/api/themes');
      if (response.ok) {
        const data = await response.json();
        const themeRecords = Array.isArray(data) ? data : data?.themes || [];
        const themes = themeRecords.map((t: any) => ({
          ...JSON.parse(t.themeData),
          id: t.id,
          name: t.name,
        }));
        setSavedThemes(themes);
      }
    } catch (error) {
      console.error('Failed to load saved themes:', error);
    } finally {
      setLoadingThemes(false);
    }
  };

  const handleDeleteTheme = async (themeId: string) => {
    setDeletingThemeId(themeId);
    try {
      const response = await fetch(`/api/themes/${themeId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete theme');
      }

      setSavedThemes((prev) => prev.filter((theme) => theme.id !== themeId));

      if (theme.id === themeId) {
        const fallback = CV_THEMES[0];
        setTheme(fallback);
        onThemeChange(fallback);
      }

      toast.success('Theme removed');
    } catch (error) {
      console.error('Failed to delete theme:', error);
      toast.error('Failed to remove theme');
    } finally {
      setDeletingThemeId(null);
    }
  };

  const updateTheme = (updates: Partial<CVTheme>) => {
    const newTheme = { ...theme, ...updates };
    setTheme(newTheme);
    onThemeChange(newTheme);
  };

  const updateColors = (colorUpdates: Partial<CVTheme["colors"]>) => {
    updateTheme({
      colors: { ...theme.colors, ...colorUpdates },
    });
  };

  const updateTypography = (typoUpdates: Partial<CVTheme["typography"]>) => {
    updateTheme({
      typography: { ...theme.typography, ...typoUpdates },
    });
  };

  const updateLayout = (layoutUpdates: Partial<CVTheme["layout"]>) => {
    updateTheme({
      layout: { ...theme.layout, ...layoutUpdates },
    });
  };

  const updateStyle = (styleUpdates: Partial<CVTheme["style"]>) => {
    updateTheme({
      style: { ...theme.style, ...styleUpdates },
    });
  };

  const resetToPreset = (presetId: string) => {
    // Check if it's a saved custom theme
    const savedTheme = savedThemes.find(t => t.id === presetId);
    if (savedTheme) {
      setTheme(savedTheme);
      onThemeChange(savedTheme);
      return;
    }
    
    // Otherwise it's a preset
    const preset = CV_THEMES.find(t => t.id === presetId);
    if (preset) {
      setTheme(preset);
      onThemeChange(preset);
    }
  };

  const duplicateTheme = () => {
    const newTheme = {
      ...theme,
      id: `custom-${Date.now()}`,
      name: `${theme.name} (Copy)`,
    };
    setTheme(newTheme);
    onThemeChange(newTheme);
  };

  const handleSaveTheme = () => {
    if (!themeName.trim()) {
      alert("Please enter a theme name");
      return;
    }
    
    if (onSaveCustomTheme) {
      const customTheme = {
        ...theme,
        id: `custom-${Date.now()}`,
        name: themeName.trim(),
      };
      onSaveCustomTheme(customTheme, themeName.trim(), themeDescription.trim());
      setShowSaveDialog(false);
      setThemeName("");
      setThemeDescription("");
      // Reload saved themes
      setTimeout(() => loadSavedThemes(), 500);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Theme Customization
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Customize every aspect of your CV's appearance with live preview
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={duplicateTheme}>
            <Copy className="h-4 w-4 mr-2" />
            Duplicate
          </Button>
          {onSaveCustomTheme && (
            <Button size="sm" onClick={() => setShowSaveDialog(true)}>
              <Save className="h-4 w-4 mr-2" />
              Save Theme
            </Button>
          )}
        </div>
      </div>

      {/* Preset Selector */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Choose a Theme</CardTitle>
          <CardDescription className="text-xs">
            Select a preset theme or one of your saved custom themes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={theme.id} onValueChange={resetToPreset}>
            <SelectTrigger>
              <SelectValue placeholder="Select a theme" />
            </SelectTrigger>
            <SelectContent>
              {/* Preset Themes */}
              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                Preset Themes
              </div>
              {CV_THEMES.map((preset) => (
                <SelectItem key={preset.id} value={preset.id}>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full border"
                      style={{ backgroundColor: preset.colors.primary }}
                    />
                    {preset.name}
                  </div>
                </SelectItem>
              ))}
              
              {/* Saved Custom Themes */}
              {savedThemes.length > 0 && (
                <>
                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground border-t mt-2 pt-2">
                    My Custom Themes
                  </div>
                  {savedThemes.map((saved) => (
                    <SelectItem key={saved.id} value={saved.id}>
                      <div className="flex items-center gap-2 w-full">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-red-500 hover:text-red-600"
                          onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            if (!deletingThemeId) {
                              handleDeleteTheme(saved.id);
                            }
                          }}
                          disabled={deletingThemeId === saved.id}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                        <div
                          className="w-4 h-4 rounded-full border"
                          style={{ backgroundColor: saved.colors.primary }}
                        />
                        {saved.name}
                        <span className="text-xs text-muted-foreground ml-auto">★</span>
                      </div>
                    </SelectItem>
                  ))}
                </>
              )}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Customization Tabs */}
      <Tabs defaultValue="colors" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="colors">
            <Palette className="h-4 w-4 mr-2" />
            Colors
          </TabsTrigger>
          <TabsTrigger value="typography">
            <Type className="h-4 w-4 mr-2" />
            Typography
          </TabsTrigger>
          <TabsTrigger value="layout">
            <Layout className="h-4 w-4 mr-2" />
            Layout
          </TabsTrigger>
          <TabsTrigger value="style">
            <Sparkles className="h-4 w-4 mr-2" />
            Style
          </TabsTrigger>
          <TabsTrigger value="photo">
            📷 Photo
          </TabsTrigger>
        </TabsList>

        {/* Colors Tab */}
        <TabsContent value="colors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Color Palette</CardTitle>
              <CardDescription>
                Customize the color scheme of your CV
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ColorPicker
                label="Primary Color"
                value={theme.colors.primary}
                onChange={(color) => updateColors({ primary: color })}
              />
              <ColorPicker
                label="Secondary Color"
                value={theme.colors.secondary}
                onChange={(color) => updateColors({ secondary: color })}
              />
              <ColorPicker
                label="Accent Color"
                value={theme.colors.accent}
                onChange={(color) => updateColors({ accent: color })}
              />
              <ColorPicker
                label="Text Color"
                value={theme.colors.textPrimary}
                onChange={(color) => updateColors({ textPrimary: color })}
              />
              <ColorPicker
                label="Text Muted"
                value={theme.colors.textSecondary}
                onChange={(color) => updateColors({ textSecondary: color })}
              />
              <ColorPicker
                label="Background Color"
                value={theme.colors.background}
                onChange={(color) => updateColors({ background: color })}
              />
              <ColorPicker
                label="Border Color"
                value={theme.colors.border}
                onChange={(color) => updateColors({ border: color })}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Typography Tab */}
        <TabsContent value="typography" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Typography Settings</CardTitle>
              <CardDescription>
                Control fonts, sizes, and text styles
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Heading Font</Label>
                <Select
                  value={theme.typography.headingFont || 'Helvetica'}
                  onValueChange={(value) => updateTypography({ headingFont: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Helvetica">Helvetica</SelectItem>
                    <SelectItem value="Arial">Arial</SelectItem>
                    <SelectItem value="Times-Roman">Times New Roman</SelectItem>
                    <SelectItem value="Courier">Courier</SelectItem>
                    <SelectItem value="Georgia">Georgia</SelectItem>
                    <SelectItem value="Verdana">Verdana</SelectItem>
                    <SelectItem value="Garamond">Garamond</SelectItem>
                    <SelectItem value="Palatino">Palatino</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Body Font</Label>
                <Select
                  value={theme.typography.bodyFont || 'Helvetica'}
                  onValueChange={(value) => updateTypography({ bodyFont: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Helvetica">Helvetica</SelectItem>
                    <SelectItem value="Arial">Arial</SelectItem>
                    <SelectItem value="Times-Roman">Times New Roman</SelectItem>
                    <SelectItem value="Courier">Courier</SelectItem>
                    <SelectItem value="Georgia">Georgia</SelectItem>
                    <SelectItem value="Verdana">Verdana</SelectItem>
                    <SelectItem value="Garamond">Garamond</SelectItem>
                    <SelectItem value="Palatino">Palatino</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Base Font Size: {theme.typography.baseFontSize || '10px'}</Label>
                <Slider
                  value={[parseInt(theme.typography.baseFontSize || '10')]}
                  onValueChange={([value]) => updateTypography({ baseFontSize: `${value}px` })}
                  min={12}
                  max={18}
                  step={1}
                />
              </div>

              <div className="space-y-2">
                <Label>Line Height: {theme.typography.lineHeight || '1.5'}</Label>
                <Slider
                  value={[parseFloat(theme.typography.lineHeight || '1.5')]}
                  onValueChange={([value]) => updateTypography({ lineHeight: value.toFixed(1) })}
                  min={1.2}
                  max={2.0}
                  step={0.1}
                />
              </div>

              <div className="space-y-2">
                <Label>Heading Transform</Label>
                <Select
                  value={theme.typography.headingTransform || 'uppercase'}
                  onValueChange={(value: "none" | "uppercase" | "capitalize" | "lowercase" | "first-capital") =>
                    updateTypography({ headingTransform: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="uppercase">UPPERCASE</SelectItem>
                    <SelectItem value="capitalize">Capitalize Each Word</SelectItem>
                    <SelectItem value="first-capital">First Capital Only</SelectItem>
                    <SelectItem value="lowercase">lowercase</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Letter Spacing: {theme.typography.letterSpacing || '0.5px'}</Label>
                <Slider
                  value={[parseFloat((theme.typography.letterSpacing || '0.5px').replace('px', ''))]}
                  onValueChange={([value]) => updateTypography({ letterSpacing: `${value}px` })}
                  min={-2}
                  max={4}
                  step={0.5}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Layout Tab */}
        <TabsContent value="layout" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Layout Settings</CardTitle>
              <CardDescription>
                Control spacing and layout structure
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Section Padding: {theme.layout.sectionPadding}px</Label>
                <Slider
                  value={[theme.layout.sectionPadding]}
                  onValueChange={([value]) => updateLayout({ sectionPadding: value })}
                  min={16}
                  max={48}
                  step={4}
                />
              </div>

              <div className="space-y-2">
                <Label>Item Spacing: {theme.layout.spacing}px</Label>
                <Slider
                  value={[theme.layout.spacing]}
                  onValueChange={([value]) => updateLayout({ spacing: value })}
                  min={8}
                  max={32}
                  step={2}
                />
              </div>

              <div className="space-y-2">
                <Label>Header Padding: {theme.layout.headerPadding}px</Label>
                <Slider
                  value={[theme.layout.headerPadding]}
                  onValueChange={([value]) => updateLayout({ headerPadding: value })}
                  min={16}
                  max={64}
                  step={4}
                />
              </div>

              <div className="space-y-2">
                <Label>Border Radius: {theme.layout.borderRadius}px</Label>
                <Slider
                  value={[theme.layout.borderRadius]}
                  onValueChange={([value]) => updateLayout({ borderRadius: value })}
                  min={0}
                  max={16}
                  step={1}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Style Tab */}
        <TabsContent value="style" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Style Options</CardTitle>
              <CardDescription>
                Customize visual styling and effects
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Border Width: {theme.style.borderWidth}px</Label>
                <Slider
                  value={[theme.style.borderWidth]}
                  onValueChange={([value]) => updateStyle({ borderWidth: value })}
                  min={0}
                  max={4}
                  step={1}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Section Dividers</Label>
                  <p className="text-sm text-muted-foreground">
                    Show dividers between sections
                  </p>
                </div>
                <Switch
                  checked={theme.style.sectionDividers}
                  onCheckedChange={(checked) => updateStyle({ sectionDividers: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Skill Pills</Label>
                  <p className="text-sm text-muted-foreground">
                    Display skills as pill-shaped tags
                  </p>
                </div>
                <Switch
                  checked={theme.style.skillPills}
                  onCheckedChange={(checked) => updateStyle({ skillPills: checked })}
                />
              </div>

              <div className="space-y-2">
                <Label>Heading Style</Label>
                <Select
                  value={theme.style.headingStyle}
                  onValueChange={(value: "bold" | "underline" | "background") =>
                    updateStyle({ headingStyle: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bold">Bold</SelectItem>
                    <SelectItem value="underline">Underline</SelectItem>
                    <SelectItem value="background">Background</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Date Format</Label>
                <Select
                  value={theme.style.dateFormat}
                  onValueChange={(value: "short" | "long" | "numeric") =>
                    updateStyle({ dateFormat: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">Short (Jan 2024)</SelectItem>
                    <SelectItem value="long">Long (January 2024)</SelectItem>
                    <SelectItem value="numeric">Numeric (01/2024)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Photo Tab */}
        <TabsContent value="photo" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Profile Photo Settings</CardTitle>
              <CardDescription>
                Customize how your photo appears on the CV
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Show Profile Photo</Label>
                  <p className="text-sm text-muted-foreground">
                    Display or hide your profile photo
                  </p>
                </div>
                <Switch
                  checked={theme.showPhoto !== false}
                  onCheckedChange={(checked) => 
                    updateTheme({ ...theme, showPhoto: checked })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Photo Shape</Label>
                <Select
                  value={theme.style.profileImageShape}
                  onValueChange={(value: "circle" | "rounded" | "square") =>
                    updateStyle({ profileImageShape: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="circle">Circle</SelectItem>
                    <SelectItem value="rounded">Rounded Square</SelectItem>
                    <SelectItem value="square">Square</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Photo Size</Label>
                <Select
                  value={theme.photoSize || 'medium'}
                  onValueChange={(value: 'small' | 'medium' | 'large' | 'xlarge' | 'xxlarge') =>
                    updateTheme({ ...theme, photoSize: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small (48px)</SelectItem>
                    <SelectItem value="medium">Medium (64px)</SelectItem>
                    <SelectItem value="large">Large (80px)</SelectItem>
                    <SelectItem value="xlarge">Extra Large (100px)</SelectItem>
                    <SelectItem value="xxlarge">XX-Large (120px)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Photo Aspect Ratio</Label>
                <Select
                  value={theme.photoAspect || 'square'}
                  onValueChange={(value: 'square' | 'portrait' | 'landscape') =>
                    updateTheme({ ...theme, photoAspect: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="square">Square (1:1)</SelectItem>
                    <SelectItem value="portrait">Portrait (3:4 - Taller)</SelectItem>
                    <SelectItem value="landscape">Landscape (4:3 - Wider)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Border Width: {theme.photoBorderWidth || 2}px</Label>
                <Slider
                  value={[theme.photoBorderWidth || 2]}
                  onValueChange={([value]) => updateTheme({ ...theme, photoBorderWidth: value })}
                  min={0}
                  max={8}
                  step={1}
                />
              </div>

              <div className="space-y-2">
                <Label>Border Color</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    value={theme.photoBorderColor || '#ffffff'}
                    onChange={(e) => updateTheme({ ...theme, photoBorderColor: e.target.value })}
                    className="flex-1"
                  />
                  <input
                    type="color"
                    value={theme.photoBorderColor || '#ffffff'}
                    onChange={(e) => updateTheme({ ...theme, photoBorderColor: e.target.value })}
                    className="w-10 h-10 rounded border cursor-pointer"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Theme Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Custom Theme</DialogTitle>
            <DialogDescription>
              Give your custom theme a name and optional description. It will be available for all your CVs.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="theme-name">Theme Name *</Label>
              <Input
                id="theme-name"
                placeholder="My Custom Theme"
                value={themeName}
                onChange={(e) => setThemeName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="theme-description">Description (Optional)</Label>
              <Input
                id="theme-description"
                placeholder="A professional theme with blue accents"
                value={themeDescription}
                onChange={(e) => setThemeDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveTheme}>
              <Save className="h-4 w-4 mr-2" />
              Save Theme
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ColorPicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (color: string) => void;
}) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex-1">
        <Label>{label}</Label>
      </div>
      <div className="flex items-center gap-2">
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-32"
        />
        <div className="relative">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-10 h-10 rounded border cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}
