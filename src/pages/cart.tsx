import { CartError } from "@/components/CartError";
import { CartList } from "@/components/CartList";
import { ProductItem } from "@/components/ProductItem";
import { ProductList } from "@/components/ProductList";
import { getCartId } from "@/lib/cart.client";
import { useCreateCheckoutSessionMutation, useGetCartQuery } from "@/types";
import { GetServerSideProps, NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

interface CartPageProps {
  cartId: number;
}

const CartPage: NextPage<CartPageProps> = ({ cartId }) => {
  const { data } = useGetCartQuery({ variables: { id: cartId } });
  const router = useRouter();
  const [createCheckoutSession, { loading: isCreatingCheckoutSession, error }] =
    useCreateCheckoutSessionMutation({
      variables: { input: { cartId } },
      onCompleted: (data) => {
        if (data?.createCheckoutSession?.url) {
          router.push(data.createCheckoutSession?.url);
        }
      },
    });

  if (!data || !data?.cart) return <p>Loading</p>;

  return (
    <main className="min-h-screen p-8">
      <div className="space-y-8">
        <h1 className="text-4xl">Cart</h1>
        <CartError error={error} />
        <div className="grid w-full h-full grid-cols-3 p-8">
          <div className="relative col-span-2 space-y-8">
            <CartList cartId={cartId} />
          </div>
          <div className="flex flex-col gap-4 pt-4 my-4 border-t border-neutral-700">
            <div className="flex justify-between">
              <div>Subtotal</div>
              <div>{data.cart.subTotal.formatted}</div>
            </div>
            <div className="flex justify-between font-bold">
              <div>Total</div>
              <div className="">{data.cart.subTotal.formatted}</div>
            </div>
            <div>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  createCheckoutSession();
                }}
                disabled={isCreatingCheckoutSession}
                className="w-full p-1 font-light border border-neutral-700 hover:bg-black hover:text-white"
              >
                {isCreatingCheckoutSession
                  ? "Redirecting to Checkout"
                  : "Go to Checkout"}
              </button>
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
