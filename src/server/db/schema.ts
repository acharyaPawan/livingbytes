import {
  pgTable,
  unique,
  pgEnum,
  text,
  timestamp,
  uuid,
  numeric,
  boolean,
  index,
  date,
  primaryKey,
  integer,
  AnyPgColumn,
} from "drizzle-orm/pg-core";

import { relations, sql } from "drizzle-orm";
export const role = pgEnum("role", ["OWNER", "USER"]);
export const priorityLabels = pgEnum("PriorityLabels", [
  "Very Less",
  "Very High",
  "Moderate",
  "Less",
  "High",
]);
export const status = pgEnum("Status", [
  "Paused",
  "Finished",
  "In Progress",
  "Not Started",
  "Expired",
  "Scheduled",
]);
export const trackerFrequency = pgEnum("TrackerFrequency", [
  "Yearly",
  "HalfYearly",
  "Quarterly",
  "Monthly",
  "Weekly",
  "Daily",
]);
export const viewAs = pgEnum("ViewAs", ["Status", "Checkbox"]);
export const trackerStatus = pgEnum("TrackerStatus", [
  "In Progress",
  "Not Started Yet",
  "Finished",
  "Idle",
]);
export const eventType = pgEnum("eventType", ["Range", "Single"]);

export const user = pgTable(
  "user",
  {
    id: text("id").primaryKey().notNull(),
    name: text("name"),
    email: text("email").notNull(),
    emailVerified: timestamp("emailVerified", { mode: "string" }),
    image: text("image"),
    role: role("role").default("USER"),
  },
  (table) => {
    return {
      userEmailUnique: unique("user_email_unique").on(table.email),
    };
  },
);

export const usersRelations = relations(user, ({ many }) => ({
  journals: many(journals),
  tasks: many(tasks),
}));

export const session = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey().notNull(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "string" }).notNull(),
});

export const categories = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  userOrder: numeric("user_order"),
  labels: text("labels").array(),
  description: text("description"),

  createdOn: timestamp("created_on").defaultNow(),
  updatedOn: timestamp("updated_on").defaultNow(),
}, (table) => ({
  unqCategoryTitleAndUser: unique().on(table.title, table.userId),
  userIdIdx: index().onOnly(table.userId),
  userOrderIdx: index().onOnly(table.userOrder),
  titleIdx: index().onOnly(table.title),
}))

export const categoriesRelation = relations(categories, ({ many }) => ({
  tasks: many(tasks),
  subtasks: many(subtasks),
}));

export const tasks = pgTable("tasks", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  categoryId: uuid("category_id").references(() => categories.id, { onDelete: "cascade",}).notNull(),
  userId: text("userId").notNull().references(() => user.id, { onDelete: "cascade" }), //added
  parentId: uuid("parent_id").references((): AnyPgColumn  => tasks.id, { onDelete: "cascade" }),

  title: text("title").notNull(),
  description: text("description"),
  user_order: numeric("user_order"),
  priorityLabel: priorityLabels("priority_label").default("Moderate"),
  labels: text("labels").array(),
  status: status("status").notNull().default("Not Started"),
  viewAs: viewAs("view_as").notNull().default("Status"),
  remark: text("remark"),
  // checkpoint: integer("checkpoint").notNull().default(1),
  scheduled: boolean("scheduled").default(false),
  locked: boolean("locked").default(false),
  flexible: boolean("flexible").default(false),

effectiveOn: timestamp("effective_on").notNull().defaultNow(),
  expiresOn: timestamp("expires_on").notNull(),
  createdOn: timestamp("created_on").defaultNow(),
  completedOn: timestamp("completed_on"),
  updatedOn: timestamp("updated_on"),
});

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  category: one(categories, {
    fields: [tasks.categoryId],
    references: [categories.id],
  }),
  trackersTasksMap: many(tasksToTrackers),
  // subtasks: many(subtasks),
  user: one(user, {
    fields: [tasks.userId],
    references: [user.id],
  }),
  parentTask: one(tasks, {
    fields: [tasks.parentId],
    references: [tasks.id],
    relationName: "subtasks",
  }),
  subtasks: many(tasks, {
    relationName: "subtasks"})
}));

export const trackers = pgTable("trackers", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),

  title: text("title").notNull(),
  description: text("description"),
  frequency: trackerFrequency("frequency").notNull().default("Daily"),
  status: trackerStatus("status").notNull().default("In Progress"),

  archived: boolean("archived").default(false),

  // followUpDate: timestamp("followup_date").notNull(),
  remark: text("remark"),
  locked: boolean("locked").default(false),

  endOn: timestamp("end_on").notNull(),
  startOn: timestamp("start_on").defaultNow(),
  createdOn: timestamp("created_on").defaultNow(),
});

export const trackerRelation = relations(trackers, ({ many }) => ({
  tasks: many(tasksToTrackers),
}));

// junction table
export const tasksToTrackers = pgTable("tasks_to_trackers", {
  taskId: uuid("task_id").references(() => tasks.id),
  trackerId: uuid("tracker_id").references(() => trackers.id),
});

