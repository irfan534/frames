import { unstable_noStore as noStore } from "next/cache";
import type { Frame, OrderWithItems, Sale, ShopPhoto } from "@/lib/types";
import { productPageSize } from "@/lib/constants";
import { sampleFrames, sampleOrders, sampleSales } from "@/lib/sample-data";
import {
  createSupabasePublicClient,
  createSupabaseServerClient,
  isSupabaseConfigured
} from "@/lib/supabase/server";
import { buildProductSearchFilter, matchesProductSearch } from "@/lib/product-search";

const frameColumns =
  "id,frame_code,name,brand,category,description,price,quantity,image_url,image_urls,colors,offer_type,offer_label,offer_description,is_active,created_at,updated_at";
const frameColumnsWithoutOffers =
  "id,frame_code,name,brand,category,description,price,quantity,image_url,image_urls,colors,is_active,created_at,updated_at";
const legacyFrameColumns =
  "id,frame_code,name,brand,category,description,price,quantity,image_url,is_active,created_at,updated_at";

export type ProductQuery = {
  page?: number;
  category?: string;
  brand?: string;
  color?: string;
  min?: number;
  max?: number;
  sort?: string;
  search?: string;
  limit?: number;
};

export async function getProducts(query: ProductQuery = {}) {
  const page = Math.max(query.page || 1, 1);
  const limit = query.limit || productPageSize;

  if (!isSupabaseConfigured()) {
    let rows = [...sampleFrames].filter((frame) => frame.is_active);
    rows = filterSampleRows(rows, query);
    rows = sortSampleRows(rows, query.sort);
    const count = rows.length;
    return {
      products: rows.slice((page - 1) * limit, page * limit),
      count,
      page,
      pageCount: Math.max(Math.ceil(count / limit), 1),
      unavailable: false
    };
  }

  const supabase = createSupabasePublicClient();
  if (!supabase) {
    return { products: [], count: 0, page, pageCount: 1, unavailable: true };
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;
  const buildRequest = (columns: string) => {
    let request = supabase
      .from("frames")
      .select(columns, { count: "exact" })
      .eq("is_active", true);

    if (query.category) request = request.eq("category", query.category);
    if (query.brand) request = request.eq("brand", query.brand);
    if (query.color) request = request.contains("colors", [query.color]);
    if (query.min) request = request.gte("price", query.min);
    if (query.max) request = request.lte("price", query.max);
    if (query.search) request = request.or(buildProductSearchFilter(query.search));

    if (query.sort === "price-asc") request = request.order("price", { ascending: true });
    else if (query.sort === "price-desc") request = request.order("price", { ascending: false });
    else if (query.sort === "new") request = request.order("created_at", { ascending: false });
    else request = request.order("quantity", { ascending: false });

    return request;
  };

  let { data, count, error } = await buildRequest(frameColumns).range(from, to);
  if (isMissingOfferColumn(error)) {
    ({ data, count, error } = await buildRequest(frameColumnsWithoutOffers).range(from, to));
  }
  if (isMissingImageColorColumn(error)) {
    ({ data, count, error } = await buildRequest(legacyFrameColumns).range(from, to));
  }
  if (error) {
    logDataWarning("products", error);
    return { products: [], count: 0, page, pageCount: 1, unavailable: true };
  }

  const total = count || 0;
  return {
    products: (data || []) as unknown as Frame[],
    count: total,
    page,
    pageCount: Math.max(Math.ceil(total / limit), 1),
    unavailable: false
  };
}

export async function getProduct(id: string) {
  if (!isSupabaseConfigured()) {
    return sampleFrames.find((frame) => frame.id === id || frame.frame_code === id) || null;
  }

  const supabase = createSupabasePublicClient();
  if (!supabase) return null;

  const productResult = await supabase
    .from("frames")
    .select(frameColumns)
    .eq("id", id)
    .eq("is_active", true)
    .maybeSingle();
  let data: unknown = productResult.data;
  let error: { message?: string } | null = productResult.error;

  if (isMissingOptionalFrameColumn(error)) {
    const columns = isMissingOfferColumn(error)
      ? frameColumnsWithoutOffers
      : legacyFrameColumns;
    const legacyProductResult = await supabase
      .from("frames")
      .select(columns)
      .eq("id", id)
      .eq("is_active", true)
      .maybeSingle();
    data = legacyProductResult.data;
    error = legacyProductResult.error;

    if (isMissingImageColorColumn(error)) {
      const oldestProductResult = await supabase
        .from("frames")
        .select(legacyFrameColumns)
        .eq("id", id)
        .eq("is_active", true)
        .maybeSingle();
      data = oldestProductResult.data;
      error = oldestProductResult.error;
    }
  }

  if (error) {
    logDataWarning("product", error);
    return null;
  }

  return data as Frame | null;
}

export async function getAdminFrames() {
  noStore();

  if (!isSupabaseConfigured()) return sampleFrames;

  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  const framesResult = await supabase
    .from("frames")
    .select(frameColumns)
    .order("created_at", { ascending: false });
  let data: unknown = framesResult.data;
  let error: { message?: string } | null = framesResult.error;

  if (isMissingOptionalFrameColumn(error)) {
    const columns = isMissingOfferColumn(error)
      ? frameColumnsWithoutOffers
      : legacyFrameColumns;
    const legacyFramesResult = await supabase
      .from("frames")
      .select(columns)
      .order("created_at", { ascending: false });
    data = legacyFramesResult.data;
    error = legacyFramesResult.error;

    if (isMissingImageColorColumn(error)) {
      const oldestFramesResult = await supabase
        .from("frames")
        .select(legacyFrameColumns)
        .order("created_at", { ascending: false });
      data = oldestFramesResult.data;
      error = oldestFramesResult.error;
    }
  }

  if (error) {
    logDataWarning("admin frames", error);
    return [];
  }

  return (data || []) as Frame[];
}

export async function getAdminOrders(status?: string) {
  noStore();

  if (!isSupabaseConfigured()) return sampleOrders;

  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  let request = supabase
    .from("orders")
    .select(
      "id,customer_name,phone,address,notes,total_amount,payment_status,order_status,created_at,order_items(id,order_id,frame_id,qty,price,frames(id,name,brand,frame_code,image_url))"
    )
    .order("created_at", { ascending: false });

  if (status && status !== "all") request = request.eq("payment_status", status);

  const { data, error } = await request;
  if (error) {
    logDataWarning("admin orders", error);
    return [];
  }

  return (data || []) as unknown as OrderWithItems[];
}

export async function getAdminSales() {
  noStore();

  if (!isSupabaseConfigured()) return sampleSales;

  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("sales")
    .select("id,frame_id,qty,amount,payment_method,sold_at,frames(name,brand,frame_code)")
    .order("sold_at", { ascending: false });

  if (error) {
    logDataWarning("admin sales", error);
    return [];
  }

  return (data || []) as unknown as Sale[];
}

export async function getShopPhotos() {
  if (!isSupabaseConfigured()) return [];

  const supabase = createSupabasePublicClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("shop_photos")
    .select("id,image_url,display_order,created_at")
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    logDataWarning("shop photos", error);
    return [];
  }

  return (data || []) as ShopPhoto[];
}

