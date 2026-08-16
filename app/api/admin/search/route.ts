import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const authResult = await requireAdmin();
    if (!authResult.authorized) {
      return authResult.errorResponse || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim();

    if (!q) {
      return NextResponse.json({ success: true, results: { orders: [], products: [], customers: [] } });
    }

    const [orders, products, users] = await Promise.all([
      // Search orders by orderNumber, customer name, email
      prisma.order.findMany({
        where: {
          OR: [
            { orderNumber: { contains: q, mode: "insensitive" } },
            { user: { fullName: { contains: q, mode: "insensitive" } } },
            { user: { email: { contains: q, mode: "insensitive" } } },
          ],
        },
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          user: true,
          items: { take: 1 },
        },
      }),

      // Search products by name, slug, description
      prisma.product.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { slug: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
          ],
        },
        take: 5,
        include: {
          images: { where: { isPrimary: true }, take: 1 },
        },
      }),

      // Search customers
      prisma.user.findMany({
        where: {
          OR: [
            { email: { contains: q, mode: "insensitive" } },
            { fullName: { contains: q, mode: "insensitive" } },
          ],
        },
        take: 5,
      }),
    ]);

    const formattedOrders = orders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      customerName: o.user?.fullName || o.user?.email?.split("@")[0] || "Customer",
      totalAmount: Number(o.totalAmount),
      status: o.orderStatus,
      createdAt: o.createdAt.toISOString(),
      url: `/admin/orders`,
    }));

    const formattedProducts = products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: Number(p.price),
      image: p.images[0]?.url || "/images/product-1.png",
      url: `/admin/products`,
    }));

    const formattedCustomers = users.map((u) => ({
      id: u.id,
      name: u.fullName || u.email.split("@")[0],
      email: u.email,
      role: u.role,
    }));

    return NextResponse.json({
      success: true,
      results: {
        orders: formattedOrders,
        products: formattedProducts,
        customers: formattedCustomers,
      },
    });
  } catch (error) {
    console.error("Admin search error:", error);
    return NextResponse.json({ success: false, error: "Search failed" }, { status: 500 });
  }
}
