import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // 1. Clean existing records to avoid duplicates
  await prisma.review.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.order.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  // 2. Create Categories
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: "T-Shirts",
        slug: "t-shirts",
        imageUrl: "/images/product-1.png",
      },
    }),
    prisma.category.create({
      data: {
        name: "Jeans",
        slug: "jeans",
        imageUrl: "/images/product-2.png",
      },
    }),
    prisma.category.create({
      data: {
        name: "Shirts",
        slug: "shirts",
        imageUrl: "/images/product-3.png",
      },
    }),
    prisma.category.create({
      data: {
        name: "Shorts",
        slug: "shorts",
        imageUrl: "/images/product-7.png",
      },
    }),
    prisma.category.create({
      data: {
        name: "Hoodies",
        slug: "hoodies",
        imageUrl: "/images/product-8.png",
      },
    }),
  ]);

  const [tshirts, jeans, shirts, shorts, hoodies] = categories;

  // 3. Products Data Array
  const productsData = [
    {
      name: "T-shirt with Tape Details",
      slug: "t-shirt-with-tape-details",
      description: "A classic regular-fit t-shirt featuring tape details along the sides. Crafted from 100% breathable organic cotton.",
      price: 120.0,
      originalPrice: null,
      discountPercent: 0,
      averageRating: 4.5,
      categoryId: tshirts.id,
      image: "/images/product-1.png",
      colors: [
        { name: "Black", hex: "#000000" },
        { name: "Dark Green", hex: "#2D5A27" },
        { name: "Navy", hex: "#1A2B4C" },
      ],
      sizes: ["Small", "Medium", "Large", "X-Large"],
    },
    {
      name: "Skinny Fit Jeans",
      slug: "skinny-fit-jeans",
      description: "Premium stretch denim with a modern skinny silhouette. Features durable 5-pocket styling and reinforced stitching.",
      price: 240.0,
      originalPrice: 260.0,
      discountPercent: 20,
      averageRating: 3.5,
      categoryId: jeans.id,
      image: "/images/product-2.png",
      colors: [
        { name: "Blue Denim", hex: "#2E4D6B" },
        { name: "Black", hex: "#111111" },
      ],
      sizes: ["Small", "Medium", "Large", "X-Large"],
    },
    {
      name: "Checkered Shirt",
      slug: "checkered-shirt",
      description: "Timeless checkered pattern button-up shirt made with soft-brushed flannel cotton. Perfect for layering.",
      price: 180.0,
      originalPrice: null,
      discountPercent: 0,
      averageRating: 4.5,
      categoryId: shirts.id,
      image: "/images/product-3.png",
      colors: [
        { name: "Red/Navy Plaid", hex: "#8B1E1E" },
        { name: "Forest Plaid", hex: "#1E4B27" },
      ],
      sizes: ["Medium", "Large", "X-Large"],
    },
    {
      name: "Sleeve Striped T-shirt",
      slug: "sleeve-striped-t-shirt",
      description: "Athletic-inspired casual tee featuring contrasting twin sleeve stripes. Lightweight and comfortable.",
      price: 130.0,
      originalPrice: 160.0,
      discountPercent: 30,
      averageRating: 4.5,
      categoryId: tshirts.id,
      image: "/images/product-4.png",
      colors: [
        { name: "Orange/White", hex: "#E65100" },
        { name: "Black/White", hex: "#000000" },
      ],
      sizes: ["Small", "Medium", "Large"],
    },
    {
      name: "Vertical Striped Shirt",
      slug: "vertical-striped-shirt",
      description: "Relaxed resort-collar shirt with crisp vertical stripes. Breathable linen blend for warm weather comfort.",
      price: 212.0,
      originalPrice: 232.0,
      discountPercent: 20,
      averageRating: 5.0,
      categoryId: shirts.id,
      image: "/images/product-5.png",
      colors: [
        { name: "Green/White", hex: "#2E7D32" },
        { name: "Sky Blue", hex: "#1976D2" },
      ],
      sizes: ["Small", "Medium", "Large", "X-Large"],
    },
    {
      name: "Courage Graphic T-Shirt",
      slug: "courage-graphic-t-shirt",
      description: "Bold streetwear graphic print on heavyweight 240 GSM vintage-wash cotton.",
      price: 145.0,
      originalPrice: null,
      discountPercent: 0,
      averageRating: 4.0,
      categoryId: tshirts.id,
      image: "/images/product-6.png",
      colors: [
        { name: "Vintage Orange", hex: "#D84315" },
        { name: "Charcoal", hex: "#37474F" },
      ],
      sizes: ["Small", "Medium", "Large", "X-Large"],
    },
    {
      name: "Loose Fit Bermuda Shorts",
      slug: "loose-fit-bermuda-shorts",
      description: "Comfortable knee-length loose fit shorts with elastic waistband and deep side pockets.",
      price: 80.0,
      originalPrice: null,
      discountPercent: 0,
      averageRating: 3.0,
      categoryId: shorts.id,
      image: "/images/product-7.png",
      colors: [
        { name: "Navy Blue", hex: "#1A237E" },
        { name: "Khaki", hex: "#8D6E63" },
      ],
      sizes: ["Small", "Medium", "Large"],
    },
    {
      name: "Faded Skinny Jeans",
      slug: "faded-skinny-jeans",
      description: "Vintage-washed denim with subtle distressed detailing and comfortable flex stretch.",
      price: 210.0,
      originalPrice: null,
      discountPercent: 0,
      averageRating: 4.5,
      categoryId: jeans.id,
      image: "/images/product-8.png",
      colors: [
        { name: "Light Wash Denim", hex: "#64B5F6" },
        { name: "Faded Grey", hex: "#78909C" },
      ],
      sizes: ["Small", "Medium", "Large", "X-Large"],
    },
  ];

  // 4. Insert Products, Variants & Images
  for (const item of productsData) {
    const product = await prisma.product.create({
      data: {
        name: item.name,
        slug: item.slug,
        description: item.description,
        price: item.price,
        originalPrice: item.originalPrice,
        discountPercent: item.discountPercent,
        averageRating: item.averageRating,
        categoryId: item.categoryId,
        images: {
          create: [
            {
              url: item.image,
              isPrimary: true,
            },
          ],
        },
      },
    });

    // Create combinations of colors and sizes with stock
    for (const color of item.colors) {
      for (const size of item.sizes) {
        const sku = `${item.slug.substring(0, 4).toUpperCase()}-${color.name.substring(0, 3).toUpperCase()}-${size.substring(0, 2).toUpperCase()}`;
        await prisma.productVariant.create({
          data: {
            productId: product.id,
            colorName: color.name,
            colorHex: color.hex,
            size: size,
            stockQuantity: 25, // 25 units per variant
            sku: sku,
          },
        });
      }
    }
  }

  console.log("✅ Seeding completed successfully! 5 Categories, 8 Products, and ~60 Variants created.");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
