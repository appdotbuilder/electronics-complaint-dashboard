import { serial, text, pgTable, timestamp, pgEnum } from 'drizzle-orm/pg-core';

// Complaint status enum for the database
export const complaintStatusEnum = pgEnum('complaint_status', [
  'new',
  'in_progress', 
  'resolved',
  'rejected',
  'pending_user_info'
]);

// Complaints table
export const complaintsTable = pgTable('complaints', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  customer_email: text('customer_email').notNull(),
  status: complaintStatusEnum('status').notNull().default('new'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// TypeScript types for the table schema
export type Complaint = typeof complaintsTable.$inferSelect; // For SELECT operations
export type NewComplaint = typeof complaintsTable.$inferInsert; // For INSERT operations

// Export all tables for proper query building
export const tables = { complaints: complaintsTable };