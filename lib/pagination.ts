export type PageSearchParams = Promise<{
  page?: string | string[];
}>;

export const parsePageNumber = (value: string | string[] | undefined) => {
  if (value === undefined) return 1;
  if (Array.isArray(value) || !/^[1-9]\d*$/.test(value)) return null;

  const page = Number(value);
  return Number.isSafeInteger(page) ? page : null;
};

export const paginatedUrl = (baseUrl: string, page: number) =>
  page === 1 ? baseUrl : `${baseUrl}?page=${page}`;
