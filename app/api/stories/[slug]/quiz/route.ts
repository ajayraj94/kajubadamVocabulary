import { NextResponse } from "next/server";
import { getStoryQuiz } from "@/lib/stories";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const questions = getStoryQuiz(slug);

  if (!questions || questions.length === 0) {
    return NextResponse.json(
      { error: "Story not found or contains no parsed vocabulary." },
      { status: 404 }
    );
  }

  return NextResponse.json({ questions });
}
