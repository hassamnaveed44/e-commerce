import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { isCloudinaryConfigured, uploadToCloudinary } from "@/lib/cloudinary";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAdmin();
    if (!authResult.authorized) {
      return authResult.errorResponse || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
    }

    // Validate mime type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { success: false, error: "Only image files (JPEG, PNG, WebP, etc.) are allowed." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 1. If Cloudinary is configured in environment, upload to Cloudinary CDN
    if (isCloudinaryConfigured()) {
      try {
        console.log(`[Image Upload] Uploading "${file.name}" directly to Cloudinary CDN...`);
        const cloudinaryResult = await uploadToCloudinary(buffer, file.name, "shop-co/products");
        console.log(`[Image Upload] ✅ Cloudinary upload complete: ${cloudinaryResult.url}`);

        return NextResponse.json({
          success: true,
          url: cloudinaryResult.url,
          publicId: cloudinaryResult.publicId,
          filename: file.name,
          provider: "cloudinary",
        });
      } catch (cloudinaryErr: any) {
        console.error("Cloudinary upload failed, attempting local fallback:", cloudinaryErr);
        // If Cloudinary failed due to network or bad key, attempt local fallback below
      }
    }

    // 2. Local Disk Fallback (Used during local development without Cloudinary credentials)
    console.log(`[Image Upload] Writing "${file.name}" to local public/uploads directory...`);
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });

    const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const uniqueFilename = `${Date.now()}-${sanitizedFilename}`;
    const filePath = path.join(uploadsDir, uniqueFilename);

    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/${uniqueFilename}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename: uniqueFilename,
      provider: "local",
    });
  } catch (error: any) {
    console.error("Admin file upload error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to upload image" },
      { status: 500 }
    );
  }
}
