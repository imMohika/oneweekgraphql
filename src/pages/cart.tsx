import { useClient } from "@/hooks/useClient";
import { getCartId } from "@/lib/cart.client";
import { apolloClient } from "@/lib/client";
import prisma from "@/prisma";
import { useGetCartQuery } from "@/types";
import { GetServerSideProps, NextPage } from "next";

interface CartPageProps {
  cartId: number;
}

const CartPage: NextPage<CartPageProps> = ({ cartId }) => {
  const { data } = useGetCartQuery({ variables: { id: cartId } });

  if (!data) return <p>Loading</p>;

  console.log({ data });

  return (
    <div className="min-h-screen flex flex-col">
      <main className="p-8 min-h-screen">
        <div className="mx-auto max-w-xl space-y-8">
          <h1 className="text-4xl">Cart</h1>
          <div>Items: {data?.cart?.total}</div>
          <div className="border-t pt-4 flex justify-between">
            <div>Subtotal</div>
            <div>{data?.cart?.subTotal.formatted}</div>
          </div>
        </div>
      </main>
    </div>
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
