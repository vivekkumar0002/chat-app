import prisma from "../config/prisma";
import { hashPassword, comparePassword } from "../utils/password";
import { signToken } from "../utils/jwt";
import { ApiError } from "../utils/ApiError";
import { SafeUser } from "../types";

function toSafeUser(user: {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  isOnline: boolean;
  lastSeen: Date;
  createdAt: Date;
}): SafeUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    isOnline: user.isOnline,
    lastSeen: user.lastSeen,
    createdAt: user.createdAt,
  };
}

export const authService = {
  async register(name: string, email: string, password: string) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw ApiError.conflict("An account with this email already exists");
    }

    const hashed = await hashPassword(password);

    const user = await prisma.user.create({
      data: { name, email, password: hashed },
    });

    const token = signToken({ userId: user.id, email: user.email });

    return { user: toSafeUser(user), token };
  },

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw ApiError.unauthorized("Invalid email or password");
    }

    const valid = await comparePassword(password, user.password);
    if (!valid) {
      throw ApiError.unauthorized("Invalid email or password");
    }

    // Mark online + update lastSeen on login
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { isOnline: true, lastSeen: new Date() },
    });

    const token = signToken({ userId: updated.id, email: updated.email });

    return { user: toSafeUser(updated), token };
  },

  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw ApiError.notFound("User not found");
    }
    return toSafeUser(user);
  },

  async logout(userId: string) {
    await prisma.user.update({
      where: { id: userId },
      data: { isOnline: false, lastSeen: new Date() },
    });
  },
};
