import { prisma } from "../lib/db";

async function setAdminRole() {
  const updatedUser = await prisma.user.update({
    where: { email: "hassamnaveed44@gmail.com" },
    data: { role: "ADMIN" },
  });
  console.log(`Successfully updated ${updatedUser.email} to role: ${updatedUser.role}`);
}

setAdminRole()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
