import Breadcrumb from "@/app/components/category/Breadcrumb";
import FiltersSidebar from "@/app/components/category/FiltersSidebar";
import ProductGrid from "@/app/components/category/ProductGrid";
import Pagination from "@/app/components/category/Pagination";
import { getProducts } from "@/services/product.service";

export const dynamic = "force-dynamic";

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ style: string }>;
  searchParams: Promise<{
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    color?: string;
    size?: string;
    sort?: string;
    page?: string;
  }>;
}) {
  const { style } = await params;
  const search = await searchParams;

  const currentCategoryParam = search.category;
  const normalizedStyle = style?.toLowerCase() || "casual";
  const isAll = normalizedStyle === "all";
  const isDressStyle = ["casual", "formal", "party", "gym"].includes(normalizedStyle);

  // If route param is a parent dress style (e.g. /category/formal), filter by dressStyle
  const activeDressStyle = isDressStyle ? normalizedStyle : undefined;

  // If search.category is provided (e.g. ?category=shirts) or route param is a direct garment type
  const activeCategory = currentCategoryParam || (!isDressStyle && !isAll ? normalizedStyle : undefined);

  const minPrice = search.minPrice !== undefined ? Number(search.minPrice) : undefined;
  const maxPrice = search.maxPrice !== undefined ? Number(search.maxPrice) : undefined;
  const color = search.color;
  const size = search.size;
  const sort = (search.sort as any) || "popular";
  const page = search.page ? Number(search.page) : 1;

  // Query products for this dress style, category slug and filters
  const result = await getProducts({
    categorySlug: activeCategory,
    dressStyle: activeDressStyle,
    minPrice,
    maxPrice,
    color,
    size,
    sort,
    page,
    limit: 12,
  });

  // Serialize products for Client Components (converting Decimal & Date to plain numbers/primitives)
  const serializedProducts = result.products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    images: (p.images || []).map((img: { url: string }) => ({ url: img.url })),
    price: Number(p.price),
    originalPrice: p.originalPrice ? Number(p.originalPrice) : null,
    discountPercent: p.discountPercent,
    averageRating: p.averageRating,
  }));

  const displayCategoryName = isAll
    ? "All Products"
    : activeCategory
    ? activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)
    : style.charAt(0).toUpperCase() + style.slice(1);

  return (
    <main className="min-h-screen bg-white">
      {/* Category Breadcrumb */}
      <Breadcrumb categoryName={displayCategoryName} />

      {/* Main Category Content Area */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 xl:px-10 pb-16 pt-2">
        <div className="flex gap-5 lg:gap-8 items-start">
          {/* Filters Sidebar */}
          <FiltersSidebar />

          {/* Right Product Grid Area + Pagination */}
          <div className="flex-1 w-full">
            <ProductGrid
              categoryName={displayCategoryName}
              products={serializedProducts}
              totalCount={result.totalCount}
            />
            {result.totalPages > 1 && <Pagination />}
          </div>
        </div>
      </section>
    </main>
  );
}

