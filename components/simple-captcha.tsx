"use client";

import { useState, useEffect, forwardRef, useImperativeHandle, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RefreshCw, CheckCircle } from "lucide-react";

// Generate random 5-digit number
function generateCode(): string {
  return Math.floor(10000 + Math.random() * 90000).toString();
}

// Generate token for server verification
function generateToken(code: string, timestamp: number): string {
  const data = JSON.stringify({
    t: timestamp,
    c: code,
    v: Date.now(),
  });
  return btoa(data);
}

export interface SimpleCaptchaRef {
  reset: () => void;
}

interface SimpleCaptchaProps {
  onChange: (token: string | null) => void;
}

const SimpleCaptcha = forwardRef<SimpleCaptchaRef, SimpleCaptchaProps>(
  ({ onChange }, ref) => {
    const [code, setCode] = useState(() => generateCode());
    const [timestamp, setTimestamp] = useState(() => Date.now());
    const [userInput, setUserInput] = useState("");
    const [isValid, setIsValid] = useState<boolean | null>(null);
    const onChangeRef = useRef(onChange);
    
    // Keep ref updated
    useEffect(() => {
      onChangeRef.current = onChange;
    }, [onChange]);

    const handleRefresh = () => {
      const newCode = generateCode();
      const newTimestamp = Date.now();
      setCode(newCode);
      setTimestamp(newTimestamp);
      setUserInput("");
      setIsValid(null);
      onChangeRef.current(null);
    };

    // Check answer when user types
    const handleInputChange = (value: string) => {
      const cleanValue = value.replace(/\D/g, "");
      setUserInput(cleanValue);
      
      if (cleanValue.length === 5) {
        if (cleanValue === code) {
          setIsValid(true);
          onChangeRef.current(generateToken(code, timestamp));
        } else {
          setIsValid(false);
          onChangeRef.current(null);
        }
      } else {
        setIsValid(null);
        onChangeRef.current(null);
      }
    };

    useImperativeHandle(ref, () => ({
      reset: handleRefresh,
    }));

    // Render distorted digits on canvas-like display
    const renderDistortedCode = () => {
      const digits = code.split("");
      const colors = [
        "text-blue-600", "text-indigo-600", "text-purple-600", 
        "text-blue-700", "text-indigo-700"
      ];
      
      return (
        <div className="flex justify-center items-center gap-1 select-none" style={{ userSelect: "none" }}>
          {digits.map((digit, i) => {
            const rotation = (Math.random() - 0.5) * 30;
            const translateY = (Math.random() - 0.5) * 8;
            const scale = 0.9 + Math.random() * 0.3;
            
            return (
              <span
                key={`${code}-${i}`}
                className={`text-3xl font-bold ${colors[i % colors.length]}`}
                style={{
                  display: "inline-block",
                  transform: `rotate(${rotation}deg) translateY(${translateY}px) scale(${scale})`,
                  fontFamily: "Georgia, serif",
                  textShadow: "1px 1px 2px rgba(0,0,0,0.1)",
                  opacity: 0.85 + Math.random() * 0.15,
                }}
              >
                {digit}
              </span>
            );
          })}
          {/* Add noise lines */}
          <svg 
            className="absolute inset-0 w-full h-full pointer-events-none" 
            style={{ opacity: 0.3 }}
          >
            <line 
              x1="10%" y1={30 + Math.random() * 20} 
              x2="90%" y2={25 + Math.random() * 25} 
              stroke="currentColor" 
              strokeWidth="1"
              className="text-gray-400"
            />
            <line 
              x1="15%" y1={35 + Math.random() * 15} 
              x2="85%" y2={30 + Math.random() * 20} 
              stroke="currentColor" 
              strokeWidth="1"
              className="text-gray-400"
            />
          </svg>
        </div>
      );
    };

    return (
      <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            Security Check
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            className="h-8 w-8 p-0"
            title="Get new code"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        {/* Display the distorted code */}
        <div 
          className="relative py-4 px-4 rounded-md text-center overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 50%, #ddd6fe 100%)",
          }}
          onCopy={(e) => e.preventDefault()}
          onCut={(e) => e.preventDefault()}
        >
          {renderDistortedCode()}
        </div>

        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">
            Type the numbers shown above:
          </label>
          <div className="flex gap-2 items-center">
            <Input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={5}
              value={userInput}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="Enter 5 digits"
              className={`font-mono text-lg tracking-widest ${
                isValid === true
                  ? "border-green-500 focus-visible:ring-green-500"
                  : isValid === false
                  ? "border-red-500 focus-visible:ring-red-500"
                  : ""
              }`}
              autoComplete="off"
            />
            {isValid === true && (
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
            )}
          </div>
        </div>

        {isValid === false && (
          <p className="text-sm text-red-500">
            Numbers don&apos;t match. Please try again.
          </p>
        )}
        {isValid === true && (
          <p className="text-sm text-green-600">
            ✓ Verified
          </p>
        )}
      </div>
    );
  }
);

SimpleCaptcha.displayName = "SimpleCaptcha";

export default SimpleCaptcha;
