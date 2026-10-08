import bcrypt from "bcrypt";
import { prisma } from "../db/prisma";
import { AppError } from "../utils/appError";
import { signToken } from "../utils/jwt";
import { loginSchema, registerSchema } from "../validators/auth.validator";
import { z } from "zod";

export class AuthService {
  static async register(data: z.infer<typeof registerSchema>) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new AppError(409, "Email is already in use");
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(data.password, salt);

    const user = await prisma.user.create({
      data: {
        fullName: data.fullName,
        email: data.email,
        passwordHash,
      },
    });

    const token = signToken({ sub: user.id });

    // Exclude passwordHash from the returned user object
    const { passwordHash: _, ...safeUser } = user;

    return { user: safeUser, token };
  }

  static async login(data: z.infer<typeof loginSchema>) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new AppError(401, "Invalid email or password");
    }

    const isMatch = await bcrypt.compare(data.password, user.passwordHash);

    if (!isMatch) {
      throw new AppError(401, "Invalid email or password");
    }

    const token = signToken({ sub: user.id });

    const { passwordHash: _, ...safeUser } = user;

    return { user: safeUser, token };
  }

  static async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError(404, "User not found");
    }

    const { passwordHash: _, ...safeUser } = user;
    return safeUser;
  }
}
