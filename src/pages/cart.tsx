import { ProductItem } from "@/components/ProductItem";
import { ProductList } from "@/components/ProductList";
import { getCartId } from "@/lib/cart.client";
import { useGetCartQuery } from "@/types";
import { GetServerSideProps, NextPage } from "next";
import { useEffect, useState } from "react";

interface CartPageProps {
  cartId: number;
}

const CartPage: NextPage<CartPageProps> = ({ cartId }) => {
  const { data } = useGetCartQuery({ variables: { id: cartId } });

  if (!data || !data?.cart) return <p>Loading</p>;

  return (
    <main className="min-h-screen p-8">
      <div className="space-y-8">
        <h1 className="text-4xl">Cart</h1>
        <div className="grid w-full h-full grid-cols-3 p-8">
          <div className="relative col-span-2 space-y-8">
            {data.cart.items ? (
              <ProductList
                small
                products={data.cart.items.map((t) => t.item)}
              />
            ) : (
              <p>Your cart is empty</p>
            )}
          </div>
          <div className="pt-4 my-4 border-t border-neutral-700">
            <div className="flex justify-between">
              <div>Subtotal</div>
              <div>{data.cart.subTotal.formatted}</div>
            </div>
            <div className="flex justify-between font-bold">
              <div>Total</div>
              <div className="">{data.cart.subTotal.formatted}</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default CartPage;

export const getServerSideProps: GetServerSideProps<CartPageProps> = async ({
  req,
  res,
}) => {
  const cartId = await getCartId(req, res);

  return {
    props: {
      cartId,
    },
  };
};
