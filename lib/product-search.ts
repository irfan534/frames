export type SearchableProduct = {
  name: string;
  brand?: string | null;
  description?: string | null;
};

/** Normalizes a free-text product search query for filtering. */
export function normalizeProductSearchTerm(search?: string) {
  return String(search || "")
    .trim()
    .replace(/[%,()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Builds the Supabase OR filter used for product text search. */
export function buildProductSearchFilter(search: string) {
  const term = normalizeProductSearchTerm(search);
  const pattern = `%${term}%`;
  return ["name", "brand", "description"]
    .map((field) => `${field}.ilike.${pattern}`)
    .join(",");
}

/** Checks whether a product matches a normalized text search query. */
export function matchesProductSearch(product: SearchableProduct, search?: string) {
  const term = normalizeProductSearchTerm(search).toLowerCase();
  if (!term) return true;

  return [product.name, product.brand, product.description]
    .filter(Boolean)
    .some((value) => value!.toLowerCase().includes(term));
}
