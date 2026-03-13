import { SORT_ORDER } from '../constants/index.js';

const parseSortOrder = (sortOrder) => {
  // check if sortOrder is in [SORT_ORDER.ASC, SORT_ORDER.DESC]
  const isOrder = [SORT_ORDER.ASC, SORT_ORDER.DESC].includes(sortOrder);

  // if yes → return sortOrder
  if (isOrder) return sortOrder;

  // if no  → return SORT_ORDER.ASC
  return SORT_ORDER.ASC;
};

const parseSortBy = (sortBy) => {
  // define the contact fields array
  const contactFields = [
    '_id',
    'name',
    'email',
    'phoneNumber',
    'contactType',
    'isFavourite',
    'createdAt',
    'updatedAt',
  ];

  // if sortBy is in the array → return sortBy
  if (contactFields.includes(sortBy)) return sortBy;

  // if not → return '_id'
  return '_id';
};

export const parseSortParams = (query) => {
  const { sortOrder, sortBy } = query;

  const parsedSortOrder = parseSortOrder(sortOrder);
  const parsedSortBy = parseSortBy(sortBy);

  return {
    sortOrder: parsedSortOrder,
    sortBy: parsedSortBy,
  };
};
