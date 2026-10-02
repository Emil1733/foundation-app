import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { parsePageNumber } from '@/lib/pagination';
import { buildLearnMetadata, renderLearnPage } from '../../page';

export const revalidate = 3600;
export async function generateStaticParams() { return []; }

type LearnDirectoryPageProps = {
  params: Promise<{ page: string }>;
};

export async function generateMetadata({ params }: LearnDirectoryPageProps): Promise<Metadata> {
  const { page: rawPage } = await params;
  const page = parsePageNumber(rawPage);
  if (!page) return { title: 'Not Found' };
  return buildLearnMetadata(page);
}

export default async function LearnDirectoryPage({ params }: LearnDirectoryPageProps) {
  const { page: rawPage } = await params;
  const page = parsePageNumber(rawPage);
  if (!page) notFound();
  if (page === 1) permanentRedirect('/learn');
  return renderLearnPage(page);
}
