import { Resolvers } from "@/types";
import { createServer } from "@graphql-yoga/node";
import { readFileSync } from "fs";
import { join } from "path";
import { prisma } from "../../prisma";
import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

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
    cart: async (_, { id }, { prisma }) => {
      const cart = await prisma.cart.findUnique({ where: { id } });
      if (cart) return cart;

      return prisma.cart.create({
        data: {
          id,
        },
      });
    },
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

