export interface Product {
  id: string;
  title: string;
  srcUrl: string;
  price: number;
  discountPrice?: number;
  rating: number;
  discountPercent?: number;
}

export const newArrivalsData: Product[] = [
  {
    id: "1",
    title: "T-shirt with Tape Details",
    srcUrl: "/images/product-1.png", // Replace with your image paths or placeholder URLs
    price: 120,
    rating: 4.5,
  },
  {
    id: "2",
    title: "Skinny Fit Jeans",
    srcUrl: "/images/product-2.png",
    price: 240,
    discountPrice: 260,
    discountPercent: 20,
    rating: 3.5,
  },
  {
    id: "3",
    title: "Checkered Shirt",
    srcUrl: "/images/product-3.png",
    price: 180,
    rating: 4.5,
  },
  {
    id: "4",
    title: "Sleeve Striped T-shirt",
    srcUrl: "/images/product-4.png",
    price: 130,
    discountPrice: 160,
    discountPercent: 30,
    rating: 4.5,
  },
];

export const topSellingData: Product[] = [
  {
    id: "5",
    title: "Vertical Striped Shirt",
    srcUrl: "/images/product-5.png",
    price: 212,
    discountPrice: 232,
    discountPercent: 20,
    rating: 5.0,
  },
  {
    id: "6",
    title: "Courage Graphic T-Shirt",
    srcUrl: "/images/product-6.png",
    price: 145,
    rating: 4.0,
  },
  {
    id: "7",
    title: "Loose Fit Bermuda Shorts",
    srcUrl: "/images/product-7.png",
    price: 80,
    rating: 3.0,
  },
  {
    id: "8",
    title: "Faded Skinny Jeans",
    srcUrl: "/images/product-8.png",
    price: 210,
    rating: 4.5,
  },
];