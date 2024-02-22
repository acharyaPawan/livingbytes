import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";

export const taskRouter = createTRPCRouter({
    'createNewTask': protectedProcedure.input(z.Schema())
})
