import { pgTable, serial, text, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const milestoneApprovalsTable = pgTable("milestone_approvals", {
  id: serial("id").primaryKey(),
  projectId: text("project_id").notNull(),
  milestoneName: text("milestone_name").notNull(),
  status: text("status").notNull(), // 'pending', 'approved', 'revision_requested'
  comment: text("comment"),
  approvedAt: timestamp("approved_at"),
  requestedAt: timestamp("requested_at"),
  approvedBy: text("approved_by"),
  attachments: jsonb("attachments"), // future extensions (files, screenshots, videos, notes)
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertMilestoneApprovalSchema = createInsertSchema(milestoneApprovalsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const selectMilestoneApprovalSchema = createSelectSchema(milestoneApprovalsTable);

export type InsertMilestoneApproval = z.infer<typeof insertMilestoneApprovalSchema>;
export type MilestoneApproval = typeof milestoneApprovalsTable.$inferSelect;
