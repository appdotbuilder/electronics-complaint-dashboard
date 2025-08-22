import { z } from 'zod';

// Complaint status enum
export const complaintStatusSchema = z.enum([
  'new',
  'in_progress',
  'resolved',
  'rejected',
  'pending_user_info'
]);

export type ComplaintStatus = z.infer<typeof complaintStatusSchema>;

// Complaint schema with proper field handling
export const complaintSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  customer_email: z.string().email(),
  status: complaintStatusSchema,
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Complaint = z.infer<typeof complaintSchema>;

// Input schema for creating complaints
export const createComplaintInputSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  customer_email: z.string().email('Valid email is required')
});

export type CreateComplaintInput = z.infer<typeof createComplaintInputSchema>;

// Input schema for updating complaint status (admin use)
export const updateComplaintStatusInputSchema = z.object({
  id: z.number(),
  status: complaintStatusSchema
});

export type UpdateComplaintStatusInput = z.infer<typeof updateComplaintStatusInputSchema>;

// Input schema for getting complaints by customer email
export const getComplaintsByEmailInputSchema = z.object({
  customer_email: z.string().email('Valid email is required')
});

export type GetComplaintsByEmailInput = z.infer<typeof getComplaintsByEmailInputSchema>;

// Input schema for getting a single complaint by ID
export const getComplaintByIdInputSchema = z.object({
  id: z.number()
});

export type GetComplaintByIdInput = z.infer<typeof getComplaintByIdInputSchema>;