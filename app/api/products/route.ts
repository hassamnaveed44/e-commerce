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

    const sortParam = searchParams.get("sort");

    const sort: ProductSort =
      sortParam === "oldest" ||
      sortParam === "price-low" ||
      sortParam === "price-high"
        ? sortParam
        : "newest";

    const search = searchParams.get("search") || undefined;

    const page = searchParams.get("page")
      ? parseInt(searchParams.get("page")!, 10)
      : 1;

    const limit = searchParams.get("limit")
      ? parseInt(searchParams.get("limit")!, 10)
      : 8;

    const result = await getProducts({
      categorySlug,
      minPrice,
      maxPrice,
      search,
      page,
      limit,
      ...(sort ? { sort } : {}),
    } as Parameters<typeof getProducts>[0] & {
      sort?: ProductSort;
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