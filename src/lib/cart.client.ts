import { NextApiRequest, NextApiResponse } from "next";
import { getCookie, setCookies } from "cookies-next";
import { nanoid } from "nanoid";
import { IncomingMessage, ServerResponse } from "http";
import { createCart, findCart } from "./cart.server";
import { PrismaClient } from "@prisma/client";

export const getCartId = async (
  req: IncomingMessage & { cookies: Partial<{ [key: string]: string }> },
  res: ServerResponse<IncomingMessage>
) => {
  const savedId = getCookie("cart_id", { req, res });
  console.log({ savedId });
  let cartId: number;

  if (savedId && !Number.isNaN(savedId)) {
    cartId = Number(savedId);
  } else {
    const cart = await createCart();
    cartId = cart.id;
    setCookies("cart_id", cartId, { req, res });
  }

  return cartId;
};
