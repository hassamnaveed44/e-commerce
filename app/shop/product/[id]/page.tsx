import Breadcrumb from "@/app/components/product/BreadCrumb";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <main className="min-h-screen bg-white">
      {/* Breadcrumb Section */}
      <Breadcrumb />

      {/* Product Details Placeholder */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <h1 className="text-2xl font-bold font-satoshi mb-4 text-black">
          Product ID: {id}
        </h1>
        <p className="text-black/60 font-satoshi">
          Product images, info, tabs, reviews, and related products will be assembled here component by component.
        </p>
      </section>
    </main>
  );
}
