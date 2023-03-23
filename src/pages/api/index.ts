import { Resolvers } from "@/types";
import { GraphQLYogaError, createServer } from "@graphql-yoga/node";
import { readFileSync } from "fs";
import { join } from "path";
import { prisma } from "../../prisma";
import type { NextApiRequest, NextApiResponse } from "next";
import { Prisma, PrismaClient } from "@prisma/client";
import { findCart } from "@/lib/cart.server";
import { stripe } from "@/lib/stripe";
import { origin } from "@/lib/client";
import { getAllItems, getItem, products } from "@/lib/products";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime";

const priceFormatter = Intl.NumberFormat("us", {
  currency: "USD",
});

const typeDefs = readFileSync(join(process.cwd(), "src/schema.graphql"), {
  encoding: "utf-8",
});

export type GraphQLContext = {};

export async function createContext(): Promise<GraphQLContext> {
  return {};
}

const resolvers: Resolvers = {
  Query: {
    cart: async (_, { id }) => findCart(id),
    item: async (_, { slug }) => {
      return getItem(slug);
    },
    items: async (_) => {
      return getAllItems();
    },
  },
  Cart: {
    items: async ({ id }, _) => {
      return prisma.cart
        .findUnique({
          where: {
            id,
          },
        })
        .items();
    },

    total: async ({ id }, _) => {
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
    subTotal: async ({ id }, _) => {
      const items = await prisma.cart
        .findUnique({
          where: {
            id,
          },
        })
        .items();
      if (!items) {
        return {
          amount: 0,
          formatted: "0$",
        };
      }

      const amount = items
        .map((item) => ({ ...item, ...getItem(item.slug) }))
        .reduce((total, item) => total + item.quantity || 1, 0);

      return {
        amount,
        formatted: priceFormatter.format(amount),
      };
    },
  },
  CartItem: {
    item: ({ slug }) => {
      return getItem(slug);
    },
    unitTotal: ({ slug }) => {
      const item = getItem(slug);
      return {
        amount: item.price,
        formatted: priceFormatter.format(item.price),
      };
    },

    lineTotal: ({ slug, quantity }) => {
      const item = getItem(slug);
      const price = item.price * quantity;

      return {
        amount: price,
        formatted: priceFormatter.format(price),
      };
    },
  },
  Mutation: {
    addItem: async (_, { input }) => {
      const cart = await findCart(input.cartId);
      const item = getItem(input.slug);

      await prisma.cartItem.upsert({
        where: {
          slug_cartId: {
            slug: item.slug,
            cartId: cart.id,
          },
        },
        create: {
          cartId: cart.id,
          slug: item.slug,
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

    removeItem: async (_, { input }) => {
      const { slug, cartId, quantity } = input;
      console.log({
        message: "deleting item from cart",
        slug,
        cartId,
        quantity: quantity ? quantity : "all",
      });
      try {
        if (!quantity) {
          const result = await prisma.cartItem.delete({
            where: {
              slug_cartId: {
                slug,
                cartId,
              },
            },
          });
          console.log({ result });
        } else {
          await prisma.cartItem.update({
            where: {
              slug_cartId: {
                slug,
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
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          const { code } = error;
          if (code === "P2025") {
            throw new GraphQLYogaError("Cart item does not exist");
          }

          console.error({
            message:
              "An unhandled prisma error occurred while deleting cart item",
            code: code,
          });
          throw new GraphQLYogaError(error.message);
        }

        console.error({
          message: "an error occurred while deleting item from cart",
          error,
          input: {
            slug,
            cartId,
            quantity,
          },
        });
      }

      return findCart(cartId);
    },
    createCheckoutSession: async (_, { input }) => {
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

      const line_items = cart.items
        .map((item) => ({ ...item, ...getItem(item.slug) }))
        .map((item) => ({
          quantity: item.quantity,
          price_data: {
            currency: "USD",
            unit_amount: item.price * 100,
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

