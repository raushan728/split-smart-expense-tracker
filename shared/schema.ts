import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const groups = pgTable("groups", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  icon: text("icon").notNull().default("🏠"),
  createdBy: text("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const members = pgTable("members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  groupId: varchar("group_id").notNull(),
  name: text("name").notNull(),
  email: text("email"),
  avatar: text("avatar"),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

export const expenses = pgTable("expenses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  groupId: varchar("group_id").notNull(),
  description: text("description").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  category: text("category").notNull(),
  paidBy: varchar("paid_by").notNull(),
  splitType: text("split_type").notNull().default("equal"),
  splitData: jsonb("split_data"),
  date: timestamp("date").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const settlements = pgTable("settlements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  groupId: varchar("group_id").notNull(),
  fromMemberId: varchar("from_member_id").notNull(),
  toMemberId: varchar("to_member_id").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  isSettled: boolean("is_settled").default(false).notNull(),
  settledAt: timestamp("settled_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertGroupSchema = createInsertSchema(groups).omit({
  id: true,
  createdAt: true,
});

export const insertMemberSchema = createInsertSchema(members).omit({
  id: true,
  joinedAt: true,
});

export const insertExpenseSchema = createInsertSchema(expenses).omit({
  id: true,
  createdAt: true,
});

export const insertSettlementSchema = createInsertSchema(settlements).omit({
  id: true,
  createdAt: true,
  settledAt: true,
});

export type Group = typeof groups.$inferSelect;
export type Member = typeof members.$inferSelect;
export type Expense = typeof expenses.$inferSelect;
export type Settlement = typeof settlements.$inferSelect;

export type InsertGroup = z.infer<typeof insertGroupSchema>;
export type InsertMember = z.infer<typeof insertMemberSchema>;
export type InsertExpense = z.infer<typeof insertExpenseSchema>;
export type InsertSettlement = z.infer<typeof insertSettlementSchema>;

// Extended types for calculations
export type GroupWithStats = Group & {
  totalExpenses: string;
  memberCount: number;
  recentExpense?: Expense & { paidByName: string };
};

export type MemberBalance = {
  memberId: string;
  memberName: string;
  balance: number;
  owes: Array<{ toMemberId: string; toMemberName: string; amount: number }>;
  owed: Array<{ fromMemberId: string; fromMemberName: string; amount: number }>;
};

export type ExpenseWithDetails = Expense & {
  paidByName: string;
  groupName: string;
  splits: Array<{ memberId: string; memberName: string; amount: number }>;
};
