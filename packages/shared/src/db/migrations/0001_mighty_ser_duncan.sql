CREATE TYPE "public"."postgres_hardware_profile" AS ENUM('dev-light', 'dev-standard', 'dev-power');--> statement-breakpoint
CREATE TYPE "public"."service_status" AS ENUM('provisioning', 'starting', 'ready', 'stopping', 'stopped', 'failed', 'deleting');--> statement-breakpoint
CREATE TYPE "public"."service_type" AS ENUM('postgresql');--> statement-breakpoint
CREATE TABLE "postgres_instances" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"project_id" uuid NOT NULL,
	"service_id" uuid NOT NULL,
	"postgres_version" text NOT NULL,
	"image_tag" text NOT NULL,
	"database_name" text NOT NULL,
	"username" text NOT NULL,
	"hardware_profile" "postgres_hardware_profile" NOT NULL,
	"cpu_limit" numeric(4, 2) NOT NULL,
	"memory_mb" integer NOT NULL,
	"storage_mb" integer NOT NULL,
	"host" text NOT NULL,
	"port" integer NOT NULL,
	"container_name" text,
	"volume_name" text,
	"last_health_status" text DEFAULT 'ready' NOT NULL,
	"last_health_checked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "services" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"project_id" uuid NOT NULL,
	"type" "service_type" NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"status" "service_status" DEFAULT 'provisioning' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "postgres_instances" ADD CONSTRAINT "postgres_instances_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "postgres_instances" ADD CONSTRAINT "postgres_instances_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "postgres_instances" ADD CONSTRAINT "postgres_instances_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "services" ADD CONSTRAINT "services_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "services" ADD CONSTRAINT "services_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "postgres_instances_user_id_idx" ON "postgres_instances" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "postgres_instances_service_id_unique_idx" ON "postgres_instances" USING btree ("service_id");--> statement-breakpoint
CREATE INDEX "projects_user_id_idx" ON "projects" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "projects_user_slug_unique_idx" ON "projects" USING btree ("user_id","slug");--> statement-breakpoint
CREATE INDEX "services_user_id_idx" ON "services" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "services_project_id_idx" ON "services" USING btree ("project_id");--> statement-breakpoint
CREATE UNIQUE INDEX "services_project_name_unique_idx" ON "services" USING btree ("project_id","name");