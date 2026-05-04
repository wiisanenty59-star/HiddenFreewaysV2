import { type Request, type Response, type NextFunction } from "express";
import { db, usersTable, type User } from "@workspace/db";
import { eq } from "drizzle-orm";

declare module "express-session" {
  interface SessionData {
    userId?: number;
  }
}

export type AuthedRequest = Request & {
  user?: User;
};

/**
 * Loads user from session if it exists.
 * IMPORTANT: NEVER creates a fallback user.
 */
export async function loadUser(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.session?.userId;

    // No session → no user (IMPORTANT)
    if (typeof userId !== "number") {
      (req as AuthedRequest).user = undefined;
      next();
      return;
    }

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);

    // user not found or banned → treat as logged out
    if (!user || user.isBanned) {
      (req as AuthedRequest).user = undefined;
      next();
      return;
    }

    (req as AuthedRequest).user = user;
    next();
  } catch (err) {
    // Fail safe: NEVER crash auth pipeline
    console.error("loadUser error:", err);
    (req as AuthedRequest).user = undefined;
    next();
  }
}

/**
 * Requires authenticated session user
 */
export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const user = (req as AuthedRequest).user;

  if (!user) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  next();
}

/**
 * Requires admin role
 */
export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const user = (req as AuthedRequest).user;

  if (!user) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  if (user.role !== "admin") {
    res.status(403).json({ error: "Admin access required" });
    return;
  }

  next();
}

/**
 * Safe serializer for frontend
 */
export function serializeUser(user: User) {
  return {
    id: user.id,
    username: user.username,
    role: user.role,
    avatarUrl: user.avatarUrl ?? null,
    createdAt: user.createdAt,
  };
}
