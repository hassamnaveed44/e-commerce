import { notFound } from "next/navigation";
import Breadcrumb from "@/app/components/product/BreadCrumb";
import ProductImages from "@/app/components/product/ProductImages";
import ProductInfo from "@/app/components/product/ProductInfo";
import Tabs from "@/app/components/product/Tabs";
import YouMightAlsoLike from "@/app/components/product/YouMightAlsoLike";
import { getProductBySlugOrId, getProducts, getRecommendedProducts } from "@/services/product.service";

export const dynamic = "force-dynamic";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProductBySlugOrId(id);

  if (!product) {
    notFound();
  }

  // Fetch 4 dynamic recommendations (same category first, backfilling with other active products)
  const rawRecommendations = await getRecommendedProducts(
    product.id,
    product.category?.slug,
    4
  );

  const relatedProducts = rawRecommendations.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    images: p.images,
    price: Number(p.price),
    originalPrice: p.originalPrice ? Number(p.originalPrice) : null,
    discountPercent: p.discountPercent,
    averageRating: p.averageRating,
  }));

  // Serialize product for Client Components (converting Decimal & Date)
  const serializedProduct = {
    ...product,
    price: Number(product.price),
    originalPrice: product.originalPrice ? Number(product.originalPrice) : null,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
    variants: product.variants.map((v) => ({
      ...v,
      stockQuantity: v.stockQuantity,
    })),
    reviews: product.reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt.toISOString(),
      user: { fullName: r.user?.fullName || "Verified Buyer" },
    })),
  };

  return (
    <main className="min-h-screen bg-white">
      {/* Dynamic Breadcrumb */}
      <Breadcrumb
        categoryName={serializedProduct.category?.name}
        categorySlug={serializedProduct.category?.slug}
        productName={serializedProduct.name}
      />

      {/* Main Product Section (Gallery + Info) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          <ProductImages
            images={serializedProduct.images}
            productName={serializedProduct.name}
          />
          <ProductInfo product={serializedProduct} />
        </div>
      </section>

      {/* Interactive Tabs (Product Details, Reviews, FAQs) */}
      <Tabs product={serializedProduct} />

      {/* Dynamic Recommendations */}
      <YouMightAlsoLike products={relatedProducts} />
    </main>
  );
}
