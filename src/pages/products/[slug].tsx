import { ProductItem } from "@/components/ProductItem";
import { getItem } from "@/lib/products";
import { Item } from "@/types";
import {
  GetServerSideProps,
  InferGetServerSidePropsType,
  NextPage,
} from "next";
import Image from "next/image";

const ProductPage: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ product }) => {
  const { image, name, price } = product;
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
      <div className="p-8 space-y-4">
        <div className="flex flex-col gap-2">
          <div className="text-2xl font-semibold">{name}</div>
          <div className="text-sm border-b border-black w-fit">
            ${price} USD
          </div>
          <p className="text-lg">
            {product.description ?? "There's no description for this item"}
          </p>
        </div>
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
