import { db } from '../db';
import { complaintsTable } from '../db/schema';
import { type GetComplaintsByEmailInput, type Complaint } from '../schema';
import { eq, desc } from 'drizzle-orm';

export async function getComplaintsByEmail(input: GetComplaintsByEmailInput): Promise<Complaint[]> {
  try {
    // Query complaints for the specific customer email, ordered by created_at descending
    const results = await db.select()
      .from(complaintsTable)
      .where(eq(complaintsTable.customer_email, input.customer_email))
      .orderBy(desc(complaintsTable.created_at))
      .execute();

    return results;
  } catch (error) {
    console.error('Failed to get complaints by email:', error);
    throw error;
  }
}