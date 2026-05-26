import { redirect } from "next/navigation";

export default async function ErrorDetectionPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam || "1", 10) || 1);
  redirect(`/error-detection/${page}`);
}
