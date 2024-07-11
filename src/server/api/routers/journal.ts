import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { journals } from "@/server/db/schema";
import { and, desc, eq, sql } from "drizzle-orm";

export const journalRouter = createTRPCRouter({
  getSearch: protectedProcedure.query(async (opts) => {
    const documents = await opts.ctx.db
      .select()
      .from(journals)
      .where(eq(journals.userId, opts.ctx.session.user.id))
      .orderBy(desc(journals.date));
    return documents;
  }),
  getById: protectedProcedure
    .input(
      z.object({
        documentId: z.string(),
      }),
    )
    .query(async (opts) => {
      const { input } = opts;

      const [document] = await opts.ctx.db
        .select()
        .from(journals)
        .where(eq(journals.id, input.documentId));

      if (!document) {
        throw new Error("Not found");
      }

      if (document.userId !== opts.ctx.session.user.id) {
        throw new Error("Unauthorized");
      }

      return document;
    }),
  create: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        description: z.string().optional(),
      }),
    )
    .mutation(async (opts) => {
      const { input } = opts;

      const [document] = await opts.ctx.db
        .insert(journals)
        .values({
          title: input.title,
          userId: opts.ctx.session.user.id,
          description: input.description,
          date: new Date(),
        })
        .returning();

      if (document === undefined) {
        throw new Error("Not Created");
      }

      return document;
    }),

  // retrieveTodaysDocument procedure first check if there is any journal marked for this, if then returns it and if not it creates one and return it.

  retrieveTodaysDocument: protectedProcedure.query(async (opts) => {
      const [document] = await opts.ctx.db
        .select()
        .from(journals)
        .where(
          and(
            eq(journals.userId, opts.ctx.session.user.id),
            sql`DATE(date) = CURRENT_DATE`,
          ),
        );

      console.log(document);

      if (document && document?.userId !== opts.ctx.session.user.id) {
        throw new Error("Unauthorized");
      }

      if (document) {
        return document;
      }


    const [newDocument] = await opts.ctx.db
      .insert(journals)
      .values({
        userId: opts.ctx.session.user.id,
        date: new Date(),
      })
      .returning();

    console.log("newly created doc is ", newDocument);

    if (newDocument === undefined) {
      throw new Error("Unable to create document");
    }

    return newDocument;
  }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().optional(),
        content: z.string().optional(),
      }),
    )
    .mutation(async (opts) => {

      const { input, ctx } = opts;

      const { id, ...rest } = input;

      const [existingDocument] = await ctx.db
        .select()
        .from(journals)
        .where(eq(journals.id, id));

      if (!existingDocument) {
        throw new Error("Not found");
      }

      if (existingDocument.userId !== ctx.session.user.id) {
        throw new Error("Unauthorized");
      }

      const document = await ctx.db
        .update(journals)
        .set({...rest})
        .where(eq(journals.id, existingDocument.id))
        .returning();
      
      console.log('document is : ', document)

      // return document;
    }),
  //TODO:DO THE WORK OF REMOVE THANK YOU
  remove: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async (opts) => {
      const { input, ctx } = opts;
      const userId = ctx.session.user.id;
      const [existingDocument] = await ctx.db
        .select()
        .from(journals)
        .where(eq(journals.id, input.id));

      if (!existingDocument) {
        throw new Error("Not found");
      }

      if (existingDocument.userId !== userId) {
        throw new Error("Unauthorized");
      }

      const deletedDocument = await ctx.db
        .delete(journals)
        .where(eq(journals.id, input.id))
        .returning();
      return deletedDocument;
    }),
});
