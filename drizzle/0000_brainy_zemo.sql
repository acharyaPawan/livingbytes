-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
DO $$ BEGIN
 CREATE TYPE "role" AS ENUM('OWNER', 'USER');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "PriorityLabels" AS ENUM('Very Less', 'Very High', 'Moderate', 'Less', 'High');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "Status" AS ENUM('Scheduled', 'Paused', 'Finished', 'In Progress', 'Not Started');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "TrackerFrequency" AS ENUM('Yearly', 'HalfYearly', 'Quarterly', 'Monthly', 'Weekly', 'Daily');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "ViewAs" AS ENUM('Status', 'Checkbox');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "TrackerStatus" AS ENUM('In Progress', 'Not Started Yet', 'Finished');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "eventType" AS ENUM('Range', 'Single');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"email" text NOT NULL,
	"emailVerified" timestamp,
	"image" text,
	"role" "role" DEFAULT 'USER',
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "session" (
	"sessionToken" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "categories" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"priority" numeric NOT NULL,
	"labels" text[],
	"remark" text,
	"created_on" timestamp(3) with time zone DEFAULT now(),
	"description" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tasks" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"category_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"priority" numeric NOT NULL,
	"priority_label" "PriorityLabels",
	"status" "Status" NOT NULL,
	"view_as" "ViewAs" NOT NULL,
	"special_labels" text[],
	"remark" text,
	"created_on" timestamp(3) with time zone DEFAULT now(),
	"expires_on" timestamp(3) with time zone,
	"completed_on" timestamp(3) with time zone,
	"locked" boolean DEFAULT false,
	"flexible" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "trackers" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"task_id" uuid,
	"title" text NOT NULL,
	"frequency" "TrackerFrequency" NOT NULL,
	"tracked" boolean DEFAULT false,
	"created_on" timestamp(3) with time zone DEFAULT now(),
	"user_id" text NOT NULL,
	"status" "TrackerStatus" NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "subtasks" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"task_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"priority" numeric NOT NULL,
	"priority_label" "PriorityLabels",
	"status" "Status" NOT NULL,
	"view_as" "ViewAs" NOT NULL,
	"special_labels" text[],
	"remark" text,
	"created_on" timestamp(3) with time zone DEFAULT now(),
	"expires_on" timestamp(3) with time zone,
	"completed_on" timestamp(3) with time zone,
	"locked" boolean DEFAULT false,
	"flexible" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "schedules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" text NOT NULL,
	"schedule_time_stamp" timestamp(0) with time zone NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"pinned" boolean DEFAULT false,
	"created_on" timestamp(0) with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "single_day_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"event_date" timestamp(0) with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "range_events" (
	"range_id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"date_range" "daterange" NOT NULL,
	"event_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" text NOT NULL,
	"eventNature" "eventType" NOT NULL,
	"tags" text[] NOT NULL,
	"description" text,
	"pinned" boolean DEFAULT false,
	"created_on" timestamp(0) with time zone DEFAULT now(),
	"title" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "verificationToken" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT verificationtoken_identifier_token PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "account" (
	"userId" text NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"providerAccountId" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"refresh_token_expires_in" integer,
	"scope" text,
	"id_token" text,
	"session_state" text,
	CONSTRAINT account_provider_provideraccountid PRIMARY KEY("provider","providerAccountId")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "schedule_timestamp_idx" ON "schedules" ("schedule_time_stamp");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "title_idx" ON "schedules" ("title");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "event_date_idx" ON "single_day_events" ("event_date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tags_idx" ON "events" ("tags");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "session" ADD CONSTRAINT "session_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "categories" ADD CONSTRAINT "categories_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tasks" ADD CONSTRAINT "tasks_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "trackers" ADD CONSTRAINT "trackers_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "trackers" ADD CONSTRAINT "trackers_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "subtasks" ADD CONSTRAINT "subtasks_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "schedules" ADD CONSTRAINT "schedules_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "single_day_events" ADD CONSTRAINT "single_day_events_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "range_events" ADD CONSTRAINT "range_events_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "events" ADD CONSTRAINT "events_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "account" ADD CONSTRAINT "account_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

*/