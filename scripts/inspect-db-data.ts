import { prisma } from "../lib/db";

async function inspectDbData() {
  console.log("=== DB DATA INSPECTION ===");
  const orderCount = await prisma.order.count();
  console.log("Total Orders:", orderCount);

  const orders = await prisma.order.findMany({
    take: 5,
    include: {
      items: {
        include: {
          variant: {
            include: { product: true }
          }
        }
      },
      user: true,
      payment: true,
    }
  });
  console.log("Sample Orders:", JSON.stringify(orders, null, 2));

  const variants = await prisma.productVariant.findMany({
    where: { stockQuantity: { lte: 10 } },
    include: { product: true }
  });
  console.log(`Low Stock Variants (<= 10): ${variants.length}`);
  for (const v of variants) {
    console.log(`  - ${v.product.name} [${v.colorName || v.colorHex}, ${v.size}]: stock ${v.stockQuantity}`);
  }

  const reviewCount = await prisma.review.count();
  console.log("Total Reviews:", reviewCount);
}

inspectDbData().catch(console.error).finally(() => prisma.$disconnect());
