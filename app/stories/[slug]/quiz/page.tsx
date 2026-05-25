import { redirect } from "next/navigation";
import { getStoryBySlug } from "@/lib/stories";

export default async function StoryQuizRedirect({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    // Verify the story exists, redirect to main story page
    const story = await getStoryBySlug(slug);
    if (!story) {
        redirect("/");
    }
    redirect(`/stories/${slug}`);
}