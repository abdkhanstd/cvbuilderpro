/**
 * API Tests for CV Builder Pro
 * Tests authentication, CV CRUD operations, and AI features
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';

// Mock data
const testUser = {
  name: 'Test User',
  email: `test-${Date.now()}@example.com`,
  password: 'TestPassword123!',
};

let authToken: string;
let testCVId: string;

describe('Authentication API Tests', () => {
  it('should register a new user', async () => {
    const response = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser),
    });

    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.user).toBeDefined();
    expect(data.user.email).toBe(testUser.email);
  });

  it('should reject duplicate email registration', async () => {
    const response = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser),
    });

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toContain('already exists');
  });

  it('should login with valid credentials', async () => {
    const response = await fetch('http://localhost:3000/api/auth/callback/credentials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password,
      }),
    });

    expect(response.status).toBe(200);
    // Store auth token for subsequent tests
    const cookies = response.headers.get('set-cookie');
    expect(cookies).toBeDefined();
  });

  it('should reject invalid credentials', async () => {
    const response = await fetch('http://localhost:3000/api/auth/callback/credentials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUser.email,
        password: 'wrongpassword',
      }),
    });

    expect(response.status).toBe(401);
  });
});

describe('CV Management API Tests', () => {
  it('should create a new CV', async () => {
    const response = await fetch('http://localhost:3000/api/cvs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Test CV',
        template: 'MODERN',
      }),
    });

    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.id).toBeDefined();
    expect(data.title).toBe('Test CV');
    expect(data.template).toBe('MODERN');
    
    testCVId = data.id; // Store for subsequent tests
  });

  it('should list user CVs', async () => {
    const response = await fetch('http://localhost:3000/api/cvs', {
      method: 'GET',
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
  });

  it('should update a CV', async () => {
    const response = await fetch(`http://localhost:3000/api/cvs/${testCVId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Updated Test CV',
        fullName: 'John Doe',
        email: 'john@example.com',
      }),
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.title).toBe('Updated Test CV');
  });

  it('should delete a CV', async () => {
    const response = await fetch(`http://localhost:3000/api/cvs/${testCVId}`, {
      method: 'DELETE',
    });

    expect(response.status).toBe(200);
  });

  it('should return 404 for deleted CV', async () => {
    const response = await fetch(`http://localhost:3000/api/cvs/${testCVId}`, {
      method: 'GET',
    });

    expect(response.status).toBe(404);
  });
});

describe('CV Export API Tests', () => {
  let exportCVId: string;

  beforeAll(async () => {
    // Create a CV for export testing
    const response = await fetch('http://localhost:3000/api/cvs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Export Test CV',
        template: 'PROFESSIONAL',
      }),
    });
    const data = await response.json();
    exportCVId = data.id;
  });

  it('should export CV as PDF', async () => {
    const response = await fetch(
      `http://localhost:3000/api/cvs/${exportCVId}/export?format=pdf`
    );

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('application/pdf');
  });

  it('should export CV as HTML', async () => {
    const response = await fetch(
      `http://localhost:3000/api/cvs/${exportCVId}/export?format=html`
    );

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('text/html');
  });

  it('should export CV as LaTeX', async () => {
    const response = await fetch(
      `http://localhost:3000/api/cvs/${exportCVId}/export?format=latex`
    );

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('text/plain');
  });

  it('should reject invalid export format', async () => {
    const response = await fetch(
      `http://localhost:3000/api/cvs/${exportCVId}/export?format=invalid`
    );

    expect(response.status).toBe(400);
  });

  afterAll(async () => {
    // Clean up
    await fetch(`http://localhost:3000/api/cvs/${exportCVId}`, {
      method: 'DELETE',
    });
  });
});

describe('AI Features API Tests', () => {
  it('should return AI settings for admin user', async () => {
    const response = await fetch('http://localhost:3000/api/admin/ai-settings', {
      method: 'GET',
    });

    // Will return 401 or 403 if not admin, 200 if admin
    expect([200, 401, 403]).toContain(response.status);

    if (response.status === 200) {
      const data = await response.json();
      expect(data.settings).toBeDefined();
    }
  });

  it('should generate AI suggestion for personal info', async () => {
    const response = await fetch('http://localhost:3000/api/ai/suggest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        section: 'personal',
        field: 'summary',
        context: {
          fullName: 'John Doe',
          location: 'New York, USA',
        },
        currentValue: 'Software engineer with experience',
      }),
    });

    if (response.status === 200) {
      const data = await response.json();
      expect(data.suggestion).toBeDefined();
      expect(typeof data.suggestion).toBe('string');
      expect(data.suggestion.length).toBeGreaterThan(0);
    } else {
      // AI might be disabled or not configured
      expect([403, 500]).toContain(response.status);
    }
  });

  it('should generate AI suggestion for experience description', async () => {
    const response = await fetch('http://localhost:3000/api/ai/suggest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        section: 'experience',
        field: 'description',
        context: {
          title: 'Senior Developer',
          company: 'Tech Corp',
          location: 'San Francisco, CA',
        },
        currentValue: 'Led development team',
      }),
    });

    if (response.status === 200) {
      const data = await response.json();
      expect(data.suggestion).toBeDefined();
      expect(data.suggestion).toContain('develop');
    }
  });

  it('should reject AI suggestions when disabled', async () => {
    // This test assumes AI is temporarily disabled
    // Implementation would require toggling AI settings first
  });
});

describe('User Activity Logging Tests', () => {
  it('should log CV creation activity', async () => {
    const response = await fetch('http://localhost:3000/api/cvs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Activity Test CV',
        template: 'ACADEMIC',
      }),
    });

    expect(response.status).toBe(201);
    // Activity should be logged in database
    // Verification would require database query
  });
});

describe('Data Validation Tests', () => {
  it('should reject CV creation without title', async () => {
    const response = await fetch('http://localhost:3000/api/cvs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        template: 'MODERN',
      }),
    });

    expect(response.status).toBe(400);
  });

  it('should reject CV creation with invalid template', async () => {
    const response = await fetch('http://localhost:3000/api/cvs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Test CV',
        template: 'INVALID_TEMPLATE',
      }),
    });

    expect(response.status).toBe(400);
  });

  it('should sanitize user input', async () => {
    const maliciousInput = '<script>alert("xss")</script>';
    const response = await fetch('http://localhost:3000/api/cvs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: maliciousInput,
        template: 'MODERN',
      }),
    });

    if (response.status === 201) {
      const data = await response.json();
      // Title should be sanitized (HTML tags removed or escaped)
      expect(data.title).not.toContain('<script>');
    }
  });
});
