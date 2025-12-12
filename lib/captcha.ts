// Server-side CAPTCHA verification utility

// Verify Google reCAPTCHA (if configured)
export async function verifyGoogleCaptcha(token: string): Promise<boolean> {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  
  if (!secretKey) {
    return false;
  }

  try {
    const response = await fetch(
      "https://www.google.com/recaptcha/api/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          secret: secretKey,
          response: token,
        }),
      }
    );

    const data = await response.json();
    return data.success === true;
  } catch (error) {
    console.error("Google CAPTCHA verification error:", error);
    return false;
  }
}

// Verify simple captcha token
export function verifySimpleCaptcha(token: string): boolean {
  try {
    const decoded = JSON.parse(atob(token));
    const { t: timestamp, v: verifiedAt } = decoded;
    
    // Check if token is not too old (5 minutes max)
    const now = Date.now();
    const tokenAge = now - timestamp;
    const verifiedAge = now - verifiedAt;
    
    // Token should be created within 5 minutes and verified within 2 minutes
    if (tokenAge > 5 * 60 * 1000) {
      console.log("Simple CAPTCHA: Token too old");
      return false;
    }
    
    if (verifiedAge > 2 * 60 * 1000) {
      console.log("Simple CAPTCHA: Verification too old");
      return false;
    }
    
    // Basic validation passed
    return true;
  } catch (error) {
    console.error("Simple CAPTCHA verification error:", error);
    return false;
  }
}

// Main verification function - tries simple captcha first, then Google
export async function verifyCaptcha(token: string): Promise<boolean> {
  // Try simple captcha first (base64 encoded JSON)
  if (token.match(/^[A-Za-z0-9+/=]+$/)) {
    try {
      const decoded = atob(token);
      if (decoded.startsWith("{")) {
        return verifySimpleCaptcha(token);
      }
    } catch {
      // Not a simple captcha token, try Google
    }
  }
  
  // Try Google reCAPTCHA
  return verifyGoogleCaptcha(token);
}

// Check if any CAPTCHA is required
export function isCaptchaRequired(): boolean {
  // Simple captcha is always available, no config needed
  return true;
}