export async function getAdminShopPhotos() {
  noStore();
  return getShopPhotos();
}

function filterSampleRows(rows: Frame[], query: ProductQuery) {
  return rows.filter((frame) => {
    if (query.category && frame.category !== query.category) return false;
    if (query.brand && frame.brand !== query.brand) return false;
    if (query.color && !frame.colors?.includes(query.color)) return false;
    if (query.min && Number(frame.price) < query.min) return false;
    if (query.max && Number(frame.price) > query.max) return false;
    if (query.search && !matchesProductSearch(frame, query.search)) {
      return false;
    }
    return true;
  });
}

function sortSampleRows(rows: Frame[], sort?: string) {
  if (sort === "price-asc") return rows.sort((a, b) => Number(a.price) - Number(b.price));
  if (sort === "price-desc") return rows.sort((a, b) => Number(b.price) - Number(a.price));
  if (sort === "new") return rows.sort((a, b) => b.created_at.localeCompare(a.created_at));
  return rows.sort((a, b) => b.quantity - a.quantity);
}

function isMissingOptionalFrameColumn(error: { message?: string } | null) {
  return isMissingImageColorColumn(error) || isMissingOfferColumn(error);
}

function isMissingImageColorColumn(error: { message?: string } | null) {
  return Boolean(
    error?.message?.includes("image_urls") ||
    error?.message?.includes("colors")
  );
}

function isMissingOfferColumn(error: { message?: string } | null) {
  return Boolean(
    error?.message?.includes("offer_type") ||
    error?.message?.includes("offer_label") ||
    error?.message?.includes("offer_description")
  );
}

function logDataWarning(resource: string, error: { message?: string }) {
  console.warn(`[data] Unable to load ${resource}: ${error.message || "Unknown Supabase error"}`);
}
