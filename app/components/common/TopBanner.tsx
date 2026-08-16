import Link from "next/link";
import { X } from "lucide-react";

export default function TopBanner() {
  return (
    <div className="bg-black text-white text-xs md:text-sm py-2.5 px-4 relative z-50 flex items-center justify-center">
      <p className="text-center">
        Sign up and get 20% off to your first order.{" "}
        <Link href="/register" className="underline font-medium hover:opacity-80 transition">
          Sign Up Now
        </Link>
      </p>
      <button 
        aria-label="Close banner"
        className="absolute right-4 md:right-10 text-white hover:opacity-80 transition hidden sm:block"
      >
        <X size={20} />
      </button>
    </div>
  );
}