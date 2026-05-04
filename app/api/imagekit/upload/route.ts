import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { getImageKit } from "../../../../lib/imagekitServer";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    const folder = (form.get("folder") as string | null) ?? "/wmb";
    const fileName = (form.get("fileName") as string | null) ?? file.name ?? "upload";
    const bytes = Buffer.from(await file.arrayBuffer());

    const imagekit = getImageKit();
    const result = await imagekit.files.upload({
      file: bytes.toString("base64"),
      fileName,
      folder,
    });

    return NextResponse.json({
      url: result.url,
      fileId: result.fileId,
      name: result.name,
    });
  } catch (e) {
    console.error("POST /api/imagekit/upload failed:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Upload failed" },
      { status: 500 }
    );
  }
}
