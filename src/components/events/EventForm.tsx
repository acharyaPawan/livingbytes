"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import type { DateRange } from "react-day-picker";
import { z } from "zod";

import { cn } from "@/lib/utils";
import { eventNatureSchema, normalizeTagInput, type EventCreateInput } from "@/shared/event";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

const eventFormSchema = z
  .object({
    title: z.string().min(3).max(160),
    description: z.string().max(320).optional(),
    tags: z.string().optional(),
    pinned: z.boolean().optional(),
    eventNature: eventNatureSchema,
    eventDate: z.date().optional(),
    range: z
      .object({
        from: z.date().optional(),
        to: z.date().optional(),
      })
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.eventNature === "Single") {
      if (!data.eventDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Pick a date for this event.",
          path: ["eventDate"],
        });
      }
    }
    if (data.eventNature === "Range") {
      if (!data.range?.from || !data.range?.to) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Select a start and end date.",
          path: ["range"],
        });
      }
    }
  });

export type EventFormValues = z.infer<typeof eventFormSchema>;

type Props = {
  defaultValues?: Partial<EventFormValues>;
  submitLabel?: string;
  isSubmitting?: boolean;
  className?: string;
  onCancel?: () => void;
  onSubmit: (values: EventCreateInput) => Promise<void>;
};

export const EventForm = ({
  defaultValues,
  submitLabel = "Save",
  isSubmitting,
  className,
  onCancel,
  onSubmit,
}: Props) => {
  const [timeValue, setTimeValue] = useState<string>("09:00");

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: "",
      description: "",
      tags: "",
      pinned: false,
      eventNature: "Single",
      ...defaultValues,
    },
  });

  useEffect(() => {
    if (defaultValues?.eventDate) {
      const hours = defaultValues.eventDate.getHours().toString().padStart(2, "0");
      const minutes = defaultValues.eventDate.getMinutes().toString().padStart(2, "0");
      setTimeValue(`${hours}:${minutes}`);
    }
  }, [defaultValues?.eventDate]);

  const selectedNature = form.watch("eventNature");
  const selectedDate = form.watch("eventDate");
  const range = form.watch("range") as DateRange | undefined;

  const handleTimeChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const next = e.target.value;
    setTimeValue(next);

    const current = form.getValues("eventDate");
    if (current) {
      const [hours, minutes] = next.split(":").map(Number);
      const updated = new Date(current);
      updated.setHours(hours ?? 0, minutes ?? 0, 0, 0);
      form.setValue("eventDate", updated);
    }
  };

  const dateLabel = useMemo(() => {
    if (!selectedDate) return "Pick a date";
    return format(selectedDate, "PPP p");
  }, [selectedDate]);

  const rangeLabel = useMemo(() => {
    if (!range?.from) return "Pick a date range";
    if (!range.to) return format(range.from, "PPP");
    return `${format(range.from, "PPP")} - ${format(range.to, "PPP")}`;
  }, [range?.from, range?.to]);

  const submitHandler = async (values: EventFormValues) => {
    const payload: EventCreateInput = {
      title: values.title,
      description: values.description || undefined,
      tags: normalizeTagInput(values.tags),
      pinned: values.pinned ?? false,
      eventNature: values.eventNature,
      eventDate: values.eventNature === "Single" ? values.eventDate : undefined,
      range:
        values.eventNature === "Range" && values.range?.from && values.range?.to
          ? { startDate: values.range.from, endDate: values.range.to }
          : undefined,
    };

    await onSubmit(payload);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(submitHandler)}
        className={cn("space-y-4", className)}
      >
        <FormField
          control={form.control}
          name="eventNature"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <FormControl>
                <div className="grid grid-cols-2 gap-2">
                  {(["Single", "Range"] as const).map((value) => (
                    <Button
                      key={value}
                      type="button"
                      variant={field.value === value ? "default" : "outline"}
                      onClick={() => field.onChange(value)}
                    >
                      {value === "Single" ? "Single day" : "Multi-day range"}
                    </Button>
                  ))}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-3 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="E.g., Product launch" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="tags"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tags</FormLabel>
                <FormControl>
                  <Input
                    placeholder="launch, marketing, release"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  rows={3}
                  placeholder="Why this event matters, agenda, or notes."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {selectedNature === "Single" && (
          <FormField
            control={form.control}
            name="eventDate"
            render={({ field }) => (
              <FormItem className="flex flex-col gap-2">
                <FormLabel>Date & time</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button variant="outline" className="justify-start gap-2">
                        <CalendarIcon className="h-4 w-4" />
                        {dateLabel}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-4" align="start">
                    <div className="flex flex-col gap-3">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(date) => {
                          if (!date) return;
                          const [hours, minutes] = timeValue.split(":").map(Number);
                          const dateTime = new Date(date);
                          dateTime.setHours(hours ?? 0, minutes ?? 0, 0, 0);
                          field.onChange(dateTime);
                        }}
                        initialFocus
                      />
                      <Input type="time" value={timeValue} onChange={handleTimeChange} />
                    </div>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {selectedNature === "Range" && (
          <FormField
            control={form.control}
            name="range"
            render={({ field }) => (
              <FormItem className="flex flex-col gap-2">
                <FormLabel>Date range</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button variant="outline" className="justify-start gap-2">
                        <CalendarIcon className="h-4 w-4" />
                        {rangeLabel}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="range"
                      selected={field.value as DateRange | undefined}
                      onSelect={(value) => field.onChange(value)}
                      numberOfMonths={2}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="pinned"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <FormLabel className="text-sm font-medium">Pin to top</FormLabel>
                <p className="text-xs text-muted-foreground">
                  Keep this event visible in your queue.
                </p>
              </div>
              <FormControl>
                <Switch checked={!!field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex flex-wrap items-center justify-end gap-2">
          {onCancel && (
            <Button type="button" variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" className="gap-2" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default EventForm;
