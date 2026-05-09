export const usePagination = function(pagination = {}) {
  let where = '';

  let sorting = '';
  if(pagination.sorting != null && typeof(pagination.sorting.column) === 'string') {
    direction = pagination.sorting.direction || 'asc';
    sorting = `order by ${ pagination.sorting.column } ${ direction }`;
  }

//page, limit, search, sorting
  let limit = '';
  if(typeof(pagination.limit) === 'number' && typeof(pagination.page) === 'number') {
    limit = `limit ${ pagination.limit } offset ${ pagination.page * pagination.limit }`;
  }

  return {
    where,
    sorting,
    limit
  };
};
