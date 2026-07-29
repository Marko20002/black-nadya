const KEY_BY_SLUG = {
  serums: 'products.categorySerums',
  creams: 'products.categoryCreams',
  oils: 'products.categoryOils',
};

/** Translates the fixed seed categories; falls back to the raw name for any custom category an owner adds later. */
export function categoryLabel(category, t) {
  if (!category) return '';
  const key = KEY_BY_SLUG[category.slug];
  return key ? t(key) : category.name;
}
