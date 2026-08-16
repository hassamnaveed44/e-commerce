import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error("Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env");
  }

  // Get headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occurred -- no svix headers", { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error occurred", { status: 400 });
  }

  const eventType = evt.type;

  // Handle user.created or user.updated
  if (eventType === "user.created" || eventType === "user.updated") {
    const { id, email_addresses, first_name, last_name, public_metadata } = evt.data;
    const email = email_addresses?.[0]?.email_address;
    const fullName = [first_name, last_name].filter(Boolean).join(" ") || null;
    const role = (public_metadata?.role as "ADMIN" | "CUSTOMER") || "CUSTOMER";

    if (email) {
      await prisma.user.upsert({
        where: { clerkId: id },
        create: {
          clerkId: id,
          email: email,
          fullName: fullName,
          role: role,
        },
        update: {
          email: email,
          fullName: fullName,
          role: role,
        },
      });
    }
  }

  // Handle user.deleted
  if (eventType === "user.deleted") {
    const { id } = evt.data;
    if (id) {
      await prisma.user.deleteMany({
        where: { clerkId: id },
      });
    }
  }

  return NextResponse.json({ success: true, message: "Webhook processed" });
}