export const tasksToTrackersRelations = relations(
  tasksToTrackers,
  ({ one }) => ({
    task: one(tasks, {
      fields: [tasksToTrackers.taskId],
      references: [tasks.id],
    }),
    tracker: one(trackers, {
      fields: [tasksToTrackers.trackerId],
      references: [trackers.id],
    }),
  }),
);

export const subtasks = pgTable("subtasks", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  categoryId: uuid("category_id").references(() => categories.id, {onDelete: "cascade",}).notNull(),
  taskId: uuid("task_id").notNull().references(() => tasks.id, { onDelete: "cascade" }),


  title: text("title").notNull(),
  userOrder: numeric("user_order"),
  description: text("description"),
  userId: numeric("user_id").notNull(),
  priorityLabel: priorityLabels("priority_label"),
  status: status("status").notNull().default("Not Started"),
  viewAs: viewAs("view_as").notNull().default("Status"),
  labels: text("labels").array(),
  remark: text("remark"),
  
  locked: boolean("locked").default(false),
  flexible: boolean("flexible").default(false),

  createdOn: timestamp("created_on").defaultNow(),
  effectiveOn: timestamp("effective_on").notNull().defaultNow(),
  expiresOn: timestamp("expires_on"),
  completedOn: timestamp("completed_on"),
  updatedOn: timestamp("updated_on"),
});

export const subtasksRelations = relations(subtasks, ({ one }) => ({
  task: one(tasks, {
    fields: [subtasks.taskId],
    references: [tasks.id],
  }),
  category: one(categories, {
    fields: [subtasks.categoryId],
    references: [categories.id],
  }),
}));

export const schedules = pgTable(
  "schedules",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    userId: text("userId").notNull().references(() => user.id, { onDelete: "cascade" }),
    scheduleTimeStamp: timestamp("schedule_time_stamp", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
    title: text("title").notNull(),
    description: text("description"),
    pinned: boolean("pinned").default(false),
    createdOn: timestamp("created_on", {
      withTimezone: true,
      mode: "string",
    }).defaultNow(),
  },
  (table) => {
    return {
      scheduleTimestampIdx: index("schedule_timestamp_idx").on(
        table.scheduleTimeStamp,
      ),
      titleIdx: index("title_idx").on(table.title),
    };
  },
);


export const singleDayEvents = pgTable(
  "single_day_events",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    eventId: uuid("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    eventDate: timestamp("event_date", {
      withTimezone: true,
      mode: "date",
    }).notNull(),
  },
  (table) => {
    return {
      eventDateIdx: index("event_date_idx").on(table.eventDate),
    };
  },
);

export const singleDayEventsRelations = relations(
  singleDayEvents,
  ({ one }) => ({
    event: one(events, {
      fields: [singleDayEvents.eventId],
      references: [events.id],
    }),
  }),
);

export const events = pgTable(
  "events",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    userId: text("userId")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    eventNature: eventType("eventNature").notNull(),
    tags: text("tags").array().notNull(),
    description: text("description"),
    pinned: boolean("pinned").default(false),
    createdOn: timestamp("created_on", {
      withTimezone: true,
      mode: "string",
    }).defaultNow(),
    title: text("title").notNull(),
  },
  (table) => {
    return {
      tagsIdx: index("tags_idx").on(table.tags),
    };
  },
);

export const eventsRelations = relations(events, ({ one }) => ({
  singleDayEvent: one(singleDayEvents),
  rangeEvent: one(rangeEvents),
}));

export const rangeEvents = pgTable("range_events", {
  rangeId: uuid("range_id").defaultRandom().primaryKey().notNull(),
  eventId: uuid("event_id")
    .notNull()
    .references(() => events.id, { onDelete: "cascade" }),
  startDate: date("start_date", { mode: "date" }).notNull(),
  endDate: date("end_date", { mode: "date" }).notNull(),
});

export const rangeEventsRelations = relations(rangeEvents, ({ one }) => ({
  event: one(events, {
    fields: [rangeEvents.eventId],
    references: [events.id],
  }),
}));

export const verificationToken = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "string" }).notNull(),
  },
  (table) => {
    return {
      verificationtokenIdentifierToken: primaryKey(
        table.identifier,
        table.token,
      ),
    };
  },
);

export const account = pgTable(
  "account",
  {
    userId: text("userId").notNull().references(() => user.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refreshToken: text("refresh_token"),
    accessToken: text("access_token"),
    expiresAt: integer("expires_at"),
    tokenType: text("token_type"),
    refreshTokenExpiresIn: integer("refresh_token_expires_in"),
    scope: text("scope"),
    idToken: text("id_token"),
    sessionState: text("session_state"),
  },
  (table) => {
    return {
      accountProviderProvideraccountid: primaryKey(
        table.provider,
        table.providerAccountId,
      ),
    };
  },
);

export const journals = pgTable(
  "journals",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    userId: text("userId")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    date: timestamp("date").notNull().unique(),
    fileUrl: text("file_url"),
    title: text("title"),
    description: text("description"),
    content: text("content").default(""),
  },
  (table) => ({
    dateIdx: index("date_idx").on(table.date),
  }),
);

export const journalRelation = relations(journals, ({ one }) => ({
  users: one(user, {
    fields: [journals.userId],
    references: [user.id],
  }),
}));
