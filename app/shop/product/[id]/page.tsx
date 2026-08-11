import Breadcrumb from "@/app/components/product/BreadCrumb";
import ProductImages from "@/app/components/product/ProductImages";
import ProductInfo from "@/app/components/product/ProductInfo";
import Tabs from "@/app/components/product/Tabs";
import ReviewsList from "@/app/components/product/ReviewsList";
import YouMightAlsoLike from "@/app/components/product/YouMightAlsoLike";

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

      {/* Main Product Section (Gallery + Info) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          <ProductImages />
          <ProductInfo />
        </div>
      </section>

      {/* Tabs & Reviews Section */}
      <Tabs />
      <ReviewsList />

      {/* Related Products Section */}
      <YouMightAlsoLike />
    </main>
  );
}