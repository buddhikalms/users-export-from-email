import bcrypt from "bcryptjs";

import { db } from "@/lib/db";

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, passwordHash: string) {
  return bcrypt.compare(password, passwordHash);
}

export async function getNextUserRole() {
  const userCount = await db.user.count();
  return userCount === 0 ? "ADMIN" : "USER";
}
