import "server-only";

import { paypalRequest } from "@/lib/paypal/client";
import type { LocalPayPalPackage, PayPalProduct, PayPalProductList } from "@/lib/paypal/types";

export function getPayPalProductName(pkg: LocalPayPalPackage) {
  return `OMAZYNC ${pkg.name.replace(/\s+Monthly$/i, "").trim()}`;
}

export async function listPayPalProducts() {
  const all: PayPalProduct[] = [];
  for (let page = 1; page <= 10; page += 1) {
    const response = await paypalRequest<PayPalProductList>(
      `/v1/catalogs/products?page_size=20&page=${page}&total_required=true`,
    );
    all.push(...(response.products ?? []));
    if ((response.products ?? []).length < 20) break;
  }
  return all;
}

export async function readPayPalProduct(productId: string) {
  return paypalRequest<PayPalProduct>(`/v1/catalogs/products/${encodeURIComponent(productId)}`);
}

export async function createPayPalProduct(pkg: LocalPayPalPackage) {
  return paypalRequest<PayPalProduct>("/v1/catalogs/products", {
    method: "POST",
    body: JSON.stringify({
      name: getPayPalProductName(pkg),
      description: `${pkg.code}: ${pkg.description}`,
      type: "SERVICE",
      category: "SOFTWARE",
    }),
  });
}

export function findMatchingProduct(products: PayPalProduct[], pkg: LocalPayPalPackage) {
  const code = pkg.code ?? "";
  const name = getPayPalProductName(pkg);
  return products.find(
    (product) =>
      product.name === name ||
      product.description?.includes(code) ||
      product.description?.includes(pkg.slug),
  );
}
