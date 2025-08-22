import { db } from '../db';
import { complaintsTable } from '../db/schema';
import { type Complaint } from '../schema';
import { desc } from 'drizzle-orm';

export const getAllComplaints = async (): Promise<Complaint[]> => {
  try {
    // Query all complaints ordered by created_at descending (newest first)
    const result = await db.select()
      .from(complaintsTable)
      .orderBy(desc(complaintsTable.created_at))
      .execute();

    return result;
  } catch (error) {
    console.error('Failed to fetch all complaints:', error);
    throw error;
  }
};