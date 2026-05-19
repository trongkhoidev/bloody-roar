import { test, expect } from '@playwright/test';

test.describe('Chatbox Real-time Communication', () => {
  test('Users can exchange messages in real-time and sensitive data is masked', async ({ browser }) => {
    // 1. Setup two separate browser contexts for User A and User B
    const contextA = await browser.newContext();
    const contextB = await browser.newContext();
    
    const pageA = await contextA.newPage();
    const pageB = await contextB.newPage();

    // 2. Login User A (Poster)
    await pageA.goto('http://localhost:5173/login');
    await pageA.fill('input[name="email"]', 'poster@test.com');
    await pageA.fill('input[name="password"]', 'password123');
    await pageA.click('button[type="submit"]');
    
    // 3. Login User B (Solver)
    await pageB.goto('http://localhost:5173/login');
    await pageB.fill('input[name="email"]', 'solver@test.com');
    await pageB.fill('input[name="password"]', 'password123');
    await pageB.click('button[type="submit"]');

    // 4. Both users open the chat widget
    await pageA.click('button[aria-label="Open Chat"]'); // Needs aria-label added to ChatWidget button
    await pageB.click('button[aria-label="Open Chat"]');

    // Select the active task chat
    await pageA.click('text="Solve frontend issue"');
    await pageB.click('text="Solve frontend issue"');

    // 5. User A sends a message
    const messageFromA = "Hello! Can you help me fix this?";
    await pageA.fill('input[placeholder="Type a message..."]', messageFromA);
    await pageA.press('input[placeholder="Type a message..."]', 'Enter');

    // 6. User B verifies receiving the message
    await expect(pageB.locator(`text="${messageFromA}"`)).toBeVisible();

    // 7. User B sends a message with sensitive API key
    const secretKeyMessage = "Sure! Here is the api key: sk-1234567890abcdef";
    await pageB.fill('input[placeholder="Type a message..."]', secretKeyMessage);
    await pageB.press('input[placeholder="Type a message..."]', 'Enter');

    // 8. User A verifies receiving the message but the API key is masked by AI
    await expect(pageA.locator('text="Sure! Here is the api key: [MASKED_API_KEY]"')).toBeVisible();

    // 9. Cleanup
    await contextA.close();
    await contextB.close();
  });
});
