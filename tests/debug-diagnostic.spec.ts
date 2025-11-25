import { test, expect } from '@playwright/test';

test('Debug diagnostic flow - hover and click options', async ({ page }) => {
  // Navigate to the app
  await page.goto('http://localhost:5000');

  // Click "Free Diagnostic" to start
  await page.getByTestId('button-start-diagnostic').click();

  // Wait for first question to appear
  await page.waitForTimeout(2000);

  // Take screenshot of Question 1
  await page.screenshot({ path: 'debug-q1-initial.png', fullPage: true });
  console.log('Screenshot 1: Initial state');

  // Hover over first option
  const option0 = page.getByTestId('option-0');
  await option0.hover();
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'debug-q1-hover-option0.png', fullPage: true });
  console.log('Screenshot 2: Hovering option 0');

  // Hover over second option
  const option1 = page.getByTestId('option-1');
  await option1.hover();
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'debug-q1-hover-option1.png', fullPage: true });
  console.log('Screenshot 3: Hovering option 1');

  // Hover over third option
  const option2 = page.getByTestId('option-2');
  await option2.hover();
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'debug-q1-hover-option2.png', fullPage: true });
  console.log('Screenshot 4: Hovering option 2');

  // Click the first option
  await option0.click();
  await page.waitForTimeout(2000);

  // Take screenshot of Question 2
  await page.screenshot({ path: 'debug-q2.png', fullPage: true });
  console.log('Screenshot 5: Question 2');

  // Click second question option
  await page.getByTestId('option-0').click();
  await page.waitForTimeout(2000);

  // Continue through remaining questions quickly
  for (let i = 3; i <= 7; i++) {
    await page.getByTestId('option-0').click();
    await page.waitForTimeout(2000);
  }

  // Screenshot of results
  await page.screenshot({ path: 'debug-results.png', fullPage: true });
  console.log('Screenshot 6: Results page');

  // Wait for "Get My Full PDF Report" button
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'debug-pdf-button.png', fullPage: true });
  console.log('Screenshot 7: PDF Report button');

  // Click "Get My Full PDF Report"
  const pdfButton = page.getByTestId('button-get-report');
  if (await pdfButton.isVisible()) {
    await pdfButton.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'debug-email-form.png', fullPage: true });
    console.log('Screenshot 8: Email form');
  }
});
