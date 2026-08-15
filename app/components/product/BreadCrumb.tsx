import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface BreadcrumbProps {
  categoryName?: string;
  categorySlug?: string;
  productName: string;
}

export default function Breadcrumb({
  categoryName = "Shop",
  categorySlug = "casual",
  productName,
}: BreadcrumbProps) {
  return (
    <div className="w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 xl:px-10">
        <hr className="border-t border-black/10 w-full" />
      </div>

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
            <Link href="/category/casual" className="text-black/60 hover:text-black transition-colors">
              Shop
            </Link>
          </li>
          <li className="text-black/40">
            <ChevronRight size={16} />
          </li>
          <li>
            <Link
              href={`/category/${categorySlug}`}
              className="text-black/60 hover:text-black transition-colors capitalize"
            >
              {categoryName}
            </Link>
          </li>
          <li className="text-black/40">
            <ChevronRight size={16} />
          </li>
          <li className="text-black font-medium truncate max-w-[200px] sm:max-w-none">
            {productName}
          </li>
        </ol>
      </nav>
    </div>
  );
}
