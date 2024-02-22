import { pgTable, unique, pgEnum, text, timestamp, foreignKey, uuid, numeric, boolean, primaryKey, integer } from "drizzle-orm/pg-core"

import { sql } from "drizzle-orm"
export const role = pgEnum("role", ['OWNER', 'USER'])
export const priorityLabels = pgEnum("PriorityLabels", ['Very Less', 'Very High', 'Moderate', 'Less', 'High'])
export const status = pgEnum("Status", ['Scheduled', 'Paused', 'Finished', 'In Progress', 'Not Started'])
export const trackerFrequency = pgEnum("TrackerFrequency", ['Yearly', 'HalfYearly', 'Quarterly', 'Monthly', 'Weekly', 'Daily'])
export const viewAs = pgEnum("ViewAs", ['Status', 'Checkbox'])
export const trackerStatus = pgEnum("TrackerStatus", ['In Progress', 'Not Started Yet', 'Finished'])


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
	priorityLabel: priorityLabels("priority_label"),
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
	priorityLabel: priorityLabels("priority_label"),
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