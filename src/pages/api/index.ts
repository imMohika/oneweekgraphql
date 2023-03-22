import { Resolvers } from "@/types";
import { createServer } from "@graphql-yoga/node";
import { readFileSync } from "fs";
import { join } from "path";
import { prisma } from "../../prisma";
import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { findOrCreateCart } from "@/lib/cart";

const priceFormatter = Intl.NumberFormat("us", {
  currency: "USD",
});

const typeDefs = readFileSync(join(process.cwd(), "src/schema.graphql"), {
  encoding: "utf-8",
});

export type GraphQLContext = {
  prisma: PrismaClient;
};

export async function createContext(): Promise<GraphQLContext> {
  return {
    prisma,
  };
}

const resolvers: Resolvers = {
  Query: {
    cart: async (_, { id }, { prisma }) => findOrCreateCart(prisma, id),
  },
  Cart: {
    items: async ({ id }, _, { prisma }) => {
      return prisma.cart
        .findUnique({
          where: {
            id,
          },
        })
        .items();
    },

    total: async ({ id }, _, { prisma }) => {
      const items = await prisma.cart
        .findUnique({
          where: {
            id,
          },
        })
        .items();
      if (!items) return 0;

      return items.reduce((total, item) => total + item.quantity || 1, 0);
    },
    subTotal: async ({ id }, _, { prisma }) => {
      const items = await prisma.cart
        .findUnique({
          where: {
            id,
          },
        })
        .items();
      if (!items)
        return {
          amount: 0,
          formatted: "0$",
        };

      const amount = items?.reduce((total, item) => total + item.price, 0);

      return {
        amount,
        formatted: priceFormatter.format(amount),
      };
    },
  },
  CartItem: {
    unitTotal: (item) => {
      return {
        amount: item.price,
        formatted: priceFormatter.format(item.price),
      };
    },
    lineTotal: (item) => {
      const price = item.price * item.quantity;

      return {
        amount: price,
        formatted: priceFormatter.format(price),
      };
    },
  },
  Mutation: {
    addItem: async (_, { input }, { prisma }) => {
      const cart = await findOrCreateCart(prisma, input.cartId);

      await prisma.cartItem.upsert({
        where: {
          name_cartId: {
            name: input.name,
            cartId: cart.id,
          },
        },
        create: {
          cartId: cart.id,
          name: input.name,
          description: input.description,
          image: input.image,
          price: input.price,
          quantity: input.quantity || 1,
        },
        update: {
          quantity: {
            increment: input.quantity || 1,
          },
        },
      });

      return cart;
    },
    removeItem: async (_, { input }, { prisma }) => {
      const { name, cartId, quantity } = input;

      if (!quantity) {
        await prisma.cartItem.delete({
          where: {
            name_cartId: {
              name,
              cartId,
            },
          },
        });
      } else {
        await prisma.cartItem.update({
          where: {
            name_cartId: {
              name,
              cartId,
            },
          },
          data: {
            quantity: {
              decrement: quantity,
            },
          },
        });
      }

      return findOrCreateCart(prisma, cartId);
    },
  },
};

const server = createServer<{
  req: NextApiRequest;
  res: NextApiResponse;
}>({
  endpoint: "/api",
  schema: {
    typeDefs,
    resolvers,
  },
  context: createContext(),
});

export default server;

