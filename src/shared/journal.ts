import { endOfDay, format, startOfDay } from "date-fns";
import { z } from "zod";

export const defaultJournalDate = () => startOfDay(new Date());

export const journalFiltersSchema = z.object({
  search: z.string().max(120).optional(),
  from: z.date().optional(),
  to: z.date().optional(),
  hasAttachment: z.boolean().optional(),
  hasContent: z.boolean().optional(),
});

export type JournalFilters = z.infer<typeof journalFiltersSchema>;

export const journalUpsertSchema = z.object({
  id: z.string().uuid().optional(),
  date: z.date().default(defaultJournalDate()),
  title: z
    .string()
    .trim()
    .min(3, { message: "Give this entry a title." })
    .max(160),
  description: z.string().trim().max(320).optional(),
  content: z.string().optional(),
  fileUrl: z
    .string()
    .url({ message: "Enter a valid URL for attachments." })
    .max(500)
    .optional()
    .or(z.literal("")),
});

export type JournalUpsertInput = z.infer<typeof journalUpsertSchema>;

export const journalListInput = z.object({
  limit: z.number().min(1).max(50).default(10),
  cursor: z.string().datetime().optional(),
  filters: journalFiltersSchema.default({}),
});

export type JournalListInput = z.infer<typeof journalListInput>;

export const defaultJournalContent = JSON.stringify(
  [
    {
      type: "heading",
      content: [
        {
          type: "text",
          text: "Today’s reflections",
          styles: {},
        },
      ],
    },
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "Capture the moments, wins, blockers, or ideas worth keeping.",
          styles: {},
        },
      ],
    },
  ],
  null,
  2,
);

const flattenTextFromBlocknote = (content?: unknown): string => {
  if (!content) return "";
  if (typeof content === "string") {
    try {
      const parsed = JSON.parse(content);
      return flattenTextFromBlocknote(parsed);
    } catch {
      return content;
    }
  }

  if (Array.isArray(content)) {
    return content
      .map((item) => flattenTextFromBlocknote(item))
      .filter(Boolean)
      .join(" ");
  }

  if (typeof content === "object" && content !== null) {
    const maybeContent = (content as { content?: unknown }).content;
    if (maybeContent) {
      return flattenTextFromBlocknote(maybeContent);
    }
    const maybeText = (content as { text?: string }).text;
    if (maybeText) {
      return maybeText;
    }
  }

  return "";
};

export const journalPreview = (content?: string | null, limit = 140) => {
  const text = flattenTextFromBlocknote(content);
  if (!text) return "";
  const trimmed = text.trim();
  return trimmed.length > limit ? `${trimmed.slice(0, limit)}…` : trimmed;
};

export const formatJournalDate = (date: Date | string) => {
  const normalized = typeof date === "string" ? new Date(date) : date;
  return format(normalized, "EEE, MMM d");
};

export const journalTags = (userId: string) => [
  "journal",
  `journal-feed-${userId}`,
  `journal-stats-${userId}`,
];

export const journalDateRange = (value?: { from?: Date; to?: Date }) => {
  if (!value) return undefined;
  const { from, to } = value;
  if (!from && !to) return undefined;

  return {
    from: from ? startOfDay(from) : undefined,
    to: to ? endOfDay(to) : undefined,
  };
};

