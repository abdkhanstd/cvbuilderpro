"use client";

import { forwardRef } from "react";
import ReCAPTCHA from "react-google-recaptcha";

interface CaptchaProps {
  onChange: (token: string | null) => void;
  onExpired?: () => void;
  onError?: () => void;
}

const Captcha = forwardRef<ReCAPTCHA, CaptchaProps>(
  ({ onChange, onExpired, onError }, ref) => {
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

    // If no site key is configured, don't render CAPTCHA
    if (!siteKey) {
      // In development, we can skip CAPTCHA
      if (process.env.NODE_ENV === "development") {
        console.warn("CAPTCHA: No site key configured, skipping in development mode");
      }
      return null;
    }

    return (
      <div className="flex justify-center">
        <ReCAPTCHA
          ref={ref}
          sitekey={siteKey}
          onChange={onChange}
          onExpired={onExpired}
          onErrored={onError}
          theme="light"
        />
      </div>
    );
  }
);

Captcha.displayName = "Captcha";

export default Captcha;

// Hook to check if CAPTCHA is enabled
export function useCaptchaEnabled() {
  return !!process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
}
