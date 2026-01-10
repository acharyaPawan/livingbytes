import { endOfDay, format, isValid, startOfDay } from "date-fns";
import { z } from "zod";

export const eventNatureSchema = z.enum(["Single", "Range"]);

export const eventFiltersSchema = z.object({
  search: z.string().max(120).optional(),
  from: z.date().optional(),
  to: z.date().optional(),
  type: eventNatureSchema.optional(),
  status: z.enum(["upcoming", "ongoing", "past"]).optional(),
  pinned: z.boolean().optional(),
  tag: z.string().max(60).optional(),
});

export type EventFilters = z.infer<typeof eventFiltersSchema>;

export const eventBaseSchema = z.object({
  title: z.string().trim().min(3, { message: "Title is too short." }).max(160),
  description: z.string().trim().max(320).optional().nullable(),
  tags: z.array(z.string().trim().min(1)).max(12).optional(),
  pinned: z.boolean().optional(),
  eventNature: eventNatureSchema,
  eventDate: z.date().optional(),
  range: z
    .object({
      startDate: z.date(),
      endDate: z.date(),
    })
    .optional(),
});

export const eventCreateSchema = eventBaseSchema.superRefine((data, ctx) => {
  if (data.eventNature === "Single") {
    if (!data.eventDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Pick a date for a single event.",
        path: ["eventDate"],
      });
    }
  }
  if (data.eventNature === "Range") {
    if (!data.range?.startDate || !data.range?.endDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Select a start and end date.",
        path: ["range"],
      });
    } else if (data.range.endDate < data.range.startDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "End date must be after start date.",
        path: ["range"],
      });
    }
  }
});

export const eventUpdateSchema = eventBaseSchema
  .partial()
  .extend({
    id: z.string().uuid(),
    eventNature: eventNatureSchema.optional(),
  })
  .superRefine((data, ctx) => {
    const hasUpdate =
      data.title !== undefined ||
      data.description !== undefined ||
      data.tags !== undefined ||
      data.pinned !== undefined ||
      data.eventNature !== undefined ||
      data.eventDate !== undefined ||
      data.range !== undefined;

    if (!hasUpdate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "No updates provided.",
      });
    }

    if (data.range?.endDate && data.range.startDate) {
      if (data.range.endDate < data.range.startDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "End date must be after start date.",
          path: ["range"],
        });
      }
    }
  });

export type EventCreateInput = z.infer<typeof eventCreateSchema>;
export type EventUpdateInput = z.infer<typeof eventUpdateSchema>;

export const eventListInput = z.object({
  limit: z.number().min(1).max(50).default(12),
  cursor: z.string().optional(),
  filters: eventFiltersSchema.default({}),
});

export type EventListInput = z.infer<typeof eventListInput>;

export type EventStatus = "upcoming" | "ongoing" | "past";

export type EventLike = {
  id: string;
  title?: string | null;
  description?: string | null;
  tags?: string[] | null;
  eventNature: "Single" | "Range";
  pinned?: boolean | null;
  eventDate?: Date | string | null;
  startDate?: Date | string | null;
  endDate?: Date | string | null;
  createdOn?: Date | string | null;
};

const toValidDate = (value?: Date | string | null) => {
  if (!value) return null;
  const normalized = typeof value === "string" ? new Date(value) : value;
  return isValid(normalized) ? normalized : null;
};

export const normalizeTagInput = (value?: string | null) => {
  if (!value) return [];
  return Array.from(
    new Set(
      value
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    ),
  );
};

export const eventRange = (event: EventLike) => {
  if (event.eventNature === "Range") {
    const start = toValidDate(event.startDate);
    const end = toValidDate(event.endDate);
    return {
      start: start ? startOfDay(start) : null,
      end: end ? endOfDay(end) : null,
    };
  }

  const single = toValidDate(event.eventDate);
  return { start: single, end: single };
};

export const eventSortDate = (event: EventLike) => {
  const range = eventRange(event);
  return range.start ?? toValidDate(event.createdOn) ?? new Date();
};

