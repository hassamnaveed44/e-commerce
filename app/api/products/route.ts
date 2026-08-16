import { NextRequest, NextResponse } from "next/server";
import { getProducts } from "@/services/product.service";

type ProductSort = "newest" | "oldest" | "price-low" | "price-high";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const categorySlug = searchParams.get("category") || undefined;

    const minPrice = searchParams.get("minPrice")
      ? Number(searchParams.get("minPrice"))
      : undefined;

    const maxPrice = searchParams.get("maxPrice")
      ? Number(searchParams.get("maxPrice"))
      : undefined;

    const color = searchParams.get("color") || undefined;
    const size = searchParams.get("size") || undefined;
    const sortParam = searchParams.get("sort");

    const sort = (sortParam as any) || "newest";
    const search = searchParams.get("search") || undefined;

    const page = searchParams.get("page")
      ? parseInt(searchParams.get("page")!, 10)
      : 1;

    const limit = searchParams.get("limit")
      ? parseInt(searchParams.get("limit")!, 10)
      : 12;

    const result = await getProducts({
      categorySlug,
      minPrice,
      maxPrice,
      color,
      size,
      search,
      page,
      limit,
      sort,
    });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Error fetching products:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch products",
      },
      { status: 500 }
    );
  }
}