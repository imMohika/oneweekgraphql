import Link from "next/link";
import { ProductItem } from "./ProductItem";
import { Item } from "@/types";

export interface ProductListProps {
  products: Item[];
  small?: boolean;
}

export function ProductList({ products, small = false }: ProductListProps) {
  return (
    <ul className="grid grid-flow-row-dense grid-cols-2 gap-4 p-4 md:grid-cols-3">
      {products.map((product, index) => (
        <Link href={`/products/${product.slug}`} key={product.slug}>
          <ProductItem product={product} small={small} />
        </Link>
      ))}
    </ul>
  );
}
