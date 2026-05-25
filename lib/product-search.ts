export type SearchableProduct = {
  name: string;
  brand?: string | null;
  description?: string | null;
};

export function normalizeProductSearchTerm(search?: string) {
  return String(search || "")
    .trim()
    .replace(/[%,()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function buildProductSearchFilter(search: string) {
  const term = normalizeProductSearchTerm(search);
  const pattern = `%${term}%`;
  return ["name", "brand", "description"]
    .map((field) => `${field}.ilike.${pattern}`)
    .join(",");
}

export function matchesProductSearch(product: SearchableProduct, search?: string) {
  const term = normalizeProductSearchTerm(search).toLowerCase();
  if (!term) return true;

  return [product.name, product.brand, product.description]
    .filter(Boolean)
    .some((value) => value!.toLowerCase().includes(term));
}
