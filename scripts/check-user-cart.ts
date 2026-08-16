import { prisma } from "../lib/db";

async function checkUserAndCart() {
  console.log("=== Checking Users in DB ===");
  const users = await prisma.user.findMany({
    include: {
      cartItems: {
        include: {
          variant: {
            include: { product: true },
          },
        },
      },
    },
  });

  for (const u of users) {
    console.log(`User ID: ${u.id}, ClerkID: ${u.clerkId}, Email: ${u.email}, Role: ${u.role}`);
    console.log(`Cart Items count: ${u.cartItems.length}`);
    let totalQty = 0;
    for (const item of u.cartItems) {
      console.log(`  - ${item.variant.product.name} (${item.variant.colorName}, ${item.variant.size}): qty ${item.quantity}`);
      totalQty += item.quantity;
    }
    console.log(`Total Quantity for user: ${totalQty}\n`);
  }

  // Also check guest cart items
  const guestCartItems = await prisma.cartItem.findMany({
    where: { userId: null },
    include: {
      variant: {
        include: { product: true },
      },
    },
  });
  console.log(`Guest Cart Items count: ${guestCartItems.length}`);
  let guestTotal = 0;
  for (const item of guestCartItems) {
    console.log(`  - [Guest ${item.sessionToken?.slice(0, 8)}] ${item.variant.product.name} (${item.variant.colorName}, ${item.variant.size}): qty ${item.quantity}`);
    guestTotal += item.quantity;
  }
  console.log(`Guest Total Quantity: ${guestTotal}`);
}

checkUserAndCart()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
