import { prisma } from "../lib/db";

async function testOrderStatusUpdate() {
  console.log("=== Testing Order Status Update in DB ===");
  const order = await prisma.order.findFirst();
  if (!order) {
    console.log("No orders found");
    return;
  }

  console.log(`Initial Order ${order.orderNumber} status: ${order.orderStatus}`);

  // Test updating status
  const updated = await prisma.order.update({
    where: { id: order.id },
    data: { orderStatus: "PROCESSING" },
  });

  console.log(`Updated Order ${updated.orderNumber} status: ${updated.orderStatus}`);
}

testOrderStatusUpdate().catch(console.error).finally(() => prisma.$disconnect());
