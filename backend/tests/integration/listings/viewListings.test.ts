import request from 'supertest';
import jwt from 'jsonwebtoken';
import * as listingService from '../../../src/services/listingService';

// --- 1. MOCK DATABASE & SERVICES ---
jest.mock('../../../src/config/database', () => ({
  query: jest.fn(),
  end: jest.fn(),
  connect: jest.fn(),
  on: jest.fn(),
}));

jest.mock('../../../src/services/listingService', () => ({
  getAllListings: jest.fn(),
  getUserListings: jest.fn(),
}));

jest.mock('jsonwebtoken', () => ({
  ...jest.requireActual('jsonwebtoken'),
  verify: jest.fn(),
}));

import app from '../../../src/app';
import pool from '../../../src/config/database';

const mockGetAllListings = listingService.getAllListings as jest.Mock;
const mockGetUserListings = listingService.getUserListings as jest.Mock;
const mockVerify = jwt.verify as jest.Mock;

describe('Listing Viewing Flow (Mocked DB)', () => {
  const USER_A_ID = 'user-a-123';
  const USER_B_ID = 'user-b-456';
  
  // Setup Mock Data
  const LISTING_APPROVED_A = {
    id: 'listing-a-approved',
    seller_id: USER_A_ID,
    title: 'Xe A Approved',
    status: 'approved',
    price_vnd: 500000000
  };

  const LISTING_PENDING_A = {
    id: 'listing-a-pending',
    seller_id: USER_A_ID,
    title: 'Xe A Pending',
    status: 'pending',
    price_vnd: 500000000
  };

  const LISTING_APPROVED_B = {
    id: 'listing-b-approved',
    seller_id: USER_B_ID,
    title: 'Xe B Approved',
    status: 'approved',
    price_vnd: 500000000
  };

  beforeEach(() => {
    jest.clearAllMocks();
    const defaultResponse = { items: [], total: 0 };
    mockGetAllListings.mockResolvedValue(defaultResponse);
    mockGetUserListings.mockResolvedValue(defaultResponse);
  });

  afterAll(async () => {
    if (pool.end) await pool.end();
  });

  // =================================================================
  // TEST CASE 1: PUBLIC VIEW
  // =================================================================
  it('GET /api/listings - Should return approved listings from multiple users', async () => {
    // Step 1: Mock Service to return public approved listings
    mockGetAllListings.mockResolvedValue({
      items: [LISTING_APPROVED_A, LISTING_APPROVED_B],
      total: 2
    });

    // Step 2: Execute GET request
    const res = await request(app).get('/api/listings');

    // Step 3: Verify Response Structure
    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined(); 

    // Step 4: Verify Content (Contains listings from both User A and B)
    const listingIDs = res.body.data.map((l: any) => l.id);
    expect(listingIDs).toContain(LISTING_APPROVED_A.id);
    expect(listingIDs).toContain(LISTING_APPROVED_B.id);
    expect(mockGetAllListings).toHaveBeenCalled();
  });

  // =================================================================
  // TEST CASE 2: SELF VIEW (User A)
  // =================================================================
  it('GET /api/listings/self - User A should see all their own listings', async () => {
    // Step 1: Mock Auth as User A
    mockVerify.mockReturnValue({ id: USER_A_ID, role: 'user' });

    // Step 2: Mock Service to return User A's listings (Approved & Pending)
    mockGetUserListings.mockResolvedValue({
      items: [LISTING_APPROVED_A, LISTING_PENDING_A],
      total: 2
    });

    // Step 3: Execute Request with Auth Cookie
    const res = await request(app)
      .get('/api/listings/self')
      .set('Cookie', ['jwt=mock_token_user_a']);

    // Step 4: Verify Response Status
    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();

    // Step 5: Verify Data Integrity (Contains Own Pending/Approved, Excludes Others)
    const listingIDs = res.body.data.map((l: any) => l.id);
    expect(listingIDs).toContain(LISTING_APPROVED_A.id);
    expect(listingIDs).toContain(LISTING_PENDING_A.id);
    expect(listingIDs).not.toContain(LISTING_APPROVED_B.id);
    
    // Step 6: Verify Service Call (Ensure 'status' arg allows getting all types)
    expect(mockGetUserListings).toHaveBeenCalledWith(
      USER_A_ID, 
      expect.anything(), // page
      expect.anything(), // limit
      expect.anything()  // status (expected 'all' or similar)
    );
  });

  // =================================================================
  // TEST CASE 3: SELF VIEW (User B)
  // =================================================================
  it('GET /api/listings/self - User B should only see their listings', async () => {
    // Step 1: Mock Auth as User B
    mockVerify.mockReturnValue({ id: USER_B_ID, role: 'user' });

    // Step 2: Mock Service to return only User B's listings
    mockGetUserListings.mockResolvedValue({
      items: [LISTING_APPROVED_B],
      total: 1
    });

    // Step 3: Execute Request
    const res = await request(app)
      .get('/api/listings/self')
      .set('Cookie', ['jwt=mock_token_user_b']);

    // Step 4: Verify Response
    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();

    // Step 5: Verify Isolation (Only User B data present)
    const listingIDs = res.body.data.map((l: any) => l.id);
    expect(listingIDs).toContain(LISTING_APPROVED_B.id);
    expect(listingIDs).not.toContain(LISTING_APPROVED_A.id);
  });
});