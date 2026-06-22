import prisma from "../config/prisma";
import { ApiError } from "../utils/ApiError";
import { SafeUser } from "../types";

const safeSelect = {
  id: true,
  name: true,
  email: true,
  avatar: true,
  isOnline: true,
  lastSeen: true,
  createdAt: true,
};

export const userService = {
  // Returns all users except the requester, optionally filtered by search term.
  async listUsers(currentUserId: string, search?: string): Promise<SafeUser[]> {
    const users = await prisma.user.findMany({
      where: {
        id: { not: currentUserId },
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      select: safeSelect,
      orderBy: { name: "asc" },
      take: 50,
    });

    return users;
  },

  async getUserById(id: string): Promise<SafeUser> {
    const user = await prisma.user.findUnique({ where: { id }, select: safeSelect });
    if (!user) throw ApiError.notFound("User not found");
    return user;
  },

  async updateProfile(userId: string, data: { name?: string; avatar?: string }) {
    const user = await prisma.user.update({
      where: { id: userId },
      data,
      select: safeSelect,
    });
    return user;
  },

  async setOnlineStatus(userId: string, isOnline: boolean) {
    return prisma.user.update({
      where: { id: userId },
      data: { isOnline, lastSeen: new Date() },
      select: safeSelect,
    });
  },
};
