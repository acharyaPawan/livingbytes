"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, Loader2, PlusCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import type { JournalFeedEntry } from "@/data/journal/journal";
import { defaultJournalDate, journalUpsertSchema } from "@/shared/journal";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";

type FormValues = z.infer<typeof journalUpsertSchema>;

type Props = {
  onCreated?: (entry: JournalFeedEntry) => void;
};

export const JournalComposer = ({ onCreated }: Props) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const mutation = api.journal.create.useMutation({
    onError(error) {
      toast({
        title: "Could not save entry",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(journalUpsertSchema),
    defaultValues: {
      date: defaultJournalDate(),
      title: `Journal — ${format(defaultJournalDate(), "MMM d")}`,
      description: "",
      fileUrl: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    const payload = {
      ...values,
      fileUrl: values.fileUrl ? values.fileUrl : undefined,
    };
    const entry = await mutation.mutateAsync(payload);
    toast({
      title: "Journal created",
      description: "Opening your entry…",
    });
    onCreated?.(entry);
    setOpen(false);
    router.refresh();
    router.push(`/journals/${entry.id}`);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <PlusCircle className="h-4 w-4" />
          New entry
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create a journal entry</DialogTitle>
          <DialogDescription>
            Backfill a previous day or start a fresh page for today.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-3 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? format(field.value, "PPP") : "Pick a date"}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={(val) => val && field.onChange(val)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="E.g., Sprint retrospective" {...field} />
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
                  <FormLabel>Context (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="What was today about? Key wins, themes, or focus."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="fileUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Attachment link</FormLabel>
                  <FormControl>
                    <Input placeholder="Optional URL to docs, media, or references" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  form.reset();
                  setOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isLoading} className="gap-2">
                {mutation.isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                Create & open
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default JournalComposer;
