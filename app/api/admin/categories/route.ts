import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const DEFAULT_CATEGORIES = [
  { name: "T-Shirts", slug: "t-shirts", imageUrl: "/images/product-1.png" },
  { name: "Shirts", slug: "shirts", imageUrl: "/images/product-3.png" },
  { name: "Jeans", slug: "jeans", imageUrl: "/images/product-2.png" },
  { name: "Hoodies", slug: "hoodies", imageUrl: "/images/product-5.png" },
  { name: "Shorts", slug: "shorts", imageUrl: "/images/product-7.png" },
  { name: "Full Suits", slug: "full-suits", imageUrl: "/images/product-3.png" },
  { name: "Pant Shirt", slug: "pant-shirt", imageUrl: "/images/product-3.png" },
  { name: "Three Piece", slug: "three-piece", imageUrl: "/images/product-3.png" },
];

export async function GET() {
  try {
    // 1. Check existing categories
    let categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        imageUrl: true,
      },
    });

    // 2. Ensure all standard popular categories exist in DB
    const existingSlugs = new Set(categories.map((c) => c.slug.toLowerCase()));
    const missing = DEFAULT_CATEGORIES.filter((dc) => !existingSlugs.has(dc.slug.toLowerCase()));

    if (missing.length > 0) {
      for (const m of missing) {
        try {
          await prisma.category.create({
            data: {
              name: m.name,
              slug: m.slug,
              imageUrl: m.imageUrl,
            },
          });
        } catch (createErr) {
          // If already created concurrently, ignore
        }
      }

      // Re-fetch updated list
      categories = await prisma.category.findMany({
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          slug: true,
          imageUrl: true,
        },
      });
    }

    return NextResponse.json({
      success: true,
      categories,
    });
  } catch (error) {
    console.error("Admin categories GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
