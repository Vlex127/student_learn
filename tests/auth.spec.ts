import { test, expect } from '@playwright/test';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const TEST_EMAIL = 'min@example.com';
const TEST_PASSWORD = 'admin123';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    // Start from the home page
    await page.goto(`${BASE_URL}/auth`);
  });

  test('should allow user to log in and see their email in the navigation', async ({ page }) => {
    // Fill in the login form
    await page.fill('input[name="email"]', TEST_EMAIL);
    await page.fill('input[name="password"]', TEST_PASSWORD);
    
    // Click the login button
    await page.click('button[type="submit"]');
    
    // Wait for navigation to complete after login
    await page.waitForURL(`${BASE_URL}/**`);
    
    // Verify the URL changed from the login page
    expect(page.url()).not.toContain('/auth');
    
    // Check if the navigation shows the user's email
    const userEmail = page.locator('p:has-text("min@example.com")');
    await expect(userEmail).toBeVisible({ timeout: 10000 });
    
    // Take a screenshot for debugging
    await page.screenshot({ path: 'test-results/logged-in.png' });
  });

  test('should show error with invalid credentials', async ({ page }) => {
    // Fill in the login form with invalid credentials
    await page.fill('input[name="email"]', 'invalid@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    
    // Click the login button
    await page.click('button[type="submit"]');
    
    // Check for error message
    const errorMessage = page.locator('text=Authentication failed');
    await expect(errorMessage).toBeVisible({ timeout: 5000 });
  });
});
