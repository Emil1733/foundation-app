import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

type PaginationProps = {
  basePath: string;
  currentPage: number;
  totalPages: number;
  itemLabel: string;
};

const pageHref = (basePath: string, page: number) =>
  page === 1 ? basePath : `${basePath}?page=${page}`;

const visiblePages = (currentPage: number, totalPages: number) => {
  const pages = new Set([1, totalPages]);

  for (let page = currentPage - 2; page <= currentPage + 2; page += 1) {
    if (page > 1 && page < totalPages) pages.add(page);
  }

  return [...pages].sort((a, b) => a - b);
};

export default function Pagination({
  basePath,
  currentPage,
  totalPages,
  itemLabel,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = visiblePages(currentPage, totalPages);

  return (
    <nav
      aria-label={`${itemLabel} pagination`}
      className="mt-12 flex flex-col items-center gap-4"
    >
      <p className="text-sm text-slate-500">
        Page <strong className="text-slate-800">{currentPage}</strong> of{" "}
        <strong className="text-slate-800">{totalPages}</strong>
      </p>

      <div className="flex flex-wrap items-center justify-center gap-2">
        {currentPage > 1 && (
          <Link
            href={pageHref(basePath, currentPage - 1)}
            rel="prev"
            className="inline-flex min-h-11 items-center gap-1 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-400 hover:text-blue-700"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" /> Previous{" "}
            <span className="hidden sm:inline">{itemLabel}</span>
          </Link>
        )}

        {pages.map((page, index) => {
          const previousPage = pages[index - 1];
          const showEllipsis = previousPage && page - previousPage > 1;

          return (
            <span key={page} className="contents">
              {showEllipsis && (
                <span className="px-1 text-slate-400" aria-hidden="true">
                  …
                </span>
              )}
              <Link
                href={pageHref(basePath, page)}
                aria-current={page === currentPage ? "page" : undefined}
                aria-label={`Page ${page}`}
                className={`inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                  page === currentPage
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-slate-300 bg-white text-slate-700 hover:border-blue-400 hover:text-blue-700"
                }`}
              >
                {page}
              </Link>
            </span>
          );
        })}

        {currentPage < totalPages && (
          <Link
            href={pageHref(basePath, currentPage + 1)}
            rel="next"
            className="inline-flex min-h-11 items-center gap-1 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-400 hover:text-blue-700"
          >
            Next <span className="hidden sm:inline">{itemLabel}</span>{" "}
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        )}
      </div>
    </nav>
  );
}
