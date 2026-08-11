import Breadcrumb from "@/app/components/product/BreadCrumb";
import ProductImages from "@/app/components/product/ProductImages";
import ProductInfo from "@/app/components/product/ProductInfo";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await params;

  return (
    <main className="min-h-screen bg-white">
      {/* Top Divider & Breadcrumb */}
      <Breadcrumb />

      {/* Main Product Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 xl:px-10 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 xl:gap-10 items-stretch">
          <ProductImages />
          <ProductInfo />
        </div>
      </section>
    </main>
  );
}
