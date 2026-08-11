import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function Breadcrumb() {
  return (
    <div className="w-full">
      {/* 1240px centered horizontal divider line (Stroke: #000000, 10% opacity, 1px) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 xl:px-10">
        <hr className="border-t border-black/10 w-full" />
      </div>

      {/* Breadcrumb Navigation */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 xl:px-10 py-5">
        <ol className="flex items-center space-x-2 text-sm sm:text-base font-satoshi">
          <li>
            <Link href="/" className="text-black/60 hover:text-black transition-colors">
              Home
            </Link>
          </li>
          <li className="text-black/40">
            <ChevronRight size={16} />
          </li>
          <li>
            <Link href="/shop" className="text-black/60 hover:text-black transition-colors">
              Shop
            </Link>
          </li>
          <li className="text-black/40">
            <ChevronRight size={16} />
          </li>
          <li>
            <Link href="/shop/men" className="text-black/60 hover:text-black transition-colors">
              Men
            </Link>
          </li>
          <li className="text-black/40">
            <ChevronRight size={16} />
          </li>
          <li className="text-black font-medium truncate">
            T-shirts
          </li>
        </ol>
      </nav>
    </div>
  );
}
