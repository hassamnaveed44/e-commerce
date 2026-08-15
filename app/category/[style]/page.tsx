import Breadcrumb from "@/app/components/category/Breadcrumb";
import FiltersSidebar from "@/app/components/category/FiltersSidebar";
import ProductGrid from "@/app/components/category/ProductGrid";
import Pagination from "@/app/components/category/Pagination";
import { getProducts } from "@/services/product.service";

export const dynamic = "force-dynamic";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ style: string }>;
}) {
  const { style } = await params;

  // Query products for this category slug
  const result = await getProducts({
    categorySlug: style.toLowerCase(),
    limit: 12,
  });

  // Fallback to all products if specific category filter returns 0 (e.g. "casual")
  const productsToDisplay =
    result.products.length > 0
      ? result.products
      : (await getProducts({ limit: 12 })).products;

  const formattedCategory = style
    ? style.charAt(0).toUpperCase() + style.slice(1)
    : "Casual";

  return (
    <main className="min-h-screen bg-white">
      {/* Category Breadcrumb */}
      <Breadcrumb categoryName={formattedCategory} />

      {/* Main Category Content Area */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 xl:px-10 pb-16 pt-2">
        <div className="flex gap-5 lg:gap-8 items-start">
          {/* Filters Sidebar */}
          <FiltersSidebar />

          {/* Right Product Grid Area + Pagination */}
          <div className="flex-1 w-full">
            <ProductGrid
              categoryName={formattedCategory}
              products={productsToDisplay}
              totalCount={result.totalCount}
            />
            <Pagination />
          </div>
        </div>
      </section>
    </main>
  );
}