export const eventStatus = (event: EventLike, now = new Date()): EventStatus => {
  const range = eventRange(event);
  if (!range.start || !range.end) return "upcoming";

  const start = range.start.getTime();
  const end = range.end.getTime();
  const current = now.getTime();

  if (current < start) return "upcoming";
  if (current > end) return "past";
  return "ongoing";
};

export const formatEventDate = (value?: Date | string | null) => {
  const normalized = toValidDate(value);
  return normalized ? format(normalized, "MMM d, yyyy") : "Unknown date";
};

export const formatEventDateTime = (value?: Date | string | null) => {
  const normalized = toValidDate(value);
  return normalized ? format(normalized, "MMM d, yyyy p") : "Unknown time";
};

export const formatEventRange = (event: EventLike) => {
  const range = eventRange(event);
  if (!range.start) return "Unknown date";
  if (!range.end || range.start.getTime() === range.end.getTime()) {
    return formatEventDateTime(range.start);
  }
  return `${formatEventDate(range.start)} - ${formatEventDate(range.end)}`;
};

export const normalizeEventFilters = (value?: EventFilters) => {
  if (!value) return undefined;
  const { from, to } = value;
  if (!from && !to) return value;
  return {
    ...value,
    from: from ? startOfDay(from) : undefined,
    to: to ? endOfDay(to) : undefined,
  };
};

export const matchesEventFilters = (event: EventLike, filters?: EventFilters) => {
  if (!filters) return true;
  const normalized = normalizeEventFilters(filters);
  if (!normalized) return true;

  if (normalized.type && event.eventNature !== normalized.type) return false;
  if (normalized.pinned && !event.pinned) return false;
  if (normalized.tag) {
    const tag = normalized.tag.toLowerCase();
    const tags = (event.tags ?? []).map((item) => item.toLowerCase());
    if (!tags.includes(tag)) return false;
  }

  const status = eventStatus(event);
  if (normalized.status && status !== normalized.status) return false;

  if (normalized.search) {
    const search = normalized.search.toLowerCase();
    const haystack = [
      event.title,
      event.description,
      ...(event.tags ?? []),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    if (!haystack.includes(search)) return false;
  }

  const range = eventRange(event);
  const from = normalized.from?.getTime();
  const to = normalized.to?.getTime();

  if (from && range.end && range.end.getTime() < from) return false;
  if (to && range.start && range.start.getTime() > to) return false;

  return true;
};

export const eventCursor = (event: EventLike) =>
  `${eventSortDate(event).toISOString()}::${event.id}`;

export const sortEvents = (events: EventLike[]) => {
  const statusOrder: Record<EventStatus, number> = {
    ongoing: 0,
    upcoming: 1,
    past: 2,
  };

  return [...events].sort((a, b) => {
    const pinnedDelta = Number(!!b.pinned) - Number(!!a.pinned);
    if (pinnedDelta !== 0) return pinnedDelta;

    const statusDelta =
      statusOrder[eventStatus(a)] - statusOrder[eventStatus(b)];
    if (statusDelta !== 0) return statusDelta;

    const dateDelta =
      eventSortDate(a).getTime() - eventSortDate(b).getTime();
    if (dateDelta !== 0) return dateDelta;

    return a.id.localeCompare(b.id);
  });
};

export const paginateEvents = <T extends EventLike>(
  events: T[],
  limit: number,
  cursor?: string,
) => {
  const startIndex = cursor
    ? Math.max(
        0,
        events.findIndex((event) => eventCursor(event) === cursor) + 1,
      )
    : 0;

  const items = events.slice(startIndex, startIndex + limit);
  const next =
    events.length > startIndex + limit
      ? eventCursor(events[startIndex + limit - 1] as T)
      : undefined;

  return { items, nextCursor: next };
};

export const eventTags = (userId: string) => [
  "events",
  `event-feed-${userId}`,
  `event-stats-${userId}`,
];
