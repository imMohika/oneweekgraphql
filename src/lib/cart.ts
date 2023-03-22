import { PrismaClient } from "@prisma/client";

export const findOrCreateCart = async (
  prisma: PrismaClient,
  id: number,
  includeItems = false
) => {
  const cart = await prisma.cart.findUnique({
    where: { id },
    include: {
      items: includeItems,
    },
  });
  if (cart) return cart;

  return prisma.cart.create({
    data: {
      id,
    },
    include: {
      items: includeItems,
    },
  });
};
