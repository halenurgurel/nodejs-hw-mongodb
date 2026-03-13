export const parsePaginationParams = (query) => {
  const page = Number(query.page) || 1;
  const perPage = Number(query.perPage) || 10;

  return { page, perPage };
};
