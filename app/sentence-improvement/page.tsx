import { redirect } from "next/navigation";

export default async function SentenceImprovementPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam || "1", 10) || 1);
  redirect(`/sentence-improvement/${page}`);
}
