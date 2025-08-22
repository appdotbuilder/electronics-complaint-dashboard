import { db } from '../db';
import { complaintsTable } from '../db/schema';
import { type CreateComplaintInput, type Complaint } from '../schema';

export const createComplaint = async (input: CreateComplaintInput): Promise<Complaint> => {
  try {
    // Insert complaint record with default status 'new'
    const result = await db.insert(complaintsTable)
      .values({
        title: input.title,
        description: input.description,
        customer_email: input.customer_email,
        status: 'new' // Default status as specified in schema
      })
      .returning()
      .execute();

    // Return the created complaint
    const complaint = result[0];
    return complaint;
  } catch (error) {
    console.error('Complaint creation failed:', error);
    throw error;
  }
};