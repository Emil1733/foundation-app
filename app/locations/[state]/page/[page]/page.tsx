import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { parsePageNumber } from '@/lib/pagination';
import { buildStateHubMetadata, renderStateHubPage } from '../../page';

export const revalidate = 604800;
export async function generateStaticParams() { return []; }

type StateDirectoryPageProps = {
  params: Promise<{ state: string; page: string }>;
};

const resolvePage = (value: string) => parsePageNumber(value);

export async function generateMetadata({ params }: StateDirectoryPageProps): Promise<Metadata> {
  const { state, page: rawPage } = await params;
  const page = resolvePage(rawPage);
  if (!page) return { title: 'Not Found' };
  return buildStateHubMetadata(state, page);
}

export default async function StateDirectoryPage({ params }: StateDirectoryPageProps) {
  const { state, page: rawPage } = await params;
  const page = resolvePage(rawPage);
  if (!page) notFound();
  if (page === 1) permanentRedirect(`/locations/${state.toLowerCase()}`);
  return renderStateHubPage(state, page);
}
