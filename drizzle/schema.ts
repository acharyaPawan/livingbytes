import { pgTable, unique, pgEnum, text, timestamp, foreignKey, uuid, numeric, boolean, index, date, primaryKey, integer } from "drizzle-orm/pg-core"

import { sql } from "drizzle-orm"
export const role = pgEnum("role", ['OWNER', 'USER'])
export const priorityLabels = pgEnum("PriorityLabels", ['Very Less', 'Very High', 'Moderate', 'Less', 'High'])
export const status = pgEnum("Status", ['Scheduled', 'Paused', 'Finished', 'In Progress', 'Not Started'])
export const trackerFrequency = pgEnum("TrackerFrequency", ['Yearly', 'HalfYearly', 'Quarterly', 'Monthly', 'Weekly', 'Daily'])
export const viewAs = pgEnum("ViewAs", ['Status', 'Checkbox'])
export const trackerStatus = pgEnum("TrackerStatus", ['In Progress', 'Not Started Yet', 'Finished'])
export const eventType = pgEnum("eventType", ['Range', 'Single'])



export const user = pgTable("user", {
	id: text("id").primaryKey().notNull(),
	name: text("name"),
	email: text("email").notNull(),
	emailVerified: timestamp("emailVerified", { mode: 'string' }),
	image: text("image"),
	role: role("role").default('USER'),
},
(table) => {
	return {
		userEmailUnique: unique("user_email_unique").on(table.email),
	}
});

export const session = pgTable("session", {
	sessionToken: text("sessionToken").primaryKey().notNull(),
	userId: text("userId").notNull().references(() => user.id, { onDelete: "cascade" } ),
	expires: timestamp("expires", { mode: 'string' }).notNull(),
});

export const categories = pgTable("categories", {
	id: uuid("id").default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" } ),
	title: text("title").notNull(),
	priority: numeric("priority").notNull(),
	labels: text("labels").array(),
	remark: text("remark"),
	createdOn: timestamp("created_on", { precision: 3, withTimezone: true, mode: 'string' }).defaultNow(),
	description: text("description"),
});

export const tasks = pgTable("tasks", {
	id: uuid("id").default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	categoryId: uuid("category_id").notNull().references(() => categories.id, { onDelete: "cascade" } ),
	title: text("title").notNull(),
	description: text("description"),
	priority: numeric("priority").notNull(),
	priorityLabel: priorityLabels("priority_label").default(priorityLabels.enumValues[2]),
	status: status("status").notNull(),
	viewAs: viewAs("view_as").notNull(),
	specialLabels: text("special_labels").array(),
	remark: text("remark"),
	createdOn: timestamp("created_on", { precision: 3, withTimezone: true, mode: 'string' }).defaultNow(),
	expiresOn: timestamp("expires_on", { precision: 3, withTimezone: true, mode: 'string' }),
	completedOn: timestamp("completed_on", { precision: 3, withTimezone: true, mode: 'string' }),
	locked: boolean("locked").default(false),
	flexible: boolean("flexible").default(false),
});

export const trackers = pgTable("trackers", {
	id: uuid("id").default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	taskId: uuid("task_id").references(() => tasks.id, { onDelete: "cascade" } ),
	title: text("title").notNull(),
	frequency: trackerFrequency("frequency").notNull(),
	tracked: boolean("tracked").default(false),
	createdOn: timestamp("created_on", { precision: 3, withTimezone: true, mode: 'string' }).defaultNow(),
	userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" } ),
	status: trackerStatus("status").notNull(),
});

export const subtasks = pgTable("subtasks", {
	id: uuid("id").default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	taskId: uuid("task_id").notNull().references(() => tasks.id, { onDelete: "cascade" } ),
	title: text("title").notNull(),
	description: text("description"),
	priority: numeric("priority").notNull(),
	priorityLabel: priorityLabels("priority_label").default("Moderate"),
	status: status("status").notNull(),
	viewAs: viewAs("view_as").notNull(),
	specialLabels: text("special_labels").array(),
	remark: text("remark"),
	createdOn: timestamp("created_on", { precision: 3, withTimezone: true, mode: 'date' }).defaultNow(),
	expiresOn: timestamp("expires_on", { precision: 3, withTimezone: true, mode: 'date' }),
	completedOn: timestamp("completed_on", { precision: 3, withTimezone: true, mode: 'date' }),
	locked: boolean("locked").default(false),
	flexible: boolean("flexible").default(false),
});

export const schedules = pgTable("schedules", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	userId: text("userId").notNull().references(() => user.id, { onDelete: "cascade" } ),
	scheduleTimeStamp: timestamp("schedule_time_stamp", { withTimezone: true, mode: 'string' }).notNull(),
	title: text("title").notNull(),
	description: text("description"),
	pinned: boolean("pinned").default(false),
	createdOn: timestamp("created_on", { withTimezone: true, mode: 'string' }).defaultNow(),
},
(table) => {
	return {
		scheduleTimestampIdx: index("schedule_timestamp_idx").on(table.scheduleTimeStamp),
		titleIdx: index("title_idx").on(table.title),
	}
});

export const singleDayEvents = pgTable("single_day_events", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	eventId: uuid("event_id").notNull().references(() => events.id, { onDelete: "cascade" } ),
	eventDate: timestamp("event_date", { withTimezone: true, mode: 'string' }).notNull(),
},
(table) => {
	return {
		eventDateIdx: index("event_date_idx").on(table.eventDate),
	}
});

export const events = pgTable("events", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	userId: text("userId").notNull().references(() => user.id, { onDelete: "cascade" } ),
	eventNature: eventType("eventNature").notNull(),
	tags: text("tags").array().notNull(),
	description: text("description"),
	pinned: boolean("pinned").default(false),
	createdOn: timestamp("created_on", { withTimezone: true, mode: 'string' }).defaultNow(),
	title: text("title").notNull(),
},
(table) => {
	return {
		tagsIdx: index("tags_idx").on(table.tags),
	}
});

export const rangeEvents = pgTable("range_events", {
	rangeId: uuid("range_id").default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	eventId: uuid("event_id").notNull().references(() => events.id, { onDelete: "cascade" } ),
	startDate: date("start_date").notNull(),
	endDate: date("end_date").notNull(),
});

export const verificationToken = pgTable("verificationToken", {
	identifier: text("identifier").notNull(),
	token: text("token").notNull(),
	expires: timestamp("expires", { mode: 'string' }).notNull(),
},
(table) => {
	return {
		verificationtokenIdentifierToken: primaryKey(table.identifier, table.token)
	}
});

export const account = pgTable("account", {
	userId: text("userId").notNull().references(() => user.id, { onDelete: "cascade" } ),
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
		accountProviderProvideraccountid: primaryKey(table.provider, table.providerAccountId)
	}
});