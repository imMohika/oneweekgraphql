import { GetCartDocument, Item, useRemoveFromCartMutation } from "@/types";
import Image from "next/image";
import Link from "next/link";

export interface CartItemProps {
  product: Item;
  cartId: number;
  readonly?: boolean;
}

export function CartItem({
  product: { price, slug, image, name },
  cartId,
  readonly = false,
}: CartItemProps) {
  const [removeFromCart, { loading: removingFromCart }] =
    useRemoveFromCartMutation({
      refetchQueries: [GetCartDocument],
    });
  return (
    <div className="relative flex items-center flex-col justify-center w-full h-full min-h-[400px] p-4 group overflow-clip">
      <div className="absolute top-0 left-0 z-10 w-full">
        <div className={`p-2 text-lg font-semibold bg-gray-400`}>{name}</div>
        <div className="z-10 p-2 text-sm text-white bg-gray-400 border-t border-black w-fit">
          ${price}
        </div>
      </div>
      {image && (
        <Image
          className="object-contain w-full h-full transition duration-500 transform motion-safe:group-focus:scale-110 motion-safe:group-hover:scale-110"
          src={image}
          alt={name}
          fill
        />
      )}
      <div className="absolute bottom-0 left-0 z-10 flex w-full gap-2">
        {!readonly && (
          <button
            onClick={() =>
              removeFromCart({
                variables: { input: { slug, cartId } },
              })
            }
            disabled={removingFromCart}
            className="p-1 font-light border border-neutral-700 hover:bg-black hover:text-white"
          >
            Remove
          </button>
        )}
        <Link href={`/products/${slug}`}>
          <button
            disabled={removingFromCart}
            className="p-1 font-light border border-neutral-700 hover:bg-black hover:text-white"
          >
            Details
          </button>
        </Link>
      </div>
    </div>
  );
}
