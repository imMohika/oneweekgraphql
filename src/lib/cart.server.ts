import prisma from "@/prisma";
import { GraphQLYogaError } from "@graphql-yoga/node";
import { PrismaClient } from "@prisma/client";

export const findCart = async (id: number, includeItems = false) => {
  const cart = await prisma.cart.findUnique({
    where: { id },
    include: {
      items: includeItems,
    },
  });
  if (!cart) {
    throw new GraphQLYogaError("Cart not found");
  }

  return cart;
};

export const createCart = async () => {
  return prisma.cart.create({
    data: {},
  });
};
