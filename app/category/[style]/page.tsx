import Breadcrumb from "@/app/components/category/Breadcrumb";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ style: string }>;
}) {
  const { style } = await params;
  
  // Format category name for display (e.g., "casual" -> "Casual")
  const formattedCategory = style ? style.charAt(0).toUpperCase() + style.slice(1) : "Category";

  return (
    <main className="min-h-screen bg-white">
      {/* Category Breadcrumb */}
      <Breadcrumb categoryName={formattedCategory} />

      {/* Main Category Content Area */}
      {/* <section className="max-w-7xl mx-auto px-4 sm:px-6 xl:px-10 pb-16">
        <h1 className="text-3xl font-bold font-satoshi mb-6 capitalize text-black">
          {formattedCategory}
        </h1>
        <p className="text-black/60 font-satoshi">
          Filters sidebar, product grid, and pagination will be assembled here component by component.
        </p>
      </section> */}
    </main>
  );
}
 