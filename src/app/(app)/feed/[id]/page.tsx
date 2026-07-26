import { notFound } from "next/navigation";
import { getContent } from "@/features/content/queries";
import { ContentDetail } from "@/features/content/ContentDetail";

export const dynamic = "force-dynamic";

export default async function ContentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getContent(id);
  if (!data) notFound();

  return <ContentDetail content={data.content} analysis={data.analysis} />;
}
