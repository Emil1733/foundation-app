import Link from "next/link";
import { ChevronDown } from "lucide-react";

type DirectoryPageIndexProps = {
  basePath: string;
  totalItems: number;
  totalPages: number;
  pageSize: number;
};

export default function DirectoryPageIndex({
  basePath,
  totalItems,
  totalPages,
  pageSize,
}: DirectoryPageIndexProps) {
  if (totalPages <= 1) return null;

  return (
    <details className="mb-8 rounded-2xl border border-slate-200 bg-white shadow-sm">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-2xl px-5 py-4 text-slate-800 marker:content-none hover:bg-slate-50 sm:px-6">
        <span>
          <span className="block font-bold">Jump to another part of the directory</span>
          <span className="mt-1 block text-sm font-normal text-slate-500">
            Cities are listed alphabetically in groups of {pageSize}.
          </span>
        </span>
        <ChevronDown className="h-5 w-5 shrink-0 text-slate-500" aria-hidden="true" />
      </summary>

      <nav aria-label="All alphabetical city groups" className="border-t border-slate-200 px-5 py-5 sm:px-6">
        <ol className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {Array.from({ length: totalPages }, (_, index) => {
            const page = index + 1;
            const first = index * pageSize + 1;
            const last = Math.min(page * pageSize, totalItems);
            const href = page === 1 ? basePath : `${basePath}?page=${page}`;

            return (
              <li key={page}>
                <Link
                  href={href}
                  className="flex min-h-11 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-center text-sm font-semibold text-slate-700 transition hover:border-blue-400 hover:bg-blue-50 hover:text-blue-800"
                  aria-label={`Cities ${first} through ${last}`}
                >
                  {first.toLocaleString()}–{last.toLocaleString()}
                </Link>
              </li>
            );
          })}
        </ol>
      </nav>
    </details>
  );
}
