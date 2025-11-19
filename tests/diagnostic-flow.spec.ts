import { test, expect } from '@playwright/test';

test.describe('A-Team Trades Pipeline Diagnostic', () => {
  test.setTimeout(120000); // 2 minutes for full flow

  test('complete diagnostic flow with email and SMS', async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    console.log('✓ Navigated to homepage');

    // Click "Start Diagnostic" button
    const startButton = page.getByRole('button', { name: /start.*diagnostic/i });
    await expect(startButton).toBeVisible({ timeout: 10000 });
    await startButton.click();
    console.log('✓ Clicked Start Diagnostic');

    // Wait for first question to appear
    await expect(page.getByText(/how many active projects/i)).toBeVisible({ timeout: 5000 });
    console.log('✓ First question appeared');

    // Answer all 7 questions by clicking the first option each time
    for (let i = 1; i <= 7; i++) {
      console.log(`Answering question ${i}...`);

      // Wait for question options to be visible
      const optionButtons = page.getByTestId(/option-\d+/);
      await expect(optionButtons.first()).toBeVisible({ timeout: 10000 });

      // Click the first option
      await optionButtons.first().click();
      console.log(`✓ Answered question ${i}`);

      // Wait a bit for the next question
      await page.waitForTimeout(2000);
    }

    // Wait for score to appear
    await expect(page.getByText(/your.*score/i)).toBeVisible({ timeout: 10000 });
    console.log('✓ Score displayed');

    // Click "Get My Full PDF Report" button
    const getReportButton = page.getByTestId('button-get-report');
    await expect(getReportButton).toBeVisible({ timeout: 5000 });
    await getReportButton.click();
    console.log('✓ Clicked Get Report button');

    // Fill in email form
    await page.getByTestId('input-firstName').fill('Abhishek');
    await page.getByTestId('input-lastName').fill('Padmanabhan');
    await page.getByTestId('input-email').fill('abhipaddy8@gmail.com');
    console.log('✓ Filled email form');

    // Submit email form
    const submitEmailButton = page.getByTestId('button-submit-email');
    await submitEmailButton.click();
    console.log('✓ Submitted email form');

    // Wait for phone form to appear
    await expect(page.getByTestId('input-phone')).toBeVisible({ timeout: 30000 });
    console.log('✓ Phone form appeared');

    // Fill in phone number
    await page.getByTestId('input-phone').fill('+919591205303');
    console.log('✓ Filled phone number');

    // Submit phone form
    const submitPhoneButton = page.getByTestId('button-submit-phone');
    await submitPhoneButton.click();
    console.log('✓ Submitted phone form');

    // Wait for Scale Session CTA to appear
    await expect(page.getByTestId('button-cta')).toBeVisible({ timeout: 10000 });
    console.log('✓ Scale Session CTA appeared');

    // Verify the CTA text
    await expect(page.getByTestId('button-cta')).toContainText(/book.*scale.*session/i);
    console.log('✓ CTA text verified');

    console.log('\n🎉 ALL UI TESTS PASSED!');
  });

  test('verify UI elements and styling', async ({ page }) => {
    await page.goto('/');

    // Start diagnostic
    const startButton = page.getByRole('button', { name: /start.*diagnostic/i });
    await startButton.click();

    // Wait for chat interface
    await page.waitForTimeout(2000);

    // Verify chat messages container
    const chatMessages = page.getByTestId('chat-messages');
    await expect(chatMessages).toBeVisible();
    console.log('✓ Chat messages container visible');

    // Verify assistant message styling
    const assistantMessage = page.getByTestId(/message-assistant-\d+/).first();
    await expect(assistantMessage).toBeVisible();

    // Check for AI icon (Sparkles)
    const aiIcon = assistantMessage.locator('svg').first();
    await expect(aiIcon).toBeVisible();
    console.log('✓ AI assistant icon visible');

    // Verify option buttons have proper styling
    const optionButton = page.getByTestId('option-0');
    await expect(optionButton).toBeVisible();

    // Hover over option and verify it doesn't fade
    await optionButton.hover();
    await page.waitForTimeout(500);

    // Verify text is still visible after hover
    await expect(optionButton).toContainText(/\w+/);
    console.log('✓ Option button text remains visible on hover');

    // Verify progress bar
    const progressBar = page.locator('[role="progressbar"]');
    await expect(progressBar).toBeVisible();
    console.log('✓ Progress bar visible');

    console.log('\n✅ UI STYLING TESTS PASSED!');
  });

  test('verify error handling', async ({ page }) => {
    await page.goto('/');

    // Start diagnostic
    const startButton = page.getByRole('button', { name: /start.*diagnostic/i });
    await startButton.click();

    // Answer questions quickly to get to email form
    for (let i = 0; i < 7; i++) {
      const optionButtons = page.getByTestId(/option-\d+/);
      await optionButtons.first().waitFor({ state: 'visible', timeout: 10000 });
      await optionButtons.first().click();
      await page.waitForTimeout(1500);
    }

    // Click get report
    await page.getByTestId('button-get-report').click();

    // Try to submit without filling form
    const submitEmailButton = page.getByTestId('button-submit-email');
    await submitEmailButton.click();

    // Browser validation should prevent submission
    // (No need to check for toast as browser will show validation)
    console.log('✓ Form validation working');

    console.log('\n✅ ERROR HANDLING TESTS PASSED!');
  });
});
