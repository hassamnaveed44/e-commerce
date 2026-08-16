import Hero from "@/app/components/home/Hero";
import Brands from "@/app/components/home/Brands";
import ProductSection from "@/app/components/home/ProductSection";
import DressStyle from "./components/home/DressStyle";
import Testimonials from "@/app/components/home/Testimonials";
import { getProducts } from "@/services/product.service";

export const dynamic = "force-dynamic";

type DbProduct = Awaited<ReturnType<typeof getProducts>>["products"][number];

export default async function Home() {
  // Fetch real products from PostgreSQL
  const [newArrivalsResponse, topSellingResponse] = await Promise.all([
    getProducts({ sort: "newest", limit: 4 }),
    getProducts({ sort: "rating-desc", limit: 4 }),
  ]);

  // Type-safe formatter function
  const formatProduct = (p: DbProduct) => ({
    id: p.slug || p.id,
    name: p.name,
    image: p.images[0]?.url || "/images/product-1.png",
    price: Number(p.price),
    originalPrice: p.originalPrice ? Number(p.originalPrice) : undefined,
    discount: p.discountPercent > 0 ? `-${p.discountPercent}%` : undefined,
    rating: p.averageRating,
  });

  const newArrivalsData = newArrivalsResponse.products.map(formatProduct);
  const topSellingData = topSellingResponse.products.map(formatProduct);

  return (
    <main>
      <Hero />
      <Brands />
      <ProductSection id="new-arrivals" title="NEW ARRIVALS" products={newArrivalsData} />
      <ProductSection id="top-selling" title="TOP SELLING" products={topSellingData} />
      <DressStyle />
      <Testimonials />
    </main>
  );
}
