import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { createActivity, listActivities, type ActivityInput } from "../../../lib/activities";

export async function GET() {
  const session = await getServerSession(authOptions);
  const includeUnpublished = Boolean(session);
  const activities = await listActivities({ includeUnpublished });
  return NextResponse.json({ activities });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json()) as Partial<ActivityInput>;
  if (!body.title) return NextResponse.json({ error: "Missing title" }, { status: 400 });

  const created = await createActivity({
    title: body.title,
    date: body.date,
    location: body.location,
    summary: body.summary,
    content: body.content,
    coverImageUrl: body.coverImageUrl,
    galleryImageUrls: body.galleryImageUrls ?? [],
    published: Boolean(body.published),
  });

  return NextResponse.json({ activity: created }, { status: 201 });
}
