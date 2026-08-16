"use client";

import { SignIn } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginContent() {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect_url") || "/admin";

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <SignIn routing="hash" signUpUrl="/register" fallbackRedirectUrl={redirectUrl} forceRedirectUrl={redirectUrl} />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[80vh] flex items-center justify-center text-xs text-muted-foreground">Loading login...</div>}>
      <LoginContent />
    </Suspense>
  );
}
