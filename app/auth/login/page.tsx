"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { FileText, Loader2, CheckCircle, Mail } from "lucide-react";
import SimpleCaptcha, { SimpleCaptchaRef } from "@/components/simple-captcha";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState("");
  const [resending, setResending] = useState(false);
  const [captchaValid, setCaptchaValid] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const captchaRef = useRef<SimpleCaptchaRef>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // Show success toast if redirected after verification
  useEffect(() => {
    if (searchParams.get("verified") === "true") {
      toast({
        title: "Email Verified!",
        description: "Your email has been verified. You can now log in.",
      });
    }
  }, [searchParams, toast]);

  const handleResendVerification = async () => {
    setResending(true);
    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: unverifiedEmail }),
      });

      if (response.ok) {
        toast({
          title: "Verification Email Sent",
          description: "Please check your inbox for the verification link.",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to send verification email. Please try again.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send verification email. Please try again.",
      });
    } finally {
      setResending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check CAPTCHA
    if (!captchaValid || !captchaToken) {
      toast({
        title: "Error",
        description: "Please complete the CAPTCHA verification",
      });
      return;
    }

    setIsLoading(true);
    setShowVerificationMessage(false);

    try {
      // Verify CAPTCHA on server
      const captchaResponse = await fetch("/api/auth/verify-captcha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: captchaToken }),
      });
      
      if (!captchaResponse.ok) {
        toast({
          title: "Error",
          description: "CAPTCHA verification failed. Please try again.",
        });
        captchaRef.current?.reset();
        setCaptchaValid(false);
        setCaptchaToken(null);
        setIsLoading(false);
        return;
      }

      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        // Reset CAPTCHA on error
        captchaRef.current?.reset();
        setCaptchaValid(false);
        setCaptchaToken(null);
        
        if (result.error === "EMAIL_NOT_VERIFIED") {
          setUnverifiedEmail(formData.email);
          setShowVerificationMessage(true);
        } else {
          toast({
            title: "Error",
            description: "Invalid email or password",
          });
        }
      } else {
        toast({
          title: "Success",
          description: "Logged in successfully",
        });
        router.push("/dashboard");
        router.refresh();
      }
    } catch (error) {
      captchaRef.current?.reset();
      setCaptchaValid(false);
      setCaptchaToken(null);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-center mb-4">
          <FileText className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="text-2xl text-center">Welcome Back</CardTitle>
        <CardDescription className="text-center">
          Sign in to your CV Builder Pro account
        </CardDescription>
      </CardHeader>
      <CardContent>
        {showVerificationMessage ? (
          <div className="space-y-4">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-800">Email Not Verified</p>
                  <p className="text-sm text-yellow-700 mt-1">
                    Please verify your email address before logging in. Check your inbox for the verification link.
                  </p>
                </div>
              </div>
            </div>
            <Button 
              onClick={handleResendVerification} 
              variant="outline" 
              className="w-full"
              disabled={resending}
            >
              {resending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Mail className="h-4 w-4 mr-2" />
              )}
              Resend Verification Email
            </Button>
            <Button 
              onClick={() => setShowVerificationMessage(false)} 
              variant="ghost" 
              className="w-full"
            >
              Try Different Account
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                disabled={isLoading}
              />
            </div>
            <SimpleCaptcha 
              ref={captchaRef}
              onChange={(token) => {
                setCaptchaToken(token);
                setCaptchaValid(!!token);
              }}
            />
            <Button type="submit" className="w-full" disabled={isLoading || !captchaValid}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign In
            </Button>
          </form>
        )}
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <div className="text-sm text-center text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/auth/register" className="text-primary hover:underline">
            Sign up
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/30 p-4">
      <Suspense fallback={
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto" />
          </CardHeader>
        </Card>
      }>
        <LoginForm />
      </Suspense>
    </div>
  );
}
