import { db } from '../db';
import { complaintsTable } from '../db/schema';
import { type GetComplaintByIdInput, type Complaint } from '../schema';
import { eq } from 'drizzle-orm';

export const getComplaintById = async (input: GetComplaintByIdInput): Promise<Complaint | null> => {
  try {
    // Query the database for the complaint by ID
    const results = await db.select()
      .from(complaintsTable)
      .where(eq(complaintsTable.id, input.id))
      .execute();

    // Return null if no complaint found
    if (results.length === 0) {
      return null;
    }

    // Return the first (and only) result
    return results[0];
  } catch (error) {
    console.error('Failed to fetch complaint by ID:', error);
    throw error;
  }
};