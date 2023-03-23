import { ProductItem } from "@/components/ProductItem";
import { getItem } from "@/lib/products";
import { GetCartDocument, Item, useAddToCartMutation } from "@/types";
import {
  GetServerSideProps,
  InferGetServerSidePropsType,
  NextPage,
} from "next";
import Image from "next/image";
import { useCart } from "@/hooks/useCart";
import { ReactEventHandler } from "react";

const ProductPage: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ product }) => {
  const { image, name, price } = product;
  const [addToCart, { loading }] = useAddToCartMutation({
    refetchQueries: [GetCartDocument],
  });
  const { cartId } = useCart();

  const addItemToCart = () => {
    addToCart({
      variables: {
        input: {
          cartId,
          slug: product.slug,
        },
      },
    });
  };

  return (
    <main className="grid h-full grid-cols-3 p-8">
      <div className="relative flex items-center justify-center col-span-2 group">
        {image && (
          <Image
            className="object-contain w-full h-full transition duration-500 transform motion-safe:group-focus:scale-110 motion-safe:group-hover:scale-110"
            src={image}
            alt={name}
            fill
          />
        )}
      </div>
      <div className="flex flex-col gap-6 p-8 space-y-4">
        <div className="flex flex-col gap-2">
          <div className="text-2xl font-semibold">{name}</div>
          <div className="text-sm border-b border-black w-fit">
            ${price} USD
          </div>
          <p className="text-lg">
            {product.description ?? "There's no description for this item"}
          </p>
        </div>
        <button
          className="w-full px-6 py-4 text-white uppercase transition-all bg-black border border-black hover:bg-white hover:text-black"
          type="submit"
          onClick={(e) => addItemToCart(e)}
        >
          {loading ? "Adding to cart..." : "Add to cart"}
        </button>
      </div>
    </main>
  );
};

export const getServerSideProps: GetServerSideProps<{
  product: Item;
}> = async ({ req, res, query }) => {
  const product = getItem(Number(query.slug as string));
  return { props: { product } };
};

export default ProductPage;
