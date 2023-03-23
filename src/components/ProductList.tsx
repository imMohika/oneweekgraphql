import Link from "next/link";
import { ProductItem } from "./ProductItem";
import { Item } from "@/types";

export function ProductList({ products }: { products: Item[] }) {
  return (
    <ul className="grid grid-flow-row-dense grid-cols-1 gap-4 p-4 md:grid-cols-2">
      {products.map((product, index) => (
        <Link
          href={`/products/${product.slug}`}
          key={product.slug}
          className="h-[500px]"
        >
          <ProductItem product={product} />
        </Link>
      ))}
    </ul>
  );
}
