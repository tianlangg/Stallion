import { expect, test } from '@playwright/test';

test('375 px hall tabs, search, details switch, filters, and sourced detail', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Stallion/i })).toBeVisible();
  await expect(page.locator('.restroom-card')).toHaveCount(4);
  const information = page.getByRole('switch', { name: 'More information' });
  await expect(information).not.toBeChecked();
  await expect(page.getByText('Accessibility: Unknown')).toHaveCount(0);
  await information.check();
  await expect(page.getByText('Accessibility: Unknown')).toHaveCount(4);
  await information.uncheck();

  await page.getByRole('button', { name: 'Schapiro', exact: true }).click();
  await expect(page.locator('.restroom-card')).toHaveCount(1);
  await page.getByRole('button', { name: 'All Halls' }).click();
  const search = page.getByRole('searchbox', { name: 'Search halls' });
  for (const [hall, count] of [['Schapiro', 1], ['Broadway', 1], ['Furnald', 2]] as const) {
    await search.fill(hall);
    await expect(page.locator('.restroom-card')).toHaveCount(count);
  }
  await search.fill('Schapiro');
  await page.getByRole('button', { name: /Options/ }).click();
  await page.getByRole('button', { name: 'All-gender' }).click();
  await expect(page.locator('.restroom-card')).toHaveCount(1);
  await page.getByRole('button', { name: 'Map' }).click();
  await expect(page.getByRole('heading', { name: 'Entrance pins are not verified yet' })).toBeVisible();
  await page.getByRole('button', { name: 'Show list' }).click();
  await page.getByRole('link', { name: /Schapiro Hall, 2nd Floor details/i }).first().click();
  await expect(page).toHaveURL(/\/bathrooms\/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa/);
  await expect(page.getByRole('heading', { level: 1, name: 'Schapiro Hall' })).toBeVisible();
  await expect(page.getByText(/Location has not been field verified/i)).toBeVisible();
  await expect(page.getByRole('link', { name: /View official floor plan/i })).toHaveAttribute('href', /SHP_FL_02\.jpg/);
});
