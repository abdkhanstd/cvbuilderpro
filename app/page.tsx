import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, FileText, Users, Zap, Shield, Cloud, BarChart } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">CV Builder Pro</span>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="#features" className="text-sm hover:text-primary">Features</Link>
            <Link href="#about" className="text-sm hover:text-primary">About</Link>
          </nav>
          <div className="flex items-center space-x-4">
            <Link href="/auth/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/auth/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-6">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              Build Your Academic CV
              <span className="block text-primary mt-2">With Confidence</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              The most comprehensive CV builder designed specifically for academics and researchers. 
              Manage publications, track citations, and create professional CVs in minutes.
            </p>
            <div className="flex items-center justify-center space-x-4 pt-4">
              <Link href="/auth/register">
                <Button size="lg" className="text-lg">
                  Start Building Free <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="#features">
                <Button size="lg" variant="outline" className="text-lg">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-secondary/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-xl text-muted-foreground">
              Everything you need to create and manage professional academic CVs
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<FileText className="h-8 w-8" />}
              title="Multiple CV Templates"
              description="Choose from professional, academic, creative, and modern templates designed for different purposes."
            />
            <FeatureCard
              icon={<Users className="h-8 w-8" />}
              title="Multi-User Platform"
              description="Collaborate with colleagues, share CVs, and get feedback from your network."
            />
            <FeatureCard
              icon={<Zap className="h-8 w-8" />}
              title="Smart Auto-Save"
              description="Never lose your work with automatic saving every 30 seconds and version history."
            />
            <FeatureCard
              icon={<Shield className="h-8 w-8" />}
              title="Secure & Private"
              description="Your data is encrypted and protected with enterprise-grade security measures."
            />
            <FeatureCard
              icon={<Cloud className="h-8 w-8" />}
              title="Cloud Sync"
              description="Access your CVs from any device with seamless cloud synchronization."
            />
            <FeatureCard
              icon={<BarChart className="h-8 w-8" />}
              title="Analytics Dashboard"
              description="Track views, downloads, and get insights about your CV performance."
            />
          </div>
        </div>
      </section>

      {/* Academic Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Built for Academics</h2>
            <p className="text-xl text-muted-foreground">
              Advanced features specifically designed for researchers and educators
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-4">
              <h3 className="text-2xl font-bold">📚 Publications Management</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>✓ Track journal and conference publications</li>
                <li>✓ Multiple citation formats (APA, IEEE, Harvard, MLA, etc.)</li>
                <li>✓ Impact factor and citation tracking</li>
                <li>✓ Google Scholar integration</li>
                <li>✓ JCR and CAS zone indicators</li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-2xl font-bold">🎓 Academic Profiles</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>✓ h-index and citation metrics</li>
                <li>✓ ORCID and ResearchGate integration</li>
                <li>✓ Conference presentations tracking</li>
                <li>✓ Patent and IP management</li>
                <li>✓ Research project portfolios</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Export Options Section */}
      <section className="py-20 px-4 bg-secondary/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Export Anywhere</h2>
            <p className="text-xl text-muted-foreground">
              Multiple export formats for any purpose
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-6">
            <ExportCard format="PDF" description="ATS-optimized PDFs" />
            <ExportCard format="DOCX" description="Microsoft Word" />
            <ExportCard format="HTML" description="Personal Website" />
            <ExportCard format="LaTeX" description="Academic Standard" />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Build Your CV?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of academics and researchers using CV Builder Pro
          </p>
          <Link href="/auth/register">
            <Button size="lg" className="text-lg">
              Create Your Free Account <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <FileText className="h-5 w-5 text-primary" />
                <span className="font-bold">CV Builder Pro</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Professional CV builder for academics and researchers.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#features">Features</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/about">About</Link></li>
                <li><Link href="/contact">Contact</Link></li>
                <li><Link href="/privacy">Privacy</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/docs">Documentation</Link></li>
                <li><Link href="/support">Support</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 CV Builder Pro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-card p-6 rounded-lg border hover:border-primary transition-colors">
      <div className="text-primary mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}

function ExportCard({ format, description }: { format: string; description: string }) {
  return (
    <div className="bg-card p-6 rounded-lg border text-center hover:border-primary transition-colors">
      <div className="text-3xl font-bold text-primary mb-2">{format}</div>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
