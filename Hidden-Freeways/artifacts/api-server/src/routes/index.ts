import { Router, type IRouter } from "express";

import healthRouter from "./health";
import authRouter from "./auth";
import statesRouter from "./states";
import categoriesRouter from "./categories";
import locationsRouter from "./locations";
import threadsRouter from "./threads";
import feedRouter from "./feed";
import adminRouter from "./admin";
import announcementsRouter from "./announcements";
import votesRouter from "./votes";
import chatRouter from "./chat";
import crewsRouter from "./crews";
import messagesRouter from "./messages";

const router: IRouter = Router();

/**
 * =======================================================
 * API ROUTE MOUNTING (CLEAN REST STRUCTURE)
 * =======================================================
 * Everything here is mounted under /api in app.ts
 */

router.use("/health", healthRouter);

router.use("/auth", authRouter);

router.use("/states", statesRouter);

router.use("/categories", categoriesRouter);

router.use("/locations", locationsRouter);

router.use("/threads", threadsRouter);

router.use("/feed", feedRouter);

router.use("/admin", adminRouter);

router.use("/announcements", announcementsRouter);

router.use("/votes", votesRouter);

router.use("/chat", chatRouter);

router.use("/crews", crewsRouter);

router.use("/messages", messagesRouter);

export default router;
