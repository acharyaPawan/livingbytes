import { revalidateTag } from "next/cache";
import { z } from "zod";
import { and, eq } from "drizzle-orm";

import { getCachedEventStats, getEventByIdForUser, getEventPage } from "@/data/event/event-db";
import {
  eventCreateSchema,
  eventListInput,
  eventTags,
  eventUpdateSchema,
} from "@/shared/event";
import { events, rangeEvents, singleDayEvents } from "@/server/db/schema";
import { createTRPCRouter, protectedProcedure } from "../trpc";

const revalidateEvents = (userId: string) => {
  eventTags(userId).forEach((tag) => revalidateTag(tag));
};

export const eventRouter = createTRPCRouter({
  list: protectedProcedure.input(eventListInput).query(async ({ ctx, input }) => {
    return getEventPage({
      userId: ctx.session.user.id,
      limit: input.limit,
      cursor: input.cursor,
      filters: input.filters,
    });
  }),

  summary: protectedProcedure.query(async ({ ctx }) => {
    return getCachedEventStats(ctx.session.user.id);
  }),

  getById: protectedProcedure
    .input(z.object({ eventId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const entry = await getEventByIdForUser(ctx.session.user.id, input.eventId);
      if (!entry) {
        throw new Error("Not found");
      }
      return entry;
    }),

  create: protectedProcedure.input(eventCreateSchema).mutation(async ({ ctx, input }) => {
    const userId = ctx.session.user.id;
    const tags = input.tags?.length ? input.tags : [];

    const created = await ctx.db.transaction(async (tx) => {
      const [eventRow] = await tx
        .insert(events)
        .values({
          userId,
          title: input.title,
          description: input.description ?? null,
          tags,
          pinned: input.pinned ?? false,
          eventNature: input.eventNature,
        })
        .returning();

      if (!eventRow) {
        throw new Error("Unable to create event");
      }

      if (input.eventNature === "Single") {
        if (!input.eventDate) {
          throw new Error("Event date required");
        }
        await tx.insert(singleDayEvents).values({
          eventId: eventRow.id,
          eventDate: input.eventDate,
        });
      }

      if (input.eventNature === "Range") {
        if (!input.range?.startDate || !input.range?.endDate) {
          throw new Error("Event range required");
        }
        await tx.insert(rangeEvents).values({
          eventId: eventRow.id,
          startDate: input.range.startDate,
          endDate: input.range.endDate,
        });
      }

      return eventRow.id;
    });

    revalidateEvents(userId);
    const entry = await getEventByIdForUser(userId, created);
    if (!entry) {
      throw new Error("Unable to load event");
    }
    return entry;
  }),

  update: protectedProcedure.input(eventUpdateSchema).mutation(async ({ ctx, input }) => {
    const userId = ctx.session.user.id;

    const updatedId = await ctx.db.transaction(async (tx) => {
      const [existing] = await tx.query.events.findMany({
        where: (event, { and, eq }) =>
          and(eq(event.id, input.id), eq(event.userId, userId)),
        with: {
          singleDayEvent: true,
          rangeEvent: true,
        },
        limit: 1,
      });

      if (!existing) {
        throw new Error("Not found");
      }

      const nextNature = input.eventNature ?? existing.eventNature;
      const tags = input.tags ?? existing.tags ?? [];
      const updates = {
        title: input.title ?? existing.title,
        description:
          input.description !== undefined ? input.description : existing.description,
        tags,
        pinned: input.pinned ?? existing.pinned ?? false,
        eventNature: nextNature,
      };

      await tx.update(events).set(updates).where(eq(events.id, existing.id));

      if (nextNature === "Single") {
        const eventDate =
          input.eventDate ?? existing.singleDayEvent?.eventDate ?? null;
        if (!eventDate) {
          throw new Error("Event date required");
        }
        if (existing.rangeEvent) {
          await tx.delete(rangeEvents).where(eq(rangeEvents.eventId, existing.id));
        }
        if (existing.singleDayEvent) {
          await tx
            .update(singleDayEvents)
            .set({ eventDate })
            .where(eq(singleDayEvents.eventId, existing.id));
        } else {
          await tx.insert(singleDayEvents).values({
            eventId: existing.id,
            eventDate,
          });
        }
      }

      if (nextNature === "Range") {
        const startDate =
          input.range?.startDate ?? existing.rangeEvent?.startDate ?? null;
        const endDate =
          input.range?.endDate ?? existing.rangeEvent?.endDate ?? null;
        if (!startDate || !endDate) {
          throw new Error("Event range required");
        }
        if (existing.singleDayEvent) {
          await tx.delete(singleDayEvents).where(eq(singleDayEvents.eventId, existing.id));
        }
        if (existing.rangeEvent) {
          await tx
            .update(rangeEvents)
            .set({ startDate, endDate })
            .where(eq(rangeEvents.eventId, existing.id));
        } else {
          await tx.insert(rangeEvents).values({
            eventId: existing.id,
            startDate,
            endDate,
          });
        }
      }

      return existing.id;
    });

    revalidateEvents(userId);
    const entry = await getEventByIdForUser(userId, updatedId);
    if (!entry) {
      throw new Error("Unable to load event");
    }
    return entry;
  }),

  togglePin: protectedProcedure
    .input(z.object({ eventId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const [existing] = await ctx.db
        .select({ id: events.id, pinned: events.pinned })
        .from(events)
        .where(and(eq(events.id, input.eventId), eq(events.userId, userId)));

      if (!existing) {
        throw new Error("Not found");
      }

      const [updated] = await ctx.db
        .update(events)
        .set({ pinned: !existing.pinned })
        .where(eq(events.id, existing.id))
        .returning();

      revalidateEvents(userId);
      return updated;
    }),

  remove: protectedProcedure
    .input(z.object({ eventId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const [existing] = await ctx.db
        .select({ id: events.id })
        .from(events)
        .where(and(eq(events.id, input.eventId), eq(events.userId, userId)));

      if (!existing) {
        throw new Error("Not found");
      }

      const [deleted] = await ctx.db
        .delete(events)
        .where(eq(events.id, existing.id))
        .returning();

      revalidateEvents(userId);
      return deleted;
    }),
});
