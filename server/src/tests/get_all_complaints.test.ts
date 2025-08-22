import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { complaintsTable } from '../db/schema';
import { getAllComplaints } from '../handlers/get_all_complaints';

describe('getAllComplaints', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no complaints exist', async () => {
    const result = await getAllComplaints();

    expect(result).toEqual([]);
    expect(result).toHaveLength(0);
  });

  it('should return all complaints ordered by created_at descending', async () => {
    // Create test complaints with different timestamps
    const complaint1 = await db.insert(complaintsTable)
      .values({
        title: 'First Complaint',
        description: 'This was created first',
        customer_email: 'customer1@example.com',
        status: 'new'
      })
      .returning()
      .execute();

    // Add small delay to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    const complaint2 = await db.insert(complaintsTable)
      .values({
        title: 'Second Complaint',
        description: 'This was created second',
        customer_email: 'customer2@example.com',
        status: 'in_progress'
      })
      .returning()
      .execute();

    await new Promise(resolve => setTimeout(resolve, 10));

    const complaint3 = await db.insert(complaintsTable)
      .values({
        title: 'Third Complaint',
        description: 'This was created third',
        customer_email: 'customer3@example.com',
        status: 'resolved'
      })
      .returning()
      .execute();

    const result = await getAllComplaints();

    // Should return 3 complaints
    expect(result).toHaveLength(3);

    // Should be ordered by created_at descending (newest first)
    expect(result[0].title).toEqual('Third Complaint');
    expect(result[1].title).toEqual('Second Complaint');
    expect(result[2].title).toEqual('First Complaint');

    // Verify all expected fields are present
    result.forEach(complaint => {
      expect(complaint.id).toBeDefined();
      expect(complaint.title).toBeDefined();
      expect(complaint.description).toBeDefined();
      expect(complaint.customer_email).toBeDefined();
      expect(complaint.status).toBeDefined();
      expect(complaint.created_at).toBeInstanceOf(Date);
      expect(complaint.updated_at).toBeInstanceOf(Date);
    });

    // Verify specific complaint data
    expect(result[0].status).toEqual('resolved');
    expect(result[1].status).toEqual('in_progress');
    expect(result[2].status).toEqual('new');
  });

  it('should return complaints with all different status types', async () => {
    // Create complaints with different status values
    const statuses = ['new', 'in_progress', 'resolved', 'rejected', 'pending_user_info'] as const;
    
    for (let i = 0; i < statuses.length; i++) {
      await db.insert(complaintsTable)
        .values({
          title: `Complaint ${i + 1}`,
          description: `Description for complaint ${i + 1}`,
          customer_email: `customer${i + 1}@example.com`,
          status: statuses[i]
        })
        .execute();
    }

    const result = await getAllComplaints();

    expect(result).toHaveLength(5);
    
    // Verify all status types are present
    const resultStatuses = result.map(c => c.status);
    statuses.forEach(status => {
      expect(resultStatuses).toContain(status);
    });
  });

  it('should handle large number of complaints', async () => {
    // Create multiple complaints
    const complaints = [];
    for (let i = 1; i <= 50; i++) {
      complaints.push({
        title: `Complaint ${i}`,
        description: `Description for complaint ${i}`,
        customer_email: `customer${i}@example.com`,
        status: i % 2 === 0 ? 'new' as const : 'resolved' as const
      });
    }

    await db.insert(complaintsTable)
      .values(complaints)
      .execute();

    const result = await getAllComplaints();

    expect(result).toHaveLength(50);
    
    // Verify ordering - check that created_at is in descending order
    for (let i = 0; i < result.length - 1; i++) {
      expect(result[i].created_at >= result[i + 1].created_at).toBe(true);
    }
  });

  it('should return complaints with proper data types', async () => {
    await db.insert(complaintsTable)
      .values({
        title: 'Type Test Complaint',
        description: 'Testing data types',
        customer_email: 'types@example.com',
        status: 'new'
      })
      .execute();

    const result = await getAllComplaints();

    expect(result).toHaveLength(1);
    
    const complaint = result[0];
    expect(typeof complaint.id).toBe('number');
    expect(typeof complaint.title).toBe('string');
    expect(typeof complaint.description).toBe('string');
    expect(typeof complaint.customer_email).toBe('string');
    expect(typeof complaint.status).toBe('string');
    expect(complaint.created_at).toBeInstanceOf(Date);
    expect(complaint.updated_at).toBeInstanceOf(Date);
  });
});