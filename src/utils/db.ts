import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export interface User {
  id: string;
  username: string;
  email?: string;
  role: "ADMIN" | "CLIENT" | "PHARMACY";
  name?: string;
  passwordHash?: string;
  isVerified?: boolean;
}

export async function getUserFromDb(
  username: string,
  passwordHash: string
): Promise<User | null> {
  try {
    const user = await prisma.user.findFirst({
      where: {
        username: username,
        passwordHash: passwordHash,
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        isVerified: true,
      },
    });

    return user
      ? {
          ...user,
          name: `${user.firstName} ${user.lastName}`.trim(),
        }
      : null;
  } catch (error) {
    console.error("Database error:", error);
    return null;
  }
}

export async function getUserByUsername(
  username: string
): Promise<User | null> {
  try {
    const user = await prisma.user.findUnique({
      where: {
        username: username,
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        passwordHash: true,
        isVerified: true,
      },
    });

    return user
      ? {
          ...user,
          name: `${user.firstName} ${user.lastName}`.trim(),
        }
      : null;
  } catch (error) {
    console.error("Database error:", error);
    return null;
  }
}
