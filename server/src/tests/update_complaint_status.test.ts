import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { complaintsTable } from '../db/schema';
import { type UpdateComplaintStatusInput, type CreateComplaintInput } from '../schema';
import { updateComplaintStatus } from '../handlers/update_complaint_status';
import { eq } from 'drizzle-orm';

// Test data for creating a complaint first
const testComplaintInput: CreateComplaintInput = {
  title: 'Test Complaint',
  description: 'This is a test complaint for status update testing',
  customer_email: 'test@example.com'
};

describe('updateComplaintStatus', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update complaint status successfully', async () => {
    // First create a complaint
    const createResult = await db.insert(complaintsTable)
      .values({
        title: testComplaintInput.title,
        description: testComplaintInput.description,
        customer_email: testComplaintInput.customer_email,
        status: 'new'
      })
      .returning()
      .execute();

    const createdComplaint = createResult[0];
    const originalUpdatedAt = createdComplaint.updated_at;

    // Small delay to ensure updated_at timestamp changes
    await new Promise(resolve => setTimeout(resolve, 10));

    // Update the status
    const updateInput: UpdateComplaintStatusInput = {
      id: createdComplaint.id,
      status: 'in_progress'
    };

    const result = await updateComplaintStatus(updateInput);

    // Verify the update
    expect(result.id).toEqual(createdComplaint.id);
    expect(result.title).toEqual(testComplaintInput.title);
    expect(result.description).toEqual(testComplaintInput.description);
    expect(result.customer_email).toEqual(testComplaintInput.customer_email);
    expect(result.status).toEqual('in_progress');
    expect(result.created_at).toEqual(createdComplaint.created_at);
    expect(result.updated_at).not.toEqual(originalUpdatedAt);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save updated status to database', async () => {
    // Create a complaint
    const createResult = await db.insert(complaintsTable)
      .values({
        title: testComplaintInput.title,
        description: testComplaintInput.description,
        customer_email: testComplaintInput.customer_email,
        status: 'new'
      })
      .returning()
      .execute();

    const createdComplaint = createResult[0];

    // Update the status
    const updateInput: UpdateComplaintStatusInput = {
      id: createdComplaint.id,
      status: 'resolved'
    };

    await updateComplaintStatus(updateInput);

    // Verify in database
    const dbResult = await db.select()
      .from(complaintsTable)
      .where(eq(complaintsTable.id, createdComplaint.id))
      .execute();

    expect(dbResult).toHaveLength(1);
    expect(dbResult[0].status).toEqual('resolved');
    expect(dbResult[0].updated_at).not.toEqual(createdComplaint.updated_at);
  });

  it('should handle all valid status values', async () => {
    // Create a complaint
    const createResult = await db.insert(complaintsTable)
      .values({
        title: testComplaintInput.title,
        description: testComplaintInput.description,
        customer_email: testComplaintInput.customer_email,
        status: 'new'
      })
      .returning()
      .execute();

    const complaintId = createResult[0].id;
    const validStatuses = ['new', 'in_progress', 'resolved', 'rejected', 'pending_user_info'] as const;

    // Test each valid status
    for (const status of validStatuses) {
      const updateInput: UpdateComplaintStatusInput = {
        id: complaintId,
        status: status
      };

      const result = await updateComplaintStatus(updateInput);
      expect(result.status).toEqual(status);

      // Verify in database
      const dbResult = await db.select()
        .from(complaintsTable)
        .where(eq(complaintsTable.id, complaintId))
        .execute();

      expect(dbResult[0].status).toEqual(status);
    }
  });

  it('should throw error when complaint does not exist', async () => {
    const updateInput: UpdateComplaintStatusInput = {
      id: 99999, // Non-existent ID
      status: 'resolved'
    };

    await expect(updateComplaintStatus(updateInput)).rejects.toThrow(/complaint with id 99999 not found/i);
  });

  it('should update timestamp correctly', async () => {
    // Create a complaint
    const createResult = await db.insert(complaintsTable)
      .values({
        title: testComplaintInput.title,
        description: testComplaintInput.description,
        customer_email: testComplaintInput.customer_email,
        status: 'new'
      })
      .returning()
      .execute();

    const createdComplaint = createResult[0];
    const originalCreatedAt = createdComplaint.created_at;
    const originalUpdatedAt = createdComplaint.updated_at;

    // Wait a moment to ensure timestamp difference
    await new Promise(resolve => setTimeout(resolve, 10));

    // Update the status
    const updateInput: UpdateComplaintStatusInput = {
      id: createdComplaint.id,
      status: 'in_progress'
    };

    const result = await updateComplaintStatus(updateInput);

    // Verify timestamps
    expect(result.created_at).toEqual(originalCreatedAt); // Should not change
    expect(result.updated_at).not.toEqual(originalUpdatedAt); // Should change
    expect(result.updated_at.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
  });

  it('should preserve other fields when updating status', async () => {
    // Create a complaint
    const createResult = await db.insert(complaintsTable)
      .values({
        title: testComplaintInput.title,
        description: testComplaintInput.description,
        customer_email: testComplaintInput.customer_email,
        status: 'new'
      })
      .returning()
      .execute();

    const createdComplaint = createResult[0];

    // Update only the status
    const updateInput: UpdateComplaintStatusInput = {
      id: createdComplaint.id,
      status: 'resolved'
    };

    const result = await updateComplaintStatus(updateInput);

    // Verify all other fields remain unchanged
    expect(result.id).toEqual(createdComplaint.id);
    expect(result.title).toEqual(createdComplaint.title);
    expect(result.description).toEqual(createdComplaint.description);
    expect(result.customer_email).toEqual(createdComplaint.customer_email);
    expect(result.created_at).toEqual(createdComplaint.created_at);
    
    // Only status and updated_at should change
    expect(result.status).toEqual('resolved');
    expect(result.status).not.toEqual(createdComplaint.status);
  });
});