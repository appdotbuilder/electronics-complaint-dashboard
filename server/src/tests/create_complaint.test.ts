import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { complaintsTable } from '../db/schema';
import { type CreateComplaintInput } from '../schema';
import { createComplaint } from '../handlers/create_complaint';
import { eq } from 'drizzle-orm';

// Simple test input
const testInput: CreateComplaintInput = {
  title: 'Defective product received',
  description: 'The product I ordered arrived with a crack and is unusable',
  customer_email: 'customer@example.com'
};

describe('createComplaint', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a complaint with correct fields', async () => {
    const result = await createComplaint(testInput);

    // Basic field validation
    expect(result.title).toEqual('Defective product received');
    expect(result.description).toEqual(testInput.description);
    expect(result.customer_email).toEqual('customer@example.com');
    expect(result.status).toEqual('new');
    expect(result.id).toBeDefined();
    expect(typeof result.id).toBe('number');
    expect(result.id).toBeGreaterThan(0);
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save complaint to database correctly', async () => {
    const result = await createComplaint(testInput);

    // Query using proper drizzle syntax
    const complaints = await db.select()
      .from(complaintsTable)
      .where(eq(complaintsTable.id, result.id))
      .execute();

    expect(complaints).toHaveLength(1);
    expect(complaints[0].title).toEqual('Defective product received');
    expect(complaints[0].description).toEqual(testInput.description);
    expect(complaints[0].customer_email).toEqual('customer@example.com');
    expect(complaints[0].status).toEqual('new');
    expect(complaints[0].created_at).toBeInstanceOf(Date);
    expect(complaints[0].updated_at).toBeInstanceOf(Date);
  });

  it('should set default status to new', async () => {
    const result = await createComplaint(testInput);

    expect(result.status).toEqual('new');

    // Verify in database
    const complaints = await db.select()
      .from(complaintsTable)
      .where(eq(complaintsTable.id, result.id))
      .execute();

    expect(complaints[0].status).toEqual('new');
  });

  it('should handle different email formats correctly', async () => {
    const inputWithDifferentEmail: CreateComplaintInput = {
      ...testInput,
      customer_email: 'test.user+complaints@company.co.uk'
    };

    const result = await createComplaint(inputWithDifferentEmail);

    expect(result.customer_email).toEqual('test.user+complaints@company.co.uk');
    
    // Verify in database
    const complaints = await db.select()
      .from(complaintsTable)
      .where(eq(complaintsTable.id, result.id))
      .execute();

    expect(complaints[0].customer_email).toEqual('test.user+complaints@company.co.uk');
  });

  it('should handle long descriptions correctly', async () => {
    const longDescription = 'This is a very long complaint description that contains multiple sentences and detailed information about the issue. '.repeat(10);
    
    const inputWithLongDescription: CreateComplaintInput = {
      ...testInput,
      description: longDescription
    };

    const result = await createComplaint(inputWithLongDescription);

    expect(result.description).toEqual(longDescription);
    expect(result.description.length).toBeGreaterThan(500);

    // Verify in database
    const complaints = await db.select()
      .from(complaintsTable)
      .where(eq(complaintsTable.id, result.id))
      .execute();

    expect(complaints[0].description).toEqual(longDescription);
  });

  it('should create multiple complaints with unique IDs', async () => {
    const input1: CreateComplaintInput = {
      title: 'First complaint',
      description: 'First issue description',
      customer_email: 'customer1@example.com'
    };

    const input2: CreateComplaintInput = {
      title: 'Second complaint',
      description: 'Second issue description',
      customer_email: 'customer2@example.com'
    };

    const result1 = await createComplaint(input1);
    const result2 = await createComplaint(input2);

    // Verify unique IDs
    expect(result1.id).not.toEqual(result2.id);
    expect(result1.title).toEqual('First complaint');
    expect(result2.title).toEqual('Second complaint');

    // Verify both exist in database
    const allComplaints = await db.select()
      .from(complaintsTable)
      .execute();

    expect(allComplaints).toHaveLength(2);
    
    const titles = allComplaints.map(c => c.title).sort();
    expect(titles).toEqual(['First complaint', 'Second complaint']);
  });

  it('should set created_at and updated_at timestamps correctly', async () => {
    const beforeCreation = new Date();
    
    const result = await createComplaint(testInput);
    
    const afterCreation = new Date();

    // Timestamps should be within reasonable range
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.created_at.getTime()).toBeGreaterThanOrEqual(beforeCreation.getTime());
    expect(result.created_at.getTime()).toBeLessThanOrEqual(afterCreation.getTime());
    expect(result.updated_at.getTime()).toBeGreaterThanOrEqual(beforeCreation.getTime());
    expect(result.updated_at.getTime()).toBeLessThanOrEqual(afterCreation.getTime());

    // For new complaints, created_at and updated_at should be very close
    const timeDiff = Math.abs(result.updated_at.getTime() - result.created_at.getTime());
    expect(timeDiff).toBeLessThan(1000); // Less than 1 second difference
  });
});