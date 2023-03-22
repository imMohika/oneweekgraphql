import { PrismaClient } from "@prisma/client";

export const findOrCreateCart = async (prisma: PrismaClient, id: number) => {
  const cart = await prisma.cart.findUnique({ where: { id } });
  if (cart) return cart;

  return prisma.cart.create({
    data: {
      id,
    },
  });
};
