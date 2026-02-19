CREATE TYPE "public"."organization_invitation_status" AS ENUM('PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED');--> statement-breakpoint
CREATE TYPE "public"."organization_member_role" AS ENUM('OWNER', 'MEMBER');--> statement-breakpoint
CREATE TYPE "public"."organization_tier" AS ENUM('FREE', 'PRO', 'ENTERPRISE');--> statement-breakpoint
CREATE TYPE "public"."organization_type" AS ENUM('PERSONAL', 'COMPANY', 'TEAM', 'EDUCATION', 'OTHER');--> statement-breakpoint
CREATE TABLE "organization_invitations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"email" text NOT NULL,
	"role" "organization_member_role" DEFAULT 'MEMBER' NOT NULL,
	"status" "organization_invitation_status" DEFAULT 'PENDING' NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organization_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" "organization_member_role" DEFAULT 'MEMBER' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"type" "organization_type" DEFAULT 'PERSONAL' NOT NULL,
	"slug" text NOT NULL,
	"tier" "organization_tier" DEFAULT 'FREE' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"owner_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "organizations_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "organization_invitations" ADD CONSTRAINT "organization_invitations_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_user_id_users_table_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users_table"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_owner_id_users_table_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users_table"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "unique_pending_invitation" ON "organization_invitations" USING btree ("organization_id","email") WHERE "organization_invitations"."status" = 'PENDING';--> statement-breakpoint
CREATE INDEX "idx_invitations_email" ON "organization_invitations" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_invitations_org_id" ON "organization_invitations" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "idx_invitations_status" ON "organization_invitations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_invitations_expires_at" ON "organization_invitations" USING btree ("expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_org_member" ON "organization_members" USING btree ("organization_id","user_id");--> statement-breakpoint
CREATE INDEX "idx_org_members_user_id" ON "organization_members" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_org_members_role" ON "organization_members" USING btree ("role");--> statement-breakpoint
CREATE INDEX "idx_organizations_owner_id" ON "organizations" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "idx_organizations_type" ON "organizations" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_organizations_tier" ON "organizations" USING btree ("tier");--> statement-breakpoint
CREATE INDEX "idx_organizations_is_active" ON "organizations" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_organizations_created_at" ON "organizations" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_users_role" ON "users_table" USING btree ("role");--> statement-breakpoint
CREATE INDEX "idx_users_is_active" ON "users_table" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_users_created_at" ON "users_table" USING btree ("created_at");