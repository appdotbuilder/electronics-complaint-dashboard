import { db } from '../db';
import { complaintsTable } from '../db/schema';
import { type UpdateComplaintStatusInput, type Complaint } from '../schema';
import { eq } from 'drizzle-orm';

export async function updateComplaintStatus(input: UpdateComplaintStatusInput): Promise<Complaint> {
  try {
    // First check if the complaint exists
    const existingComplaint = await db.select()
      .from(complaintsTable)
      .where(eq(complaintsTable.id, input.id))
      .execute();

    if (existingComplaint.length === 0) {
      throw new Error(`Complaint with ID ${input.id} not found`);
    }

    // Update the complaint status and updated_at timestamp
    const result = await db.update(complaintsTable)
      .set({
        status: input.status,
        updated_at: new Date() // Explicitly set updated_at to current time
      })
      .where(eq(complaintsTable.id, input.id))
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Complaint status update failed:', error);
    throw error;
  }
}