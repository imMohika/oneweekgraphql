import { Resolvers } from "@/types";
import { GraphQLYogaError, createServer } from "@graphql-yoga/node";
import { readFileSync } from "fs";
import { join } from "path";
import { prisma } from "../../prisma";
import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { findOrCreateCart } from "@/lib/cart";
import { stripe } from "@/lib/stripe";
import { origin } from "@/lib/client";

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
    createCheckoutSession: async (_, { input }, { prisma }) => {
      const { cartId } = input;

      const cart = await prisma.cart.findUnique({
        where: {
          id: cartId,
        },
        include: {
          items: true,
        },
      });

      if (!cart) {
        throw new GraphQLYogaError("Cart not found");
      }

      if (!cart.items || cart.items.length === 0) {
        throw new GraphQLYogaError("Cart has no items");
      }

      const line_items = cart.items.map((item) => ({
        quantity: item.quantity,
        price_data: {
          currency: "USD",
          unit_amount: item.price,
          product_data: {
            name: item.name,
            description: item.description || undefined,
            images: item.image ? [item.image] : [],
          },
        },
      }));

      const session = await stripe.checkout.sessions.create({
        line_items,
        mode: "payment",
        metadata: {
          cartId,
        },
        success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/cart?cancelled=true`,
      });

      return {
        id: session.id,
        url: session.url,
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

