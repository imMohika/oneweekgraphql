import { GraphQLYogaError } from "@graphql-yoga/node";
import data from "../../public/products.json";
import { Item } from "@/types";

export const products = new Map<number, Item>();

data
  .map((product) => ({
    name: product.title,
    price: product.price,
    image: product.image,
    slug: product.id,
    description: product.description,
  }))
  .forEach((product) => {
    products.set(product.slug, product);
  });

export const getItem = (slug: number) => {
  const item = products.get(slug);

  if (!item) {
    throw new GraphQLYogaError("Product not found");
  }

  return item;
};

export const getAllItems = () => {
  return Array.from(products.values());
};
