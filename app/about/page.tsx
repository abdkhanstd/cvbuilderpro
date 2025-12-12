"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Building, Users, Target, Award, Globe, Sparkles, Heart } from "lucide-react";

export default function AboutPage() {
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
              <Building className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl">About</span>
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
            About CV Builder Pro
            <span className="block text-primary mt-2">Powered by AI Innovation</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            A cutting-edge CV building platform designed specifically for academics and researchers,
            developed by rykhrt AI, a subdivision of Tallinn, Estonia.
          </p>
        </div>
      </section>

      {/* Company Info */}
      <section className="py-16 px-4 bg-secondary/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Company</h2>
            <p className="text-lg text-muted-foreground">
              Leading the future of academic career management
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  rykhrt AI
                </CardTitle>
                <CardDescription>
                  AI-Powered Solutions for Academic Excellence
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  rykhrt AI is a pioneering AI technology company specializing in intelligent solutions
                  for academic and research communities. We combine cutting-edge artificial intelligence
                  with deep understanding of academic workflows to create tools that empower researchers
                  and educators worldwide.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Globe className="h-4 w-4 text-primary" />
                    <span><strong>Location:</strong> Tallinn, Estonia</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Target className="h-4 w-4 text-primary" />
                    <span><strong>Focus:</strong> AI for Academic Excellence</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5 text-primary" />
                  USMANHEART OÜ
                </CardTitle>
                <CardDescription>
                  Estonian Innovation Hub
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  USMANHEART OÜ is our parent organization based in Tallinn, Estonia. As a registered
                  Estonian company, we operate at the forefront of European innovation, combining
                  Nordic design principles with advanced AI technology to deliver world-class solutions.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Award className="h-4 w-4 text-primary" />
                    <span><strong>Founded:</strong> Tallinn, Estonia</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Heart className="h-4 w-4 text-primary" />
                    <span><strong>Mission:</strong> Empowering Academic Success</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Mission & Values */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
            <p className="text-lg text-muted-foreground">
              Democratizing academic career management through AI
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader className="text-center">
                <Target className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Empower Academics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground">
                  We believe every researcher deserves access to professional tools that enhance
                  their career development and amplify their research impact.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <Sparkles className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Innovate with AI</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground">
                  Leveraging the latest AI advancements to create intelligent solutions that
                  understand academic contexts and streamline complex workflows.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <Globe className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Global Impact</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground">
                  Supporting researchers worldwide with tools that transcend geographical boundaries
                  and foster international collaboration.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Product Story */}
      <section className="py-16 px-4 bg-secondary/30">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">The CV Builder Pro Story</h2>
            <p className="text-lg text-muted-foreground">
              Born from the challenges faced by modern academics
            </p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">The Challenge</h3>
                    <p className="text-muted-foreground">
                      Traditional CV builders weren't designed for academics. Researchers struggled with
                      publication tracking, citation management, and creating CVs that properly represented
                      their scholarly achievements.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">The Innovation</h3>
                    <p className="text-muted-foreground">
                      rykhrt AI developed CV Builder Pro using advanced AI to understand academic contexts,
                      automate publication imports, and provide intelligent suggestions for CV content.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">The Impact</h3>
                    <p className="text-muted-foreground">
                      Thousands of academics now create professional CVs faster, track their research impact
                      more effectively, and present their scholarly achievements with confidence.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Team & Contact */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-4">Get in Touch</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Have questions about CV Builder Pro or interested in our AI solutions?
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link href="/support">
              <Button size="lg">
                Contact Support
              </Button>
            </Link>
            <Link href="/docs">
              <Button size="lg" variant="outline">
                View Documentation
              </Button>
            </Link>
          </div>

          <div className="border-t pt-8">
            <div className="text-sm text-muted-foreground space-y-2">
              <p><strong>rykhrt AI</strong> - A subdivision of Tallinn, Estonia</p>
              <p>© 2025 USMANHEART OÜ. All rights reserved.</p>
              <p className="text-xs">
                CV Builder Pro is a product of rykhrt AI, committed to advancing academic excellence
                through innovative AI-powered solutions.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}