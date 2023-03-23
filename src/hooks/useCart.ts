import { getCookie } from "cookies-next";
import { useGetCartQuery } from "../types";

export function useCart() {
  const cartId = Number(getCookie("cart_id"));
  const { data } = useGetCartQuery({ variables: { id: cartId } });
  console.log({ cartId });
  return {
    cartId,
    cart: data?.cart,
  };
}
