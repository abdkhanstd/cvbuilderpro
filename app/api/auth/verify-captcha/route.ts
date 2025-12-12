import { NextRequest, NextResponse } from "next/server";
import { verifyCaptcha, isCaptchaRequired } from "@/lib/captcha";

export async function POST(req: NextRequest) {
  try {
    // If CAPTCHA is not configured, allow the request
    if (!isCaptchaRequired()) {
      return NextResponse.json({ success: true });
    }

    const body = await req.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { error: "CAPTCHA token is required" },
        { status: 400 }
      );
    }

    const isValid = await verifyCaptcha(token);

    if (!isValid) {
      return NextResponse.json(
        { error: "CAPTCHA verification failed" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("CAPTCHA verification error:", error);
    return NextResponse.json(
      { error: "CAPTCHA verification failed" },
      { status: 500 }
    );
  }
}
