import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { tasks } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { stringify } from "superjson";

export const postRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      console.log('input is called ', input)
      return {
        greeting: `Hello ${input.text}`,
      };
    }),
    deleteTask: protectedProcedure.input(z.object({taskId: z.string() })).mutation(async ({ctx, input}) => {
      try {
      const [deletedTask] = await ctx.db.delete(tasks).where(eq(tasks.id, input.taskId)).returning({deletedId: tasks.id})
        return { 
          data: deletedTask
        }
      } catch (e) {
        return {
          error: JSON.stringify(e) as string
        }
      }
    }),
  })
