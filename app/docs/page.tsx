import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, BookOpen, User, FileText, Sparkles, Download, Share2, Settings, HelpCircle } from "lucide-react";

export default function DocumentationPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <BookOpen className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl">Documentation</span>
            </div>
          </div>
          <Link href="/auth/register">
            <Button>Get Started</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            CV Builder Pro
            <span className="block text-primary mt-2">User Guide</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Learn how to create professional academic CVs with our comprehensive guide.
            From getting started to advanced features, find everything you need here.
          </p>
        </div>
      </section>

      {/* Quick Start */}
      <section className="py-16 px-4 bg-secondary/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Quick Start Guide</h2>
            <p className="text-lg text-muted-foreground">
              Get up and running in minutes
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="text-center">
                <User className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle className="text-lg">1. Create Account</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-center">
                  Sign up for a free account and verify your email address.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <FileText className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle className="text-lg">2. Create Your CV</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-center">
                  Choose a template and start building your professional CV.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <Sparkles className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle className="text-lg">3. Use AI Features</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-center">
                  Leverage AI to improve your content and get suggestions.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <Download className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle className="text-lg">4. Export & Share</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-center">
                  Download your CV in multiple formats and share it online.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Detailed Documentation */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Getting Started */}
            <div className="lg:col-span-2 space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Getting Started
                  </CardTitle>
                  <CardDescription>
                    Set up your account and get familiar with the platform
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Account Registration</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Create your free account by clicking "Get Started" on the homepage.
                      You'll need to provide a valid email address for verification.
                    </p>
                    <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                      <li>Fill out the registration form with your details</li>
                      <li>Check your email for a verification link</li>
                      <li>Click the link to activate your account</li>
                      <li>Log in with your credentials</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Dashboard Overview</h4>
                    <p className="text-sm text-muted-foreground">
                      After logging in, you'll be taken to your dashboard where you can:
                    </p>
                    <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1 mt-2">
                      <li>View all your CVs</li>
                      <li>Create new CVs</li>
                      <li>Access your profile settings</li>
                      <li>Manage your account preferences</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Creating Your CV
                  </CardTitle>
                  <CardDescription>
                    Step-by-step guide to building your professional CV
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Starting a New CV</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      From your dashboard, click "Create New CV" to begin.
                    </p>
                    <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                      <li>Choose from various professional templates</li>
                      <li>Select your preferred theme and layout</li>
                      <li>Give your CV a descriptive name</li>
                      <li>Start filling in your information</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Filling Out Sections</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Use the editor to add content to different sections:
                    </p>
                    <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                      <li><strong>Personal Info:</strong> Name, contact details, professional summary</li>
                      <li><strong>Experience:</strong> Work history, achievements, responsibilities</li>
                      <li><strong>Education:</strong> Degrees, institutions, dates</li>
                      <li><strong>Publications:</strong> Research papers, citations, impact factors</li>
                      <li><strong>Skills:</strong> Technical skills, languages, certifications</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Auto-Save Feature</h4>
                    <p className="text-sm text-muted-foreground">
                      Your work is automatically saved every 30 seconds. You can also manually save
                      at any time using the save button.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    AI Features
                  </CardTitle>
                  <CardDescription>
                    Leverage artificial intelligence to enhance your CV
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">AI Suggestions</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Get intelligent suggestions for improving your content:
                    </p>
                    <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                      <li>Click the AI suggest button next to any text field</li>
                      <li>Receive tailored suggestions based on your field</li>
                      <li>Accept, modify, or reject suggestions as needed</li>
                      <li>Use suggestions to enhance job descriptions and achievements</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">PDF Parsing</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Upload existing CVs or documents to extract information:
                    </p>
                    <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                      <li>Go to "Upload CV" in the dashboard</li>
                      <li>Select a PDF file from your computer</li>
                      <li>AI will automatically extract and organize your information</li>
                      <li>Review and edit the extracted data before saving</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Text Improvement</h4>
                    <p className="text-sm text-muted-foreground">
                      Use AI to improve your writing:
                    </p>
                    <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1 mt-2">
                      <li>Select text and click "Improve Text"</li>
                      <li>AI will suggest more professional phrasing</li>
                      <li>Check grammar and improve clarity</li>
                      <li>Maintain your authentic voice while enhancing impact</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="h-5 w-5" />
                    Exporting Your CV
                  </CardTitle>
                  <CardDescription>
                    Download your CV in multiple formats
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Available Formats</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Export your CV in the format that best suits your needs:
                    </p>
                    <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                      <li><strong>PDF:</strong> Perfect for ATS systems and professional sharing</li>
                      <li><strong>DOCX:</strong> Microsoft Word format for easy editing</li>
                      <li><strong>HTML:</strong> Web-ready format for personal websites</li>
                      <li><strong>LaTeX:</strong> Academic standard for research positions</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Export Process</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      To export your CV:
                    </p>
                    <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                      <li>Open your CV in the editor</li>
                      <li>Click the "Export" button in the top menu</li>
                      <li>Select your desired format</li>
                      <li>Choose any additional options (themes, layouts)</li>
                      <li>Download the file to your computer</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Share2 className="h-5 w-5" />
                    Sharing Your CV
                  </CardTitle>
                  <CardDescription>
                    Share your CV online and track engagement
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Public Sharing</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Make your CV publicly accessible:
                    </p>
                    <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                      <li>Click "Share" in your CV editor</li>
                      <li>Generate a unique public link</li>
                      <li>Customize sharing permissions</li>
                      <li>Share the link via email, social media, or direct links</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">QR Codes</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Generate QR codes for easy mobile access:
                    </p>
                    <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                      <li>Enable QR code generation in sharing settings</li>
                      <li>Download or print the QR code</li>
                      <li>Anyone can scan it to view your CV</li>
                      <li>Perfect for business cards and presentations</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Analytics</h4>
                    <p className="text-sm text-muted-foreground">
                      Track how your CV is performing:
                    </p>
                    <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1 mt-2">
                      <li>View page views and unique visitors</li>
                      <li>Track download statistics</li>
                      <li>Monitor engagement over time</li>
                      <li>Get insights on your CV's effectiveness</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HelpCircle className="h-5 w-5" />
                    Need Help?
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Contact Support</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Having trouble? We're here to help.
                    </p>
                    <Link href="/support">
                      <Button variant="outline" size="sm" className="w-full">
                        Get Support
                      </Button>
                    </Link>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Video Tutorials</h4>
                    <p className="text-sm text-muted-foreground">
                      Watch step-by-step video guides for common tasks.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Community Forum</h4>
                    <p className="text-sm text-muted-foreground">
                      Connect with other users and share tips.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Account Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Profile Management</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Update personal information</li>
                      <li>• Change password</li>
                      <li>• Manage email preferences</li>
                      <li>• Delete account</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Privacy Settings</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Control data sharing</li>
                      <li>• Manage public profiles</li>
                      <li>• Download your data</li>
                      <li>• Privacy policy</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tips & Tricks</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm">
                    <strong>💡 Pro Tip:</strong> Use the AI suggestions feature to make your achievements more impactful.
                  </div>
                  <div className="text-sm">
                    <strong>🎯 Best Practice:</strong> Keep your CV updated regularly to reflect your latest accomplishments.
                  </div>
                  <div className="text-sm">
                    <strong>📊 Analytics:</strong> Check your CV's performance metrics to see what's working.
                  </div>
                  <div className="text-sm">
                    <strong>🔒 Security:</strong> Always use strong passwords and enable two-factor authentication.
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-16 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Create Your Professional CV?</h2>
          <p className="text-lg mb-8 opacity-90">
            Join thousands of academics and researchers who trust CV Builder Pro
          </p>
          <Link href="/auth/register">
            <Button size="lg" variant="secondary" className="text-lg">
              Start Building Your CV Today
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}