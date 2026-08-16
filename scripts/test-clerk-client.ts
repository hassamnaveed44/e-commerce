import "dotenv/config";
import { clerkClient } from "@clerk/nextjs/server";

async function testClerkClient() {
  const client = await clerkClient();
  const user = await client.users.getUser("user_3Hy27BmFSwgq90NzyLzcFhOmInc");
  console.log("Clerk User publicMetadata:", user.publicMetadata);
  console.log("Clerk User role:", user.publicMetadata?.role);
}

testClerkClient().catch(console.error);
