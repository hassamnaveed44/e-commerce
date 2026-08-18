import Link from "next/link";
import { getProducts } from "@/services/product.service";
import { ArrowRight, PackageX, ShoppingBag, Star } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; search?: string }>;
}) {
  const params = await searchParams;
  const query = (params.q || params.search || "").trim();

  const result = query
    ? await getProducts({ search: query, limit: 24 })
    : { products: [], totalCount: 0 };

  const products = result.products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: Number(p.price),
    originalPrice: p.originalPrice ? Number(p.originalPrice) : null,
    discountPercent: p.discountPercent || 0,
    averageRating: p.averageRating || 4.5,
    dressStyle: p.dressStyle,
    categoryName: p.category?.name || "Apparel",
    image: p.images?.[0]?.url || "/images/placeholder.png",
  }));

  return (
    <main className="min-h-screen bg-white font-satoshi text-slate-900">
      {/* Breadcrumb Header */}
      <div className="border-b border-slate-100 bg-slate-50/50 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 xl:px-10 flex items-center gap-2 text-xs text-slate-500">
          <Link href="/" className="hover:text-slate-900 transition">
            Home
          </Link>
          <span>/</span>
          <span className="font-semibold text-slate-900">Search Results</span>
          {query && (
            <>
              <span>/</span>
              <span className="text-slate-600 truncate max-w-xs">&ldquo;{query}&rdquo;</span>
            </>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 xl:px-10 py-8 sm:py-12 space-y-8">
        {/* Results Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950 uppercase">
              {query ? `Results for "${query}"` : "Search Products"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {products.length > 0
                ? `Showing ${products.length} matching product${products.length > 1 ? "s" : ""}`
                : query
                ? `No available products found for "${query}"`
                : "Type a query in the search bar above to find products"}
            </p>
          </div>

          {products.length > 0 && (
            <Link
              href="/category/all"
              className="text-xs font-bold text-slate-900 hover:text-slate-600 flex items-center gap-1.5 self-start sm:self-auto transition"
            >
              <span>View All Categories</span>
              <ArrowRight size={14} />
            </Link>
          )}
        </div>

        {/* State A: Matching Products Available */}
        {products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.map((p) => {
              const hasDiscount = Boolean(p.originalPrice && p.originalPrice > p.price);
              return (
                <Link
                  key={p.id}
                  href={`/shop/product/${p.slug}`}
                  className="group flex flex-col rounded-2xl bg-white border border-slate-200/80 hover:border-slate-400 p-3 sm:p-4 shadow-2xs hover:shadow-md transition-all duration-200"
                >
                  {/* Thumbnail */}
                  <div className="relative w-full aspect-square rounded-xl bg-[#F0EEED] overflow-hidden mb-3.5 flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {hasDiscount && (
                      <span className="absolute top-2 left-2 bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-2xs">
                        -{p.discountPercent}%
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="space-y-1.5 flex-1 flex flex-col justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {p.categoryName} • {p.dressStyle}
                      </p>
                      <h3 className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-black line-clamp-1">
                        {p.name}
                      </h3>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-1 text-xs text-amber-500">
                      <Star size={13} className="fill-amber-400 text-amber-400" />
                      <span className="font-bold text-slate-800">{p.averageRating}</span>
                      <span className="text-[11px] text-slate-400">/ 5</span>
                    </div>

                    {/* Price */}
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-base sm:text-lg font-extrabold text-slate-950 font-mono">
                        ${p.price.toFixed(2)}
                      </span>
                      {hasDiscount && (
                        <span className="text-xs sm:text-sm text-slate-400 line-through font-mono">
                          ${p.originalPrice?.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          /* State B: Product is Unavailable Empty State (Exact Match to User Requirement) */
          <div className="rounded-3xl border border-slate-200 bg-slate-50/60 p-8 sm:p-14 text-center max-w-2xl mx-auto space-y-6">
            <div className="w-16 h-16 rounded-3xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-2xs">
              <PackageX size={32} />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold text-slate-950">
                This product is unavailable
              </h2>
              <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                {query ? (
                  <>
                    We couldn&apos;t find any active products matching &ldquo;<strong className="text-slate-900">{query}</strong>&rdquo; in our store inventory.
                  </>
                ) : (
                  "Please enter a product name, brand, or category to start searching."
                )}
              </p>
            </div>

            {/* Suggested Search Pills */}
            <div className="pt-2">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Try searching for available items:
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {[
                  "T-Shirts",
                  "Shirts",
                  "Three piece",
                  "Jeans",
                  "Hoodie",
                  "Casual",
                  "Formal",
                  "Party",
                ].map((term) => (
                  <Link
                    key={term}
                    href={`/search?q=${encodeURIComponent(term)}`}
                    className="rounded-full border border-slate-200 bg-white hover:bg-slate-100 text-xs font-bold text-slate-800 px-3.5 py-1.5 transition shadow-2xs"
                  >
                    {term}
                  </Link>
                ))}
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/category/all"
                className="w-full sm:w-auto rounded-full bg-black text-white hover:bg-black/85 text-xs font-bold px-6 py-3 transition shadow-xs flex items-center justify-center gap-2"
              >
                <ShoppingBag size={15} />
                <span>Browse All Products</span>
              </Link>
              <Link
                href="/"
                className="w-full sm:w-auto rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-800 px-6 py-3 transition shadow-2xs"
              >
                Back to Home
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
