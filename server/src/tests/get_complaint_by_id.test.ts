import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { complaintsTable } from '../db/schema';
import { type GetComplaintByIdInput } from '../schema';
import { getComplaintById } from '../handlers/get_complaint_by_id';
import { eq } from 'drizzle-orm';

describe('getComplaintById', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return complaint when ID exists', async () => {
    // Create a test complaint
    const testComplaint = {
      title: 'Test Complaint',
      description: 'This is a test complaint description',
      customer_email: 'test@example.com',
      status: 'new' as const
    };

    const insertResults = await db.insert(complaintsTable)
      .values(testComplaint)
      .returning()
      .execute();

    const createdComplaint = insertResults[0];

    // Test the handler
    const input: GetComplaintByIdInput = {
      id: createdComplaint.id
    };

    const result = await getComplaintById(input);

    expect(result).not.toBeNull();
    expect(result?.id).toEqual(createdComplaint.id);
    expect(result?.title).toEqual('Test Complaint');
    expect(result?.description).toEqual('This is a test complaint description');
    expect(result?.customer_email).toEqual('test@example.com');
    expect(result?.status).toEqual('new');
    expect(result?.created_at).toBeInstanceOf(Date);
    expect(result?.updated_at).toBeInstanceOf(Date);
  });

  it('should return null when complaint ID does not exist', async () => {
    const input: GetComplaintByIdInput = {
      id: 999999 // Non-existent ID
    };

    const result = await getComplaintById(input);

    expect(result).toBeNull();
  });

  it('should return correct complaint when multiple complaints exist', async () => {
    // Create multiple test complaints
    const complaints = [
      {
        title: 'First Complaint',
        description: 'First description',
        customer_email: 'first@example.com',
        status: 'new' as const
      },
      {
        title: 'Second Complaint',
        description: 'Second description',
        customer_email: 'second@example.com',
        status: 'in_progress' as const
      },
      {
        title: 'Third Complaint',
        description: 'Third description',
        customer_email: 'third@example.com',
        status: 'resolved' as const
      }
    ];

    const insertResults = await db.insert(complaintsTable)
      .values(complaints)
      .returning()
      .execute();

    // Test fetching the middle complaint
    const targetComplaint = insertResults[1];
    const input: GetComplaintByIdInput = {
      id: targetComplaint.id
    };

    const result = await getComplaintById(input);

    expect(result).not.toBeNull();
    expect(result?.id).toEqual(targetComplaint.id);
    expect(result?.title).toEqual('Second Complaint');
    expect(result?.description).toEqual('Second description');
    expect(result?.customer_email).toEqual('second@example.com');
    expect(result?.status).toEqual('in_progress');
  });

  it('should handle different complaint statuses correctly', async () => {
    // Test each status
    const statuses = ['new', 'in_progress', 'resolved', 'rejected', 'pending_user_info'] as const;
    
    for (const status of statuses) {
      const testComplaint = {
        title: `Complaint with ${status} status`,
        description: `Description for ${status} complaint`,
        customer_email: `${status}@example.com`,
        status: status
      };

      const insertResults = await db.insert(complaintsTable)
        .values(testComplaint)
        .returning()
        .execute();

      const createdComplaint = insertResults[0];

      const input: GetComplaintByIdInput = {
        id: createdComplaint.id
      };

      const result = await getComplaintById(input);

      expect(result).not.toBeNull();
      expect(result?.status).toEqual(status);
      expect(result?.title).toEqual(`Complaint with ${status} status`);
    }
  });

  it('should verify complaint exists in database after retrieval', async () => {
    // Create a test complaint
    const testComplaint = {
      title: 'Verification Test',
      description: 'Testing database consistency',
      customer_email: 'verify@example.com',
      status: 'new' as const
    };

    const insertResults = await db.insert(complaintsTable)
      .values(testComplaint)
      .returning()
      .execute();

    const createdComplaint = insertResults[0];

    // Use handler to fetch complaint
    const input: GetComplaintByIdInput = {
      id: createdComplaint.id
    };

    const handlerResult = await getComplaintById(input);

    // Verify directly in database
    const dbResults = await db.select()
      .from(complaintsTable)
      .where(eq(complaintsTable.id, createdComplaint.id))
      .execute();

    expect(dbResults).toHaveLength(1);
    expect(handlerResult?.id).toEqual(dbResults[0].id);
    expect(handlerResult?.title).toEqual(dbResults[0].title);
    expect(handlerResult?.customer_email).toEqual(dbResults[0].customer_email);
  });
});