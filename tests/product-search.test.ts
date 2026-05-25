import assert from "node:assert/strict";
import {
  buildProductSearchFilter,
  matchesProductSearch,
  normalizeProductSearchTerm
} from "../lib/product-search";
import { test } from "./test-helpers";

const product = {
  name: "ScreenEase Round",
  brand: "Nova",
  description: "Blue-light filtering frame designed for long screen hours."
};

test("product search matches name, brand, and description", () => {
  assert.equal(matchesProductSearch(product, "screenease"), true);
  assert.equal(matchesProductSearch(product, "nova"), true);
  assert.equal(matchesProductSearch(product, "blue-light"), true);
  assert.equal(matchesProductSearch(product, "aviator"), false);
});

test("product search filter targets all searchable text columns", () => {
  assert.equal(
    buildProductSearchFilter("Ray Ban"),
    "name.ilike.%Ray Ban%,brand.ilike.%Ray Ban%,description.ilike.%Ray Ban%"
  );
});

test("product search term removes PostgREST OR separator characters", () => {
  assert.equal(normalizeProductSearchTerm("Ray,Ban (blue)%"), "Ray Ban blue");
});
