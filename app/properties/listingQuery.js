// Helpers for the /properties listing: detect an active query and keep
// "Novinka" cards from sitting above the filtered results.

export const isListingQueryActive = ({
  search = '',
  propertyType = '',
  region = '',
  rooms = '',
  priceFrom = '',
  priceTo = '',
  amenities = [],
  sortBy = 'newest',
} = {}) => Boolean(
  String(search).trim()
  || propertyType
  || region
  || rooms
  || priceFrom
  || priceTo
  || (Array.isArray(amenities) && amenities.length > 0)
  || (sortBy && sortBy !== 'newest')
);

// Keep relative order, but put new listings after the other results.
export const moveNewListingsLast = (properties = []) => {
  const regular = [];
  const novinky = [];
  for (const property of properties) {
    if (property?.isNew) novinky.push(property);
    else regular.push(property);
  }
  return [...regular, ...novinky];
};
