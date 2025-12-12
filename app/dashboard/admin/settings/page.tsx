"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Key, Settings, Save, Eye, EyeOff, ArrowLeft, Mail, Send, Plus, Trash2 } from "lucide-react";

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState("providers");
  
  const [settings, setSettings] = useState({
    openRouterKey: "",
    openRouterModel: "meta-llama/llama-3.2-3b-instruct:free",
    openRouterFallbackModels: [] as string[],
    claudeKey: "",
    claudeModel: "claude-3-5-sonnet-20241022",
    ollamaUrl: "http://localhost:11434",
    ollamaModel: "llama3.2",
    defaultProvider: "OPENROUTER",
    aiSuggestionsEnabled: true,
    autoImproveText: false,
    citationAssist: true,
    grammarCheck: true,
    // Email/SMTP settings
    smtpHost: "",
    smtpPort: 587,
    smtpUser: "",
    smtpPassword: "",
    smtpFrom: "",
    smtpFromName: "CV Builder",
    smtpSecure: false, // legacy - kept for compatibility
    smtpSecurity: "STARTTLS", // STARTTLS, SSL, NONE
    emailVerificationEnabled: true,
    emailNotificationsEnabled: true,
    // Microsoft OAuth settings
    emailProvider: "SMTP",
    msClientId: "",
    msClientSecret: "",
    msTenantId: "common",
    msRefreshToken: "",
    msConnected: false,
    // Sharing settings
    baseUrl: typeof window !== "undefined" ? window.location.origin : "http://localhost:3000",
    enableSharing: true,
    maxSharedCvs: 10,
  });

  useEffect(() => {
    fetchSettings();
    // Check for OAuth callback result
    const params = new URLSearchParams(window.location.search);
    const success = params.get("success");
    const error = params.get("error");
    const tab = params.get("tab");
    
    if (success) {
      toast({ title: "Success", description: success });
      window.history.replaceState({}, "", window.location.pathname);
      if (tab === "email") setActiveTab("email");
    }
    if (error) {
      toast({ title: "Error", description: error });
      window.history.replaceState({}, "", window.location.pathname);
      if (tab === "email") setActiveTab("email");
    }
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/admin/ai-settings");
      if (response.ok) {
        const data = await response.json();
        if (data.settings) {
          setSettings({
            ...settings,
            ...data.settings,
            openRouterFallbackModels: data.settings.openRouterFallbackModels ? JSON.parse(data.settings.openRouterFallbackModels) : [],
            msConnected: !!data.settings.msRefreshToken,
          });
        }
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/ai-settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        toast({
          title: "Settings Saved",
          description: "AI settings have been updated successfully.",
        });
      } else {
        const error = await response.json();
        throw new Error(error.message || "Failed to save settings");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save settings",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleShowKey = (key: string) => {
    setShowKeys(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header with back button */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="h-10 w-10"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-3">
          <Sparkles className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Admin Settings</h1>
            <p className="text-muted-foreground">Configure AI providers, email, and system features</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="providers" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="providers">
            <Key className="h-4 w-4 mr-2" />
            AI Providers
          </TabsTrigger>
          <TabsTrigger value="email">
            <Mail className="h-4 w-4 mr-2" />
            Email / SMTP
          </TabsTrigger>
          <TabsTrigger value="sharing">
            <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
            </svg>
            Sharing
          </TabsTrigger>
          <TabsTrigger value="features">
            <Settings className="h-4 w-4 mr-2" />
            Features
          </TabsTrigger>
        </TabsList>

        <TabsContent value="providers" className="space-y-4">
          {/* OpenRouter */}
          <Card>
            <CardHeader>
              <CardTitle>OpenRouter</CardTitle>
              <CardDescription>
                Configure OpenRouter API settings. Supports multiple models including Llama, GPT, and more.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="openRouterKey">API Key</Label>
                <div className="flex gap-2">
                  <Input
                    id="openRouterKey"
                    type={showKeys.openRouter ? "text" : "password"}
                    placeholder="sk-or-v1-..."
                    value={settings.openRouterKey}
                    onChange={(e) => setSettings({ ...settings, openRouterKey: e.target.value })}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => toggleShowKey("openRouter")}
                  >
                    {showKeys.openRouter ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="openRouterModel">Model</Label>
                <Input
                  id="openRouterModel"
                  placeholder="meta-llama/llama-3.2-3b-instruct:free"
                  value={settings.openRouterModel}
                  onChange={(e) => setSettings({ ...settings, openRouterModel: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Examples: meta-llama/llama-3.2-3b-instruct:free, openai/gpt-3.5-turbo, anthropic/claude-3-haiku
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Fallback Models</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setSettings({ ...settings, openRouterFallbackModels: [...settings.openRouterFallbackModels, ""] })}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Fallback
                  </Button>
                </div>
                {settings.openRouterFallbackModels.map((model, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="meta-llama/llama-3.1-8b-instruct:free"
                      value={model}
                      onChange={(e) => {
                        const newModels = [...settings.openRouterFallbackModels];
                        newModels[index] = e.target.value;
                        setSettings({ ...settings, openRouterFallbackModels: newModels });
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        const newModels = settings.openRouterFallbackModels.filter((_, i) => i !== index);
                        setSettings({ ...settings, openRouterFallbackModels: newModels });
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <p className="text-xs text-muted-foreground">
                  If the primary model hits rate limits, these models will be tried in order. Leave empty to disable fallbacks.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Claude */}
          <Card>
            <CardHeader>
              <CardTitle>Anthropic Claude</CardTitle>
              <CardDescription>
                Configure Anthropic Claude API settings for advanced AI capabilities.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="claudeKey">API Key</Label>
                <div className="flex gap-2">
                  <Input
                    id="claudeKey"
                    type={showKeys.claude ? "text" : "password"}
                    placeholder="sk-ant-..."
                    value={settings.claudeKey}
                    onChange={(e) => setSettings({ ...settings, claudeKey: e.target.value })}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => toggleShowKey("claude")}
                  >
                    {showKeys.claude ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="claudeModel">Model</Label>
                <Input
                  id="claudeModel"
                  placeholder="claude-3-5-sonnet-20241022"
                  value={settings.claudeModel}
                  onChange={(e) => setSettings({ ...settings, claudeModel: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Examples: claude-3-5-sonnet-20241022, claude-3-opus-20240229, claude-3-haiku-20240307
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Ollama */}
          <Card>
            <CardHeader>
              <CardTitle>Ollama (Local)</CardTitle>
              <CardDescription>
                Configure local Ollama instance for running models on your own hardware.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ollamaUrl">Server URL</Label>
                <Input
                  id="ollamaUrl"
                  placeholder="http://localhost:11434"
                  value={settings.ollamaUrl}
                  onChange={(e) => setSettings({ ...settings, ollamaUrl: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ollamaModel">Model</Label>
                <Input
                  id="ollamaModel"
                  placeholder="llama3.2"
                  value={settings.ollamaModel}
                  onChange={(e) => setSettings({ ...settings, ollamaModel: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Examples: llama3.2, mistral, codellama, phi
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Default Provider */}
          <Card>
            <CardHeader>
              <CardTitle>Default Provider</CardTitle>
              <CardDescription>
                Select which AI provider to use by default
              </CardDescription>
            </CardHeader>
            <CardContent>
              <select
                className="w-full p-2 border rounded-md"
                value={settings.defaultProvider}
                onChange={(e) => setSettings({ ...settings, defaultProvider: e.target.value })}
              >
                <option value="OPENROUTER">OpenRouter</option>
                <option value="CLAUDE">Claude</option>
                <option value="OLLAMA">Ollama</option>
              </select>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email / SMTP Tab */}
        <TabsContent value="email" className="space-y-4">
          {/* Email Provider Selection */}
          <Card className="border-purple-200 bg-purple-50/50 dark:bg-purple-900/10 dark:border-purple-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Mail className="h-5 w-5 text-purple-600" />
                Email Provider
              </CardTitle>
              <CardDescription>
                Choose how to send emails. Microsoft OAuth is required for Outlook.com/Hotmail personal accounts.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="emailProvider"
                    value="SMTP"
                    checked={settings.emailProvider === "SMTP"}
                    onChange={() => setSettings({ ...settings, emailProvider: "SMTP" })}
                    className="w-4 h-4"
                  />
                  <span className="font-medium">SMTP (Gmail, Yahoo, etc.)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="emailProvider"
                    value="MICROSOFT"
                    checked={settings.emailProvider === "MICROSOFT"}
                    onChange={() => setSettings({ ...settings, emailProvider: "MICROSOFT" })}
                    className="w-4 h-4"
                  />
                  <span className="font-medium">Microsoft OAuth (Outlook.com/Hotmail)</span>
                </label>
              </div>
            </CardContent>
          </Card>

          {settings.emailProvider === "MICROSOFT" ? (
            /* Microsoft OAuth Configuration */
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <svg className="h-5 w-5" viewBox="0 0 24 24"><path fill="currentColor" d="M0 0h11.5v11.5H0V0zm12.5 0H24v11.5H12.5V0zM0 12.5h11.5V24H0V12.5zm12.5 0H24V24H12.5V12.5z"/></svg>
                  Microsoft Azure Configuration
                </CardTitle>
                <CardDescription>
                  Set up Microsoft OAuth to send emails through Outlook.com/Hotmail.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Setup Instructions:</h4>
                  <ol className="text-sm text-blue-700 dark:text-blue-300 space-y-1 list-decimal list-inside">
                    <li>Go to <a href="https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps/ApplicationsListBlade" target="_blank" rel="noopener noreferrer" className="underline">Azure Portal - App Registrations</a></li>
                    <li>Click &quot;New registration&quot;</li>
                    <li>Name: &quot;CV Builder Email&quot;, Account type: &quot;Personal Microsoft accounts only&quot;</li>
                    <li>Redirect URI: Web - <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">{typeof window !== "undefined" ? `${window.location.origin}/api/admin/microsoft-oauth/callback` : "/api/admin/microsoft-oauth/callback"}</code></li>
                    <li>After creation, copy the Application (client) ID</li>
                    <li>Go to &quot;Certificates &amp; secrets&quot; → &quot;New client secret&quot; → Copy the secret value</li>
                    <li>Go to &quot;API permissions&quot; → &quot;Add permission&quot; → &quot;APIs my organization uses&quot; → Search &quot;Office 365 Exchange Online&quot; → &quot;Delegated permissions&quot; → &quot;SMTP.Send&quot;</li>
                  </ol>
                </div>

                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="msClientId">Application (Client) ID</Label>
                    <Input
                      id="msClientId"
                      type="text"
                      placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                      value={settings.msClientId}
                      onChange={(e) => setSettings({ ...settings, msClientId: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="msClientSecret">Client Secret</Label>
                    <Input
                      id="msClientSecret"
                      type="password"
                      placeholder="Your client secret"
                      value={settings.msClientSecret}
                      onChange={(e) => setSettings({ ...settings, msClientSecret: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtpFrom">Your Outlook/Hotmail Email</Label>
                    <Input
                      id="smtpFrom"
                      type="email"
                      placeholder="your-email@outlook.com"
                      value={settings.smtpFrom}
                      onChange={(e) => setSettings({ ...settings, smtpFrom: e.target.value, smtpUser: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtpFromName">From Name</Label>
                    <Input
                      id="smtpFromName"
                      type="text"
                      placeholder="CV Builder"
                      value={settings.smtpFromName}
                      onChange={(e) => setSettings({ ...settings, smtpFromName: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-4 border-t">
                  {settings.msConnected ? (
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="font-medium">Connected to Microsoft</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <span className="font-medium">Not connected - Authorization required</span>
                    </div>
                  )}
                  <Button
                    onClick={async () => {
                      // Save settings first
                      await handleSave();
                      // Then redirect to Microsoft OAuth
                      const clientId = settings.msClientId;
                      const tenantId = settings.msTenantId || "common";
                      const redirectUri = encodeURIComponent(`${window.location.origin}/api/admin/microsoft-oauth/callback`);
                      const scope = encodeURIComponent("https://outlook.office.com/SMTP.Send offline_access");
                      const authUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&scope=${scope}&response_mode=query`;
                      window.location.href = authUrl;
                    }}
                    disabled={!settings.msClientId || !settings.msClientSecret || !settings.smtpFrom}
                  >
                    {settings.msConnected ? "Re-authorize" : "Authorize with Microsoft"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Quick Setup Presets */}
              <Card className="border-blue-200 bg-blue-50/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Mail className="h-5 w-5 text-blue-600" />
                    Quick Setup
                  </CardTitle>
                  <CardDescription>
                    Click a preset to auto-fill SMTP settings. You&apos;ll need to use an App Password (not your regular password).
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-3">
                    <Button
                  variant="outline"
                  onClick={() => {
                    setSettings({
                      ...settings,
                      smtpHost: "smtp.gmail.com",
                      smtpPort: 587,
                      smtpSecure: false,
                      smtpSecurity: "STARTTLS",
                    });
                    toast({
                      title: "Gmail Settings Applied",
                      description: "Enter your Gmail address and App Password below. Uses STARTTLS.",
                    });
                  }}
                >
                  <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24"><path fill="currentColor" d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/></svg>
                  Gmail
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSettings({
                      ...settings,
                      smtpHost: "smtp.office365.com",
                      smtpPort: 587,
                      smtpSecure: false,
                      smtpSecurity: "STARTTLS",
                    });
                    toast({
                      title: "Outlook/Microsoft 365 Settings Applied",
                      description: "Enter your Outlook email and App Password below. Uses STARTTLS.",
                    });
                  }}
                >
                  <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24"><path fill="currentColor" d="M24 7.387v10.478c0 .23-.08.424-.238.576-.158.154-.352.23-.58.23h-8.547v-6.959l1.6 1.229c.102.086.225.128.37.128a.548.548 0 0 0 .38-.152l.136-.137c.05-.051.09-.112.118-.184a.504.504 0 0 0-.036-.441.596.596 0 0 0-.144-.18l-2.55-1.967V7.387h8.673c.228 0 .422.076.58.23.159.151.238.345.238.576zM14.365 10.39l-1.6-1.229a.547.547 0 0 0-.37-.128.548.548 0 0 0-.38.152l-.136.137a.596.596 0 0 0-.118.184.504.504 0 0 0 .036.44c.034.07.082.131.144.181l2.55 1.967v2.56H5.818V7.387c0-.231.08-.425.238-.576.158-.154.352-.23.58-.23h7.729v3.809zM0 8.001V19.25a.73.73 0 0 0 .227.534.73.73 0 0 0 .534.216h12.478a.73.73 0 0 0 .534-.216.73.73 0 0 0 .227-.534V8.001a.73.73 0 0 0-.227-.534.73.73 0 0 0-.534-.216H.761a.73.73 0 0 0-.534.216A.73.73 0 0 0 0 8.001zm4.547 6.875c0-.978.252-1.763.757-2.356.505-.593 1.18-.889 2.023-.889.844 0 1.518.296 2.023.889.505.593.758 1.378.758 2.356 0 .979-.253 1.764-.758 2.356-.505.593-1.179.89-2.023.89-.843 0-1.518-.297-2.023-.89-.505-.592-.757-1.377-.757-2.356zm1.582 0c0 .593.113 1.053.338 1.381.226.328.535.492.928.492.393 0 .702-.164.928-.492.225-.328.338-.788.338-1.381 0-.592-.113-1.052-.338-1.38-.226-.328-.535-.492-.928-.492-.393 0-.702.164-.928.492-.225.328-.338.788-.338 1.38z"/></svg>
                  Outlook / Microsoft 365
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSettings({
                      ...settings,
                      smtpHost: "smtp-mail.outlook.com",
                      smtpPort: 587,
                      smtpSecure: false,
                      smtpSecurity: "STARTTLS",
                    });
                    toast({
                      title: "Outlook.com (Personal) Settings Applied",
                      description: "Enter your Outlook.com email and App Password below. Uses STARTTLS.",
                    });
                  }}
                >
                  <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24"><path fill="currentColor" d="M24 7.387v10.478c0 .23-.08.424-.238.576-.158.154-.352.23-.58.23h-8.547v-6.959l1.6 1.229c.102.086.225.128.37.128a.548.548 0 0 0 .38-.152l.136-.137c.05-.051.09-.112.118-.184a.504.504 0 0 0-.036-.441.596.596 0 0 0-.144-.18l-2.55-1.967V7.387h8.673c.228 0 .422.076.58.23.159.151.238.345.238.576zM14.365 10.39l-1.6-1.229a.547.547 0 0 0-.37-.128.548.548 0 0 0-.38.152l-.136.137a.596.596 0 0 0-.118.184.504.504 0 0 0 .036.44c.034.07.082.131.144.181l2.55 1.967v2.56H5.818V7.387c0-.231.08-.425.238-.576.158-.154.352-.23.58-.23h7.729v3.809z"/></svg>
                  Outlook.com (Personal)
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSettings({
                      ...settings,
                      smtpHost: "smtp.mail.yahoo.com",
                      smtpPort: 587,
                      smtpSecure: false,
                      smtpSecurity: "STARTTLS",
                    });
                    toast({
                      title: "Yahoo Mail Settings Applied",
                      description: "Enter your Yahoo email and App Password below. Uses STARTTLS.",
                    });
                  }}
                >
                  <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24"><path fill="currentColor" d="M10.816 0c-1.394.008-2.447.088-2.541.106-.354.09-.748.35-.977.651-.159.21-.226.378-.38.948l-.05.185-.064-.143c-.168-.38-.4-.624-.765-.804-.252-.124-.476-.152-1.18-.148-.426.003-4.326.024-4.326.024l3.39 7.283-.009.125c-.032.532-.085.783-.244 1.167-.165.397-.263.554-.664 1.055-.222.278-.54.69-.708.918l-.304.414.025.236c.034.333.187.672.417.921.253.275.576.427.993.469.208.02 3.966.036 3.966.036l.534-1.22.393-.89.463.916.564 1.117h2.69l1.282-.015c.086-.007.171-.005.249.005l2.399.019c-.166-.354-1.426-2.892-1.426-2.892l-.2-.37c-.242-.451-.452-.84-.608-1.126l-.152-.283-.038-.07-.198-.386c-.03-.055-.06-.11-.09-.167l-.09-.172-.044-.085c-.089-.175-.176-.352-.264-.534l-.051-.103-.069-.143-.049-.103c-.161-.337-.315-.67-.457-.996l-.063-.142c-.068-.155-.135-.31-.2-.46l-.082-.194c-.043-.103-.087-.207-.13-.308l-.074-.18c-.04-.096-.078-.19-.115-.283l-.041-.1a29.503 29.503 0 0 1-.107-.273 39.82 39.82 0 0 1-.119-.31l-.065-.175c-.04-.108-.078-.213-.115-.317l-.027-.074c-.045-.126-.09-.25-.132-.37l-.015-.042c-.048-.138-.094-.273-.14-.404l-.058-.174c-.03-.092-.06-.182-.09-.27l-.025-.08-.052-.16-.032-.102a9.51 9.51 0 0 1-.028-.091l-.024-.08c-.024-.082-.05-.163-.074-.24l-.007-.02-.016-.054a5.96 5.96 0 0 1-.014-.048L11.018 0h-.201zm7.176 0s1.783 3.988 1.863 4.162l.003.008c.009.019.017.038.024.057l.018.05c.022.065.046.136.072.213l.008.023c.021.064.042.128.063.194.012.038.025.077.038.117l.043.14.017.057c.013.045.027.09.04.137l.024.083c.011.039.023.078.034.118l.028.1.026.096.027.102.03.114.021.082c.01.04.02.08.03.121l.025.103c.009.036.017.072.026.109l.028.121.023.099c.01.044.02.089.03.134l.02.093c.012.056.024.113.037.17l.018.085c.018.089.037.18.057.272l.008.041c.045.219.093.447.143.686l.013.063c.058.283.118.577.181.88l.035.17c.032.157.064.316.096.476l.036.18.068.345.03.155.06.308.028.148.057.297.026.139.054.286.024.131.052.277.023.124.05.269.02.115.052.283.018.097.05.283.012.066.064.362.004.022c.028.163.057.33.086.499l.017.103c.077.448.159.93.247 1.438l.013.082h3.926L19.925 0H17.99z"/></svg>
                  Yahoo Mail
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSettings({
                      ...settings,
                      smtpHost: "smtp.163.com",
                      smtpPort: 465,
                      smtpSecure: true,
                      smtpSecurity: "SSL",
                    });
                    toast({
                      title: "163.com Settings Applied",
                      description: "Enter your 163.com email and authorization code below. Uses SSL.",
                    });
                  }}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  163.com
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSettings({
                      ...settings,
                      smtpHost: "smtp.qq.com",
                      smtpPort: 465,
                      smtpSecure: true,
                      smtpSecurity: "SSL",
                    });
                    toast({
                      title: "QQ Mail Settings Applied",
                      description: "Enter your QQ email and authorization code below. Uses SSL.",
                    });
                  }}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  QQ Mail
                </Button>
              </div>
              <div className="text-xs text-muted-foreground space-y-2 mt-3">
                <p><strong>Security:</strong> STARTTLS (port 587) upgrades to TLS, SSL (port 465) is direct TLS, None (port 25) is unencrypted</p>
                <p><strong>Gmail (Recommended):</strong> Google Account → Security → 2-Step Verification → App passwords</p>
                <p><strong>Microsoft 365 (Business):</strong> Security → Advanced security → App passwords</p>
                <p><strong>Yahoo:</strong> Account Security → Generate app password</p>
                <p><strong>163.com / QQ Mail:</strong> 设置 → POP3/SMTP → 开启 → 获取授权码</p>
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded">
                  <p className="text-blue-800 dark:text-blue-200 font-medium">💡 For Outlook.com/Hotmail Personal</p>
                  <p className="text-blue-700 dark:text-blue-300 text-xs mt-1">
                    Microsoft requires OAuth authentication. Switch to &quot;Microsoft OAuth&quot; provider above.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SMTP Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>SMTP Configuration</CardTitle>
              <CardDescription>
                Configure your email server settings for sending verification codes and notifications.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtpHost">SMTP Host</Label>
                  <Input
                    id="smtpHost"
                    placeholder="smtp.gmail.com"
                    value={settings.smtpHost}
                    onChange={(e) => setSettings({ ...settings, smtpHost: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpPort">SMTP Port</Label>
                  <Input
                    id="smtpPort"
                    type="number"
                    placeholder="587"
                    value={settings.smtpPort}
                    onChange={(e) => setSettings({ ...settings, smtpPort: parseInt(e.target.value) || 587 })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Common ports: 587 (TLS), 465 (SSL), 25 (unencrypted)
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtpUser">SMTP Username</Label>
                  <Input
                    id="smtpUser"
                    placeholder="your-email@gmail.com"
                    value={settings.smtpUser}
                    onChange={(e) => setSettings({ ...settings, smtpUser: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpPassword">SMTP Password</Label>
                  <div className="flex gap-2">
                    <Input
                      id="smtpPassword"
                      type={showKeys.smtp ? "text" : "password"}
                      placeholder="App password or SMTP password"
                      value={settings.smtpPassword}
                      onChange={(e) => setSettings({ ...settings, smtpPassword: e.target.value })}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => toggleShowKey("smtp")}
                    >
                      {showKeys.smtp ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtpFrom">From Email Address</Label>
                  <Input
                    id="smtpFrom"
                    placeholder="noreply@yourdomain.com"
                    value={settings.smtpFrom}
                    onChange={(e) => setSettings({ ...settings, smtpFrom: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpFromName">From Name</Label>
                  <Input
                    id="smtpFromName"
                    placeholder="CV Builder"
                    value={settings.smtpFromName}
                    onChange={(e) => setSettings({ ...settings, smtpFromName: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="smtpSecurity">Connection Security</Label>
                <Select
                  value={settings.smtpSecurity}
                  onValueChange={(value) => {
                    // Auto-set port and smtpSecure based on security type
                    let port = settings.smtpPort;
                    let secure = settings.smtpSecure;
                    if (value === "SSL") {
                      port = 465;
                      secure = true;
                    } else if (value === "STARTTLS") {
                      port = 587;
                      secure = false;
                    } else if (value === "NONE") {
                      port = 25;
                      secure = false;
                    }
                    setSettings({ ...settings, smtpSecurity: value, smtpPort: port, smtpSecure: secure });
                  }}
                >
                  <SelectTrigger id="smtpSecurity">
                    <SelectValue placeholder="Select security type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STARTTLS">STARTTLS (Port 587) - Gmail, Outlook, Yahoo</SelectItem>
                    <SelectItem value="SSL">SSL/TLS (Port 465) - 163.com, QQ Mail</SelectItem>
                    <SelectItem value="NONE">None (Port 25) - Not recommended</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  STARTTLS upgrades to TLS after connecting. SSL/TLS connects encrypted from the start.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Email Features */}
          <Card>
            <CardHeader>
              <CardTitle>Email Features</CardTitle>
              <CardDescription>
                Configure which email features are enabled
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="emailVerificationEnabled">Email Verification</Label>
                  <p className="text-sm text-muted-foreground">
                    Require email verification for new user signups
                  </p>
                </div>
                <Switch
                  id="emailVerificationEnabled"
                  checked={settings.emailVerificationEnabled}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, emailVerificationEnabled: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="emailNotificationsEnabled">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Send notification emails (password reset, account updates, etc.)
                  </p>
                </div>
                <Switch
                  id="emailNotificationsEnabled"
                  checked={settings.emailNotificationsEnabled}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, emailNotificationsEnabled: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Test Email */}
          <Card>
            <CardHeader>
              <CardTitle>Test Email Configuration</CardTitle>
              <CardDescription>
                Send a test email to verify your SMTP settings are working correctly.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={async () => {
                  setTestingEmail(true);
                  try {
                    const response = await fetch("/api/admin/test-email", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(settings),
                    });
                    const data = await response.json();
                    if (response.ok) {
                      toast({
                        title: "Test Email Sent!",
                        description: `Email sent successfully to ${settings.smtpUser || settings.smtpFrom}`,
                      });
                    } else {
                      throw new Error(data.error || "Failed to send test email");
                    }
                  } catch (error) {
                    toast({
                      title: "Error",
                      description: error instanceof Error ? error.message : "Failed to send test email",
                    });
                  } finally {
                    setTestingEmail(false);
                  }
                }}
                disabled={testingEmail || (settings.emailProvider === "SMTP" ? (!settings.smtpHost || !settings.smtpUser || !settings.smtpPassword) : !settings.msConnected)}
              >
                <Send className="h-4 w-4 mr-2" />
                {testingEmail ? "Sending..." : "Send Test Email"}
              </Button>
            </CardContent>
          </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="sharing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sharing Configuration</CardTitle>
              <CardDescription>
                Configure how CV sharing works, including base URL and sharing limits.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="baseUrl">Base URL</Label>
                <Input
                  id="baseUrl"
                  placeholder="https://yourdomain.com"
                  value={settings.baseUrl}
                  onChange={(e) => setSettings({ ...settings, baseUrl: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  The base URL for generating share links. This should be your domain name (e.g., https://cvbuilder.com).
                  Used for creating shareable links and QR codes. (Currently read-only from environment)
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="enableSharing">Enable CV Sharing</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow users to share their CVs publicly with links and QR codes
                  </p>
                </div>
                <Switch
                  id="enableSharing"
                  checked={settings.enableSharing}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, enableSharing: checked })
                  }
                />
                <p className="text-xs text-muted-foreground ml-2">
                  (Currently controlled by ENABLE_SHARING environment variable)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxSharedCvs">Maximum Shared CVs per User</Label>
                <Input
                  id="maxSharedCvs"
                  type="number"
                  min="1"
                  max="100"
                  value={settings.maxSharedCvs}
                  onChange={(e) => setSettings({ ...settings, maxSharedCvs: parseInt(e.target.value) || 10 })}
                />
                <p className="text-xs text-muted-foreground">
                  The maximum number of CVs a user can share simultaneously. Set to 0 for unlimited.
                  (Currently controlled by MAX_SHARED_CVS environment variable)
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Features</CardTitle>
              <CardDescription>
                Enable or disable specific AI-powered features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="aiSuggestionsEnabled">AI Suggestions</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable AI-powered content suggestions in the CV editor
                  </p>
                </div>
                <Switch
                  id="aiSuggestionsEnabled"
                  checked={settings.aiSuggestionsEnabled}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, aiSuggestionsEnabled: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="autoImproveText">Auto Improve Text</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically enhance and improve written content
                  </p>
                </div>
                <Switch
                  id="autoImproveText"
                  checked={settings.autoImproveText}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, autoImproveText: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="citationAssist">Citation Assistant</Label>
                  <p className="text-sm text-muted-foreground">
                    AI-powered citation formatting and suggestions
                  </p>
                </div>
                <Switch
                  id="citationAssist"
                  checked={settings.citationAssist}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, citationAssist: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="grammarCheck">Grammar Check</Label>
                  <p className="text-sm text-muted-foreground">
                    Real-time grammar and spelling corrections
                  </p>
                </div>
                <Switch
                  id="grammarCheck"
                  checked={settings.grammarCheck}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, grammarCheck: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={loading} size="lg">
          <Save className="h-4 w-4 mr-2" />
          {loading ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </div>
  );
}
