import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface BreadcrumbProps {
  categoryName?: string;
}

export default function Breadcrumb({ categoryName = "cart" }: BreadcrumbProps) {
  return (
    <div className="w-full">
      {/* Thin horizontal divider line */}
      <hr className="border-t border-black/10 w-full" />
      
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <ol className="flex items-center space-x-2 text-sm sm:text-base font-satoshi">
          <li>
            <Link href="/" className="text-black/60 hover:text-black transition-colors">
              Home
            </Link>
          </li>
          <li className="text-black/40">
            <ChevronRight size={16} />
          </li>
          <li className="text-black font-medium capitalize truncate">
            {categoryName}
          </li>
        </ol>
      </nav>
    </div>
  );
}