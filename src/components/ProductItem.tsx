import { HTMLProps } from "react";
import { Item } from "@/types";
import Image from "next/image";
import { products } from "../lib/products";

export interface ProductItemProps {
  product: Item;
}

export function ProductItem({
  product: { price, image, name },
}: ProductItemProps) {
  return (
    <div className="relative flex items-center justify-center w-full h-full p-4 group overflow-clip">
      <div className="absolute top-0 left-0 z-10 w-full">
        <div className="p-2 text-2xl font-semibold bg-gray-400">{name}</div>
        <div className="z-10 p-2 text-sm text-white bg-gray-400 border-t border-black w-fit">
          ${price} USD
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
    </div>
  );
}
