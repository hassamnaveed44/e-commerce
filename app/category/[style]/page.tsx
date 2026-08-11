import Breadcrumb from "@/app/components/category/Breadcrumb";
import FiltersSidebar from "@/app/components/category/FiltersSidebar";
import ProductGrid from "@/app/components/category/ProductGrid";
// import Pagination from "@/app/components/category/Pagination";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ style: string }>;
}) {
  const { style } = await params;

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
          {/* Filters Sidebar (Visible on Desktop only) */}
          <FiltersSidebar />

          {/* Right Product Grid Area + Pagination */}
          <div className="flex-1 w-full">
            <ProductGrid categoryName={formattedCategory} />
            {/* <Pagination /> */}
          </div>
        </div>
      </section>
    </main>
  );
}
