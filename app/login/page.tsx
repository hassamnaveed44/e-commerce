"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, User, X, CheckCircle2 } from "lucide-react";

function AuthForm() {
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get("tab") === "register" ? false : true;
  
  const [isLogin, setIsLogin] = useState(defaultTab);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const router = useRouter();

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLogin) {
      // 1. User created account -> Show success alert & switch to Sign In tab
      setSignupSuccess(true);
      setIsLogin(true);
      // Keep email pre-filled for convenience, clear password
      setFormData((prev) => ({ ...prev, password: "" }));
    } else {
      // 2. User signed in -> Redirect to checkout or home
      router.push("/checkout");
    }
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setResetSent(true);
    setTimeout(() => {
      setResetSent(false);
      setShowForgotModal(false);
      setForgotEmail("");
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-[#F2F0F1] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-[24px] p-6 sm:p-10 border border-black/10 shadow-sm font-satoshi">
        
        {/* Header / Logo */}
        <div className="text-center mb-6">
          <Link href="/" className="text-3xl font-extrabold tracking-tighter uppercase font-sans text-black">
            SHOP.CO
          </Link>
          <p className="text-black/60 text-sm mt-2">
            {isLogin ? "Welcome back! Please enter your details." : "Create your account to start shopping."}
          </p>
        </div>

        {/* Success Banner After Signup */}
        {signupSuccess && (
          <div className="mb-6 p-4 rounded-[16px] bg-emerald-50 border border-emerald-200 flex items-start gap-3 text-emerald-800 text-sm animate-in fade-in">
            <CheckCircle2 size={20} className="shrink-0 text-emerald-600 mt-0.5" />
            <div>
              <p className="font-bold">Account Created Successfully!</p>
              <p className="text-xs text-emerald-700 mt-0.5">Please sign in with your credentials below.</p>
            </div>
          </div>
        )}

        {/* Tab Switcher */}
        <div className="flex bg-[#F0F0F0] rounded-full p-1 mb-8">
          <button
            type="button"
            onClick={() => {
              setIsLogin(true);
              setSignupSuccess(false);
            }}
            className={`flex-1 py-2.5 text-sm font-medium rounded-full transition-all cursor-pointer ${
              isLogin ? "bg-black text-white shadow-xs" : "text-black/60 hover:text-black"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsLogin(false);
              setSignupSuccess(false);
            }}
            className={`flex-1 py-2.5 text-sm font-medium rounded-full transition-all cursor-pointer ${
              !isLogin ? "bg-black text-white shadow-xs" : "text-black/60 hover:text-black"
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-black mb-1.5">Full Name</label>
              <div className="relative">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-black/40" />
                <input
                  type="text"
                  required
                  placeholder="Alex Morgan"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#F0F0F0] rounded-full pl-11 pr-4 py-3 text-sm text-black placeholder:text-black/40 outline-none border border-transparent focus:border-black/20"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-black mb-1.5">Email Address</label>
            <div className="relative">
              <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-black/40" />
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-[#F0F0F0] rounded-full pl-11 pr-4 py-3 text-sm text-black placeholder:text-black/40 outline-none border border-transparent focus:border-black/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-1.5">Password</label>
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-black/40" />
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full bg-[#F0F0F0] rounded-full pl-11 pr-11 py-3 text-sm text-black placeholder:text-black/40 outline-none border border-transparent focus:border-black/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-black/40 hover:text-black cursor-pointer"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Remember me & Forgot Password */}
          {isLogin && (
            <div className="flex items-center justify-between text-xs sm:text-sm pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-black/70">
                <input type="checkbox" className="rounded accent-black" />
                <span>Remember me</span>
              </label>
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-black font-medium hover:underline cursor-pointer"
              >
                Forgot password?
              </button>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-black text-white rounded-full py-3.5 text-base font-medium hover:bg-black/80 transition-colors mt-2 cursor-pointer shadow-sm"
          >
            {isLogin ? "Sign In" : "Create Account"}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6 text-center">
          <hr className="border-black/10" />
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-xs text-black/40 uppercase">
            Or continue with
          </span>
        </div>

        {/* Social Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => router.push("/checkout")}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-full border border-black/10 hover:bg-black/5 transition text-sm font-medium text-black cursor-pointer"
          >
            <span>Google</span>
          </button>
          <button
            type="button"
            onClick={() => router.push("/checkout")}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-full border border-black/10 hover:bg-black/5 transition text-sm font-medium text-black cursor-pointer"
          >
            <span>Apple</span>
          </button>
        </div>
      </div>

      {/* Forgot Password Popup Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-[24px] max-w-sm w-full p-6 sm:p-8 border border-black/10 shadow-2xl relative">
            <button
              onClick={() => setShowForgotModal(false)}
              className="absolute top-5 right-5 text-black/40 hover:text-black cursor-pointer"
            >
              <X size={20} />
            </button>

            {resetSent ? (
              <div className="text-center py-4 space-y-3">
                <CheckCircle2 size={48} className="mx-auto text-emerald-600" />
                <h3 className="text-lg font-bold text-black">Reset Link Sent!</h3>
                <p className="text-sm text-black/60">
                  Please check your inbox for instructions to reset your password.
                </p>
              </div>
            ) : (
              <form onSubmit={handleResetSubmit} className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-black mb-1">Reset Password</h3>
                  <p className="text-xs text-black/60">
                    Enter your email address and we will send you a recovery link.
                  </p>
                </div>
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full bg-[#F0F0F0] rounded-full px-4 py-3 text-sm text-black placeholder:text-black/40 outline-none"
                />
                <button
                  type="submit"
                  className="w-full bg-black text-white rounded-full py-3 text-sm font-medium hover:bg-black/80 transition cursor-pointer"
                >
                  Send Reset Link
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F2F0F1]" />}>
      <AuthForm />
    </Suspense>
  );
}
