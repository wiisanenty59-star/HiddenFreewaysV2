import "dotenv/config";
import express, { type Express } from "express";
import cors from "cors";
import session from "express-session";
import connectPgSimpleFactory from "connect-pg-simple";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";
import { loadUser } from "./lib/auth";
import { pool } from "@workspace/db";

// -----------------------------
// SESSION TABLE BOOTSTRAP
// -----------------------------
void (async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "sessions_pg" (
        "sid" varchar NOT NULL PRIMARY KEY,
        "sess" json NOT NULL,
        "expire" timestamp(6) NOT NULL
      );
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS "IDX_sessions_pg_expire"
      ON "sessions_pg" ("expire");
    `);
  } catch (err) {
    logger.error({ err }, "Failed to ensure sessions_pg table");
  }
})();

const app: Express = express();

app.set("trust proxy", 1);

// -----------------------------
// LOGGING
// -----------------------------
app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  })
);

// -----------------------------
// CORE MIDDLEWARE
// -----------------------------
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// -----------------------------
// ENV SAFETY (SO SERVER DOESN'T HARD CRASH)
// -----------------------------
const sessionSecret = process.env.SESSION_SECRET;
const databaseUrl = process.env.DATABASE_URL;
const port = process.env.PORT ?? "3000";

// fallback safety instead of crashing entire app
if (!sessionSecret) {
  logger.warn("SESSION_SECRET missing — using unsafe fallback (DEV ONLY)");
}

if (!databaseUrl) {
  logger.warn("DATABASE_URL missing — DB features will fail");
}

// -----------------------------
// SESSION STORE
// -----------------------------
const PgSession = connectPgSimpleFactory(session);

app.use(
  session({
    store: new PgSession({
      pool,
      tableName: "sessions_pg",
      createTableIfMissing: false,
    }),
    name: "hf.sid",
    secret: sessionSecret || "dev-insecure-secret",
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      maxAge: 1000 * 60 * 60 * 24 * 30,
    },
  })
);

// -----------------------------
// AUTH ATTACHMENT
// -----------------------------
app.use(loadUser);

// -----------------------------
// ROUTES
// -----------------------------
app.use("/api", router);

// -----------------------------
// ROOT ROUTE (REMOVES 404 NOISE)
// -----------------------------
app.get("/", (_req, res) => {
  res.json({
    status: "ok",
    service: "HiddenFreeways API",
  });
});

export default app;
