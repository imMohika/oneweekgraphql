import Link from "next/link";
import { useGetCartQuery } from "@/types";
import { CartItem } from "./CartItem";

export interface CartListProps {
  cartId: number;
}

export function CartList({ cartId }: CartListProps) {
  const { data } = useGetCartQuery({ variables: { id: cartId } });
  if (!data || !data?.cart) return <p>Loading</p>;

  return (
    <ul className="grid grid-flow-row-dense grid-cols-2 gap-4 p-4 md:grid-cols-3">
      {data.cart.items ? (
        data.cart.items
          .map((t) => t.item)
          .map((product, index) => (
            <CartItem product={product} cartId={cartId} />
          ))
      ) : (
        <p>Your cart is empty</p>
      )}
    </ul>
  );
}
