"use client";

import { SignUp } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function RegisterContent() {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect_url") || "/admin";

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <SignUp routing="hash" signInUrl="/login" fallbackRedirectUrl={redirectUrl} forceRedirectUrl={redirectUrl} />
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-[80vh] flex items-center justify-center text-xs text-muted-foreground">Loading sign up...</div>}>
      <RegisterContent />
    </Suspense>
  );
}
