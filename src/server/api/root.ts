import { postRouter } from "@/server/api/routers/post";
import { createTRPCRouter } from "@/server/api/trpc";
import { taskRouter } from "./routers/tasks";
import { eventRouter } from "./routers/event";
import { journalRouter } from "./routers/journal";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  post: postRouter,
  task: taskRouter,
  event: eventRouter,
  journal: journalRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;
