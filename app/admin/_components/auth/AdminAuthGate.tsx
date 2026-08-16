"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Shield,
  ShieldAlert,
  Clock,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  LogOut,
  XCircle,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useUser, useClerk } from "@clerk/nextjs";

interface AccessState {
  authenticated: boolean;
  isAdmin: boolean;
  role: string;
  hasPendingRequest: boolean;
  isRejected?: boolean;
  latestRequestStatus: string | null;
  latestRequestDate?: string | null;
  user: {
    id: string;
    email: string;
    fullName: string;
  } | null;
}

export default function AdminAuthGate({ children }: { children: React.ReactNode }) {
  const { isLoaded: clerkLoaded, isSignedIn, user: clerkUser } = useUser();
  const { signOut } = useClerk();

  const [dbAccess, setDbAccess] = useState<AccessState | null>(null);
  const [isDbLoading, setIsDbLoading] = useState(true);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReRequesting, setIsReRequesting] = useState(false);
  const [reason, setReason] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const userEmail = clerkUser?.primaryEmailAddress?.emailAddress || "";
  const isSuperAdminEmail =
    userEmail.toLowerCase() === "hassamnaveed44@gmail.com" ||
    clerkUser?.publicMetadata?.role === "ADMIN";

  const checkDbAccess = async (isManualCheck = false) => {
    if (isManualCheck) setIsCheckingStatus(true);
    try {
      const res = await fetch("/api/admin/check-access");
      const data = await res.json();
      setDbAccess(data);
      if (isManualCheck && data?.isAdmin) {
        setToastMessage("Admin privileges granted! Loading dashboard...");
      }
    } catch (err) {
      console.error("Access verification error:", err);
      setDbAccess(null);
    } finally {
      setIsDbLoading(false);
      setIsCheckingStatus(false);
    }
  };

  useEffect(() => {
    if (clerkLoaded) {
      if (isSignedIn) {
        checkDbAccess();
      } else {
        setIsDbLoading(false);
      }
    }
  }, [clerkLoaded, isSignedIn]);

  const handleRequestAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/admin/access-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason,
          email: userEmail,
          fullName: clerkUser?.fullName || clerkUser?.firstName || "",
        }),
      });

      const data = await res.json();
      if (data.success) {
        setToastMessage("Access request submitted to admin!");
        setIsReRequesting(false);
        setDbAccess((prev) => ({
          authenticated: true,
          isAdmin: false,
          role: "CUSTOMER",
          hasPendingRequest: true,
          isRejected: false,
          latestRequestStatus: "PENDING",
          user: prev?.user || {
            id: "",
            email: userEmail,
            fullName: clerkUser?.fullName || "Staff",
          },
        }));
        checkDbAccess();
      } else {
        alert(data.error || "Failed to submit request");
      }
    } catch (err) {
      console.error("Submit request error:", err);
      alert("Error submitting access request");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 1. Initial Loading State (while Clerk loads session)
  if (!clerkLoaded || (isSignedIn && isDbLoading && !isSuperAdminEmail)) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background text-foreground p-4">
        <div className="w-12 h-12 rounded-2xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center mb-4 animate-pulse">
          <Shield size={24} />
        </div>
        <p className="text-sm font-semibold text-foreground">Verifying admin session...</p>
        <p className="text-xs text-muted-foreground mt-1">Connecting to authentication services</p>
      </div>
    );
  }

  // 2. Unauthenticated User (Not Logged In with Clerk)
  if (!isSignedIn) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-muted/20 p-4 font-satoshi">
        <Card className="w-full max-w-md bg-card border-border shadow-xl rounded-2xl p-6 sm:p-8 text-center space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-black text-white dark:bg-white dark:text-black mx-auto flex items-center justify-center shadow-md">
            <Shield size={28} />
          </div>

          <div>
            <h1 className="text-xl font-bold font-sans text-foreground">SHOP.CO Admin Portal</h1>
            <p className="text-xs text-muted-foreground mt-1">
              Please sign in to access the merchant management dashboard or request staff access.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <Link href="/login?redirect_url=/admin">
              <Button className="w-full rounded-xl bg-black text-white dark:bg-white dark:text-black font-semibold h-11 cursor-pointer">
                <span>Sign In to Admin Portal</span>
                <ArrowRight size={15} className="ml-1.5" />
              </Button>
            </Link>

            <Link href="/register">
              <Button variant="outline" className="w-full rounded-xl border-border bg-card text-foreground font-semibold h-10 cursor-pointer">
                <span>Create New Account</span>
              </Button>
            </Link>
          </div>

          <div className="border-t border-border pt-4 text-left">
            <Link href="/" className="text-xs text-muted-foreground hover:text-foreground underline flex items-center justify-center gap-1">
              <span>← Return to Storefront</span>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  // 3. User is Logged In: Check if Admin
  const isAuthorizedAdmin = isSuperAdminEmail || dbAccess?.isAdmin || dbAccess?.role === "ADMIN";

  // If NOT authorized admin -> Show Staff Access Request Portal with explicit Pending / Rejected / New states
  if (!isAuthorizedAdmin) {
    const isPending = dbAccess?.hasPendingRequest || dbAccess?.latestRequestStatus === "PENDING";
    const isRejected = !isPending && (dbAccess?.isRejected || dbAccess?.latestRequestStatus === "REJECTED");

    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-muted/20 p-4 font-satoshi">
        <Card className="w-full max-w-lg bg-card border-border shadow-xl rounded-2xl p-6 sm:p-8 space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3.5">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                isRejected
                  ? "bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900"
                  : isPending
                  ? "bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900"
                  : "bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900"
              }`}
            >
              {isRejected ? (
                <XCircle size={24} />
              ) : isPending ? (
                <Clock size={24} className="animate-spin" />
              ) : (
                <ShieldAlert size={24} />
              )}
            </div>
            <div>
              <h1 className="text-lg font-bold font-sans text-foreground">
                {isRejected
                  ? "Access Request Rejected"
                  : isPending
                  ? "Staff Authorization Pending"
                  : "Staff Authorization Required"}
              </h1>
              <p className="text-xs text-muted-foreground">
                Signed in as <strong className="text-foreground">{userEmail}</strong>
              </p>
            </div>
          </div>

          {/* 1. REJECTED State */}
          {isRejected && !isReRequesting ? (
            <div className="p-5 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900 space-y-3">
              <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300 font-bold text-xs">
                <XCircle size={16} className="text-rose-600" />
                <span>Your Request Was Rejected by the Admin</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Your previous staff access request was reviewed and rejected by the store administrator. If you believe this was an error or your role has changed, you can submit a new access request.
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-2.5">
                <Button
                  size="sm"
                  onClick={() => setIsReRequesting(true)}
                  className="rounded-xl text-xs font-semibold bg-black text-white dark:bg-white dark:text-black cursor-pointer shadow-2xs"
                >
                  <FileText size={13} className="mr-1.5" />
                  <span>Submit a New Request</span>
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => checkDbAccess(true)}
                  disabled={isCheckingStatus}
                  className="rounded-xl text-xs font-semibold border-border bg-card cursor-pointer"
                >
                  <RefreshCw size={13} className={`mr-1.5 ${isCheckingStatus ? "animate-spin" : ""}`} />
                  <span>Check Status</span>
                </Button>
              </div>
            </div>
          ) : isPending ? (
            /* 2. PENDING State */
            <div className="p-5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900 space-y-3">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-xs">
                <Clock size={16} className="animate-spin text-amber-600" />
                <span>Access Request Pending Admin Approval</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Your request has been submitted to the Admin. As soon as the Admin approves your account, you will instantly gain access to the dashboard.
              </p>
              <div className="pt-2 flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => checkDbAccess(true)}
                  disabled={isCheckingStatus}
                  className="rounded-xl text-xs font-semibold bg-black text-white dark:bg-white dark:text-black cursor-pointer shadow-2xs"
                >
                  <RefreshCw size={13} className={`mr-1.5 ${isCheckingStatus ? "animate-spin" : ""}`} />
                  <span>Check Approval Status</span>
                </Button>
              </div>
            </div>
          ) : (
            /* 3. NEW REQUEST / RE-REQUEST Form */
            <form onSubmit={handleRequestAccess} className="space-y-4">
              <div className="p-4 rounded-xl bg-muted/40 border border-border text-xs space-y-1">
                <p className="font-semibold text-foreground">
                  {isReRequesting ? "Submit New Access Request" : "Request Store Staff / Admin Privileges"}
                </p>
                <p className="text-muted-foreground">
                  The primary store admin can approve your account with 1 click directly inside the admin panel.
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Reason / Role Note (Optional):
                </label>
                <textarea
                  rows={2}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g., Store manager, fulfillment operator, customer support..."
                  className="w-full p-3 rounded-xl border border-border bg-card text-xs text-foreground focus:outline-none focus:border-ring resize-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 rounded-xl bg-black text-white dark:bg-white dark:text-black font-semibold h-10 text-xs cursor-pointer shadow-2xs"
                >
                  {isSubmitting ? "Submitting Request..." : "Request Admin Access from Store Owner"}
                </Button>

                {isReRequesting && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsReRequesting(false)}
                    className="rounded-xl h-10 text-xs font-semibold border-border bg-card cursor-pointer"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          )}

          {/* Footer Actions */}
          <div className="border-t border-border pt-4 flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={() => signOut({ redirectUrl: "/" })}
              className="text-muted-foreground hover:text-foreground flex items-center gap-1 cursor-pointer"
            >
              <LogOut size={13} />
              <span>Sign Out</span>
            </button>

            <Link href="/" className="text-muted-foreground hover:text-foreground underline">
              Return to Store
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  // 4. Authorized Admin User -> Render Dashboard directly!
  return <>{children}</>;
}
