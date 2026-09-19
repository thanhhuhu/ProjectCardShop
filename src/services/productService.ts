import { products } from "../data/products.ts";

export async function getProducts(page = 1, pageSize = 30) {
    const start = (page - 1) * pageSize;
    return { items: products.slice(start, start + pageSize), total: products.length };
}