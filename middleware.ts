import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Define protected route patterns
const isCustomerProtectedRoute = createRouteMatcher([
  "/account(.*)",
  "/checkout(.*)",
]);

const isAdminRoute = createRouteMatcher([
  "/admin(.*)",
  "/api/admin(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth();

  // 1. Admin route protection: must be authenticated and have ADMIN role
  if (isAdminRoute(req)) {
    const isApiRoute = req.nextUrl.pathname.startsWith("/api/admin");

    if (!userId) {
      if (isApiRoute) {
        return NextResponse.json(
          { error: "Unauthorized: Please log in to access admin endpoints." },
          { status: 401 }
        );
      }
      const signInUrl = new URL("/login", req.url);
      signInUrl.searchParams.set("redirect_url", req.url);
      return NextResponse.redirect(signInUrl);
    }

    const role =
      (sessionClaims?.metadata as { role?: string })?.role ||
      (sessionClaims?.publicMetadata as { role?: string })?.role;

    if (role !== "ADMIN") {
      if (isApiRoute) {
        return NextResponse.json(
          { error: "Forbidden: Admin privileges required." },
          { status: 403 }
        );
      }
      // If not an admin, redirect to storefront home
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // 2. Customer protected routes (Account, Checkout)
  if (isCustomerProtectedRoute(req) && !userId) {
    const signInUrl = new URL("/login", req.url);
    signInUrl.searchParams.set("redirect_url", req.url);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
