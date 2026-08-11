import Breadcrumb from "@/app/components/product/BreadCrumb";
import ProductImages from "@/app/components/product/ProductImages";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await params;

  return (
    <main className="min-h-screen bg-white">
      {/* Breadcrumb Section */}
      <Breadcrumb />

      {/* Main Product Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <ProductImages />
      </section>
    </main>
  );
}