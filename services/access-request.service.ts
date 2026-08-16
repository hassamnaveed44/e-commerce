import { prisma } from "@/lib/db";
import { randomUUID } from "crypto";

export interface AccessRequestRecord {
  id: string;
  userId: string;
  email: string;
  name: string | null;
  reason: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    id: string;
    email: string;
    fullName: string | null;
    role: string;
    createdAt: Date;
  };
}

export async function findLatestRequestForUser(userId: string): Promise<AccessRequestRecord | null> {
  try {
    if ((prisma as any).adminAccessRequest?.findFirst) {
      const res = await (prisma as any).adminAccessRequest.findFirst({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });
      if (res) return res;
    }
  } catch {
    // Fallback to raw SQL
  }

  try {
    const rows = await prisma.$queryRaw<AccessRequestRecord[]>`
      SELECT id, "userId", email, name, reason, status, "createdAt", "updatedAt"
      FROM "AdminAccessRequest"
      WHERE "userId" = ${userId}
      ORDER BY "createdAt" DESC
      LIMIT 1
    `;
    return rows[0] || null;
  } catch (err) {
    console.error("SQL findLatestRequest error:", err);
    return null;
  }
}

export async function findPendingRequestForUser(userId: string): Promise<AccessRequestRecord | null> {
  const latest = await findLatestRequestForUser(userId);
  if (latest && latest.status === "PENDING") return latest;
  return null;
}

export async function createAccessRequest(data: {
  userId: string;
  email: string;
  name: string;
  reason: string;
}): Promise<AccessRequestRecord> {
  try {
    if ((prisma as any).adminAccessRequest?.create) {
      return await (prisma as any).adminAccessRequest.create({
        data: {
          userId: data.userId,
          email: data.email,
          name: data.name,
          reason: data.reason,
          status: "PENDING",
        },
      });
    }
  } catch {
    // Fallback to raw SQL
  }

  const id = randomUUID();
  const now = new Date();
  await prisma.$executeRaw`
    INSERT INTO "AdminAccessRequest" (id, "userId", email, name, reason, status, "createdAt", "updatedAt")
    VALUES (${id}, ${data.userId}, ${data.email}, ${data.name}, ${data.reason}, 'PENDING', ${now}, ${now})
  `;

  return {
    id,
    userId: data.userId,
    email: data.email,
    name: data.name,
    reason: data.reason,
    status: "PENDING",
    createdAt: now,
    updatedAt: now,
  };
}

export async function getAllAccessRequests(): Promise<AccessRequestRecord[]> {
  try {
    if ((prisma as any).adminAccessRequest?.findMany) {
      return await (prisma as any).adminAccessRequest.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: { id: true, email: true, fullName: true, role: true, createdAt: true },
          },
        },
      });
    }
  } catch {
    // Fallback to raw SQL
  }

  try {
    const rows = await prisma.$queryRaw<AccessRequestRecord[]>`
      SELECT r.id, r."userId", r.email, r.name, r.reason, r.status, r."createdAt", r."updatedAt",
             u.id as "user_id", u.email as "user_email", u."fullName" as "user_fullName", u.role as "user_role", u."createdAt" as "user_createdAt"
      FROM "AdminAccessRequest" r
      LEFT JOIN "User" u ON r."userId" = u.id
      ORDER BY r."createdAt" DESC
    `;
    return rows.map((r: any) => ({
      id: r.id,
      userId: r.userId,
      email: r.email,
      name: r.name,
      reason: r.reason,
      status: r.status,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      user: r.user_id
        ? {
            id: r.user_id,
            email: r.user_email,
            fullName: r.user_fullName,
            role: r.user_role,
            createdAt: r.user_createdAt,
          }
        : undefined,
    }));
  } catch (err) {
    console.error("SQL getAllAccessRequests error:", err);
    return [];
  }
}

export async function updateAccessRequestStatus(id: string, status: "APPROVED" | "REJECTED"): Promise<void> {
  try {
    if ((prisma as any).adminAccessRequest?.update) {
      await (prisma as any).adminAccessRequest.update({
        where: { id },
        data: { status },
      });
      return;
    }
  } catch {
    // Fallback to raw SQL
  }

  await prisma.$executeRaw`
    UPDATE "AdminAccessRequest"
    SET status = ${status}, "updatedAt" = ${new Date()}
    WHERE id = ${id}
  `;
}
