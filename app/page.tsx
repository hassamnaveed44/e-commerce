import Hero from "@/app/components/home/Hero";
import Brands from "@/app/components/home/Brands";
import ProductSection from "@/app/components/home/ProductSection";
import DressStyle from "./components/home/DressStyle";
import Testimonials from "@/app/components/home/Testimonials";


// Sample mock data matching Figma specs
const newArrivalsData = [
  { id: 1, name: "T-shirt with Tape Details", image: "/images/product-1.png", price: 120, rating: 4.5 },
  { id: 2, name: "Skinny Fit Jeans", image: "/images/product-2.png", price: 240, originalPrice: 260, discount: "-20%", rating: 3.5 },
  { id: 3, name: "Checkered Shirt", image: "/images/product-3.png", price: 180, rating: 4.5 },
  { id: 4, name: "Sleeve Striped T-shirt", image: "/images/product-4.png", price: 130, originalPrice: 160, discount: "-30%", rating: 4.5 },
];

const topSellingData = [
  { id: 5, name: "Vertical Striped Shirt", image: "/images/product-5.png", price: 212, originalPrice: 232, discount: "-20%", rating: 5.0 },
  { id: 6, name: "Courage Graphic T-shirt", image: "/images/product-6.png", price: 145, rating: 4.0 },
  { id: 7, name: "Loose Fit Bermuda Shorts", image: "/images/product-7.png", price: 80, rating: 3.0 },
  { id: 8, name: "Faded Skinny Jeans", image: "/images/product-8.png", price: 210, rating: 4.5 },
];

export default function Home() {
  return (
    <main>
      <Hero />
      <Brands />
      <ProductSection title="NEW ARRIVALS" products={newArrivalsData} />
      <ProductSection title="TOP SELLING" products={topSellingData} />
      <DressStyle />
      <Testimonials />
    </main>
  );
}