import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { eq } from "drizzle-orm";
import { events } from "@/server/db/schema";

export const eventRouter = createTRPCRouter({
  deleteEvent: protectedProcedure.input(z.object({eventId: z.string() })).mutation(async ({ctx, input}) => {
    try {
    const [deletedEvent] = await ctx.db.delete(events).where(eq(events.id, input.eventId)).returning({deletedId: events.id})
      return { 
        data: deletedEvent
      }
    } catch (e) {
      return {
        error: JSON.stringify(e) as string
      }
    }
  })
})