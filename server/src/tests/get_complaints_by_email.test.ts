import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { complaintsTable } from '../db/schema';
import { type GetComplaintsByEmailInput } from '../schema';
import { getComplaintsByEmail } from '../handlers/get_complaints_by_email';

// Test input
const testInput: GetComplaintsByEmailInput = {
  customer_email: 'customer@example.com'
};

describe('getComplaintsByEmail', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no complaints exist for email', async () => {
    const result = await getComplaintsByEmail(testInput);
    
    expect(result).toEqual([]);
  });

  it('should return complaints for specific customer email', async () => {
    // Create test complaints for target customer
    await db.insert(complaintsTable).values([
      {
        title: 'First Complaint',
        description: 'Description of first complaint',
        customer_email: 'customer@example.com',
        status: 'new'
      },
      {
        title: 'Second Complaint',
        description: 'Description of second complaint',
        customer_email: 'customer@example.com',
        status: 'in_progress'
      }
    ]).execute();

    // Create complaint for different customer
    await db.insert(complaintsTable).values({
      title: 'Other Customer Complaint',
      description: 'Different customer complaint',
      customer_email: 'other@example.com',
      status: 'resolved'
    }).execute();

    const result = await getComplaintsByEmail(testInput);

    expect(result).toHaveLength(2);
    result.forEach(complaint => {
      expect(complaint.customer_email).toEqual('customer@example.com');
      expect(complaint.id).toBeDefined();
      expect(complaint.title).toBeDefined();
      expect(complaint.description).toBeDefined();
      expect(complaint.status).toBeDefined();
      expect(complaint.created_at).toBeInstanceOf(Date);
      expect(complaint.updated_at).toBeInstanceOf(Date);
    });
  });

  it('should return complaints ordered by created_at descending (newest first)', async () => {
    // Insert complaints with artificial delay to ensure different timestamps
    await db.insert(complaintsTable).values({
      title: 'First Created',
      description: 'This was created first',
      customer_email: 'customer@example.com',
      status: 'new'
    }).execute();

    // Small delay to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    await db.insert(complaintsTable).values({
      title: 'Second Created',
      description: 'This was created second',
      customer_email: 'customer@example.com',
      status: 'new'
    }).execute();

    await new Promise(resolve => setTimeout(resolve, 10));

    await db.insert(complaintsTable).values({
      title: 'Third Created',
      description: 'This was created third',
      customer_email: 'customer@example.com',
      status: 'new'
    }).execute();

    const result = await getComplaintsByEmail(testInput);

    expect(result).toHaveLength(3);
    
    // Verify ordering - newest first
    expect(result[0].title).toEqual('Third Created');
    expect(result[1].title).toEqual('Second Created');
    expect(result[2].title).toEqual('First Created');
    
    // Verify timestamps are in descending order
    expect(result[0].created_at >= result[1].created_at).toBe(true);
    expect(result[1].created_at >= result[2].created_at).toBe(true);
  });

  it('should not return complaints for different email addresses', async () => {
    // Create complaints for different customers
    await db.insert(complaintsTable).values([
      {
        title: 'Customer A Complaint',
        description: 'Complaint from customer A',
        customer_email: 'customera@example.com',
        status: 'new'
      },
      {
        title: 'Customer B Complaint',
        description: 'Complaint from customer B',
        customer_email: 'customerb@example.com',
        status: 'resolved'
      }
    ]).execute();

    // Query for customer A
    const resultA = await getComplaintsByEmail({
      customer_email: 'customera@example.com'
    });

    // Query for customer B
    const resultB = await getComplaintsByEmail({
      customer_email: 'customerb@example.com'
    });

    expect(resultA).toHaveLength(1);
    expect(resultA[0].customer_email).toEqual('customera@example.com');
    expect(resultA[0].title).toEqual('Customer A Complaint');

    expect(resultB).toHaveLength(1);
    expect(resultB[0].customer_email).toEqual('customerb@example.com');
    expect(resultB[0].title).toEqual('Customer B Complaint');
  });

  it('should return complaints with all different statuses', async () => {
    // Create complaints with different statuses
    await db.insert(complaintsTable).values([
      {
        title: 'New Complaint',
        description: 'A new complaint',
        customer_email: 'customer@example.com',
        status: 'new'
      },
      {
        title: 'In Progress Complaint',
        description: 'A complaint in progress',
        customer_email: 'customer@example.com',
        status: 'in_progress'
      },
      {
        title: 'Resolved Complaint',
        description: 'A resolved complaint',
        customer_email: 'customer@example.com',
        status: 'resolved'
      },
      {
        title: 'Rejected Complaint',
        description: 'A rejected complaint',
        customer_email: 'customer@example.com',
        status: 'rejected'
      },
      {
        title: 'Pending Info Complaint',
        description: 'A complaint pending user info',
        customer_email: 'customer@example.com',
        status: 'pending_user_info'
      }
    ]).execute();

    const result = await getComplaintsByEmail(testInput);

    expect(result).toHaveLength(5);
    
    const statuses = result.map(complaint => complaint.status);
    expect(statuses).toContain('new');
    expect(statuses).toContain('in_progress');
    expect(statuses).toContain('resolved');
    expect(statuses).toContain('rejected');
    expect(statuses).toContain('pending_user_info');
  });
});