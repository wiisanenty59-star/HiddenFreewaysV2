import { User } from "@workspace/db";

declare global {
  namespace Express {
    interface Request {
      user?: User;
      session: {
        userId?: number;
        destroy: (cb: (err?: any) => void) => void;
      };
    }
  }
}

export {};
