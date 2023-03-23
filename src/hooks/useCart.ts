import { getCookie } from "cookies-next";
import { useGetCartQuery } from "../types";

export function useCart() {
  const cartId = Number(getCookie("cartId"));
  const { data } = useGetCartQuery({ variables: { id: cartId } });
  return data?.cart;
}
