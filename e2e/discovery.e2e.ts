import { expect, test } from '@playwright/test';

test('all halls show their floors and published counts without selecting a hall', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Stallion/i })).toBeVisible();
  await expect(page.locator('.hall-column')).toHaveCount(13);
  const schapiro = page.locator('.hall-column').filter({ has: page.getByRole('heading', { name: 'Schapiro Hall' }) });
  await expect(schapiro.locator('.floor-row')).toHaveCount(15);
  await expect(schapiro.locator('.floor-summary').first()).toContainText('2nd floor');
  await expect(schapiro.locator('.floor-summary').last()).toContainText('16th floor');
  await expect(schapiro.locator('.floor-details').first()).toBeHidden();
  await schapiro.locator('.floor-summary').first().hover();
  await expect(schapiro.locator('.floor-details').first()).toBeVisible();
  await expect(schapiro.locator('.floor-details').first()).toContainText('Men 1 · Women 2 · All-gender 1');
  await expect(page.getByRole('link', { name: 'Schapiro Hall 2nd floor floor plan' })).toHaveAttribute('href', /SHP_FL_02/);
  await schapiro.locator('.floor-summary').first().click();
  await schapiro.locator('.floor-summary').last().hover();
  await expect(schapiro.locator('.floor-details').first()).toBeVisible();
  await schapiro.locator('.floor-summary').first().click();
  await schapiro.locator('.floor-summary').last().hover();
  await expect(schapiro.locator('.floor-details').first()).toBeHidden();
  const hall611 = page.locator('.hall-column').filter({ has: page.getByRole('heading', { name: '611 W. 112th Street' }) });
  await expect(hall611.locator('.floor-row')).toHaveCount(6);
  await expect(hall611.locator('.floor-row').first()).toContainText('7 bathrooms');
  await expect(hall611.locator('.floor-row').first()).toContainText('gender designation not shown');
  await expect(page.getByRole('link', { name: 'Dancing poop GIF on Klipy' })).toHaveAttribute('href', 'https://klipy.com/gifs/poop-dancing-poop-3');
  await expect(page.getByRole('link', { name: 'Directions to Schapiro Hall' })).toHaveAttribute('href', /travelmode=walking/);
});

test('each hall reveals its own information on hover or tap', async ({ page }) => {
  await page.goto('/');
  const schapiro = page.locator('.hall-column').filter({ has: page.getByRole('heading', { name: 'Schapiro Hall' }) });
  const broadway = page.locator('.hall-column').filter({ has: page.getByRole('heading', { name: 'Broadway Hall' }) });
  await expect(schapiro.locator('.hall-details')).toBeHidden();
  await schapiro.locator('.hall-summary').hover();
  await expect(schapiro.locator('.hall-details')).toBeVisible();
  await expect(schapiro.locator('.hall-details')).toContainText('Columbia');
  await broadway.locator('.hall-summary').hover();
  await expect(schapiro.locator('.hall-details')).toBeHidden();
  await expect(broadway.locator('.hall-details')).toBeVisible();
  await broadway.locator('.hall-summary').click();
  await schapiro.locator('.hall-summary').hover();
  await expect(broadway.locator('.hall-details')).toBeVisible();
  await broadway.locator('.hall-summary').click();
  await schapiro.locator('.hall-summary').hover();
  await expect(broadway.locator('.hall-details')).toBeHidden();
  await expect(broadway.locator('.floor-row')).toHaveCount(11);
});

test('favorites persist and filter to saved floors', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Favorite Schapiro Hall 2nd floor' }).click();
  await expect(page.getByRole('button', { name: 'Remove favorite Schapiro Hall 2nd floor' })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: /Favorites \(1\)/ }).click();
  await expect(page.locator('.hall-column')).toHaveCount(1);
  await expect(page.locator('.floor-row')).toHaveCount(1);
  await page.reload();
  await expect(page.locator('.hall-column')).toHaveCount(13);
  await page.getByRole('button', { name: /Favorites \(1\)/ }).click();
  await expect(page.locator('.floor-row')).toHaveCount(1);
});

test('search and filters retain floor breakdowns', async ({ page }) => {
  await page.goto('/');
  const search = page.getByRole('searchbox', { name: 'Search halls' });
  await search.fill('Furnald');
  await expect(page.locator('.hall-column')).toHaveCount(1);
  await expect(page.locator('.floor-row')).toHaveCount(9);
  await page.getByRole('button', { name: 'All-gender' }).click();
  await expect(page.locator('.hall-column')).toHaveCount(0);
  await search.fill('Schapiro');
  await expect(page.locator('.floor-row')).toHaveCount(8);
  await expect(page.locator('.floor-row').first()).toContainText('1 all-gender bathroom · 4 total');
});

test('geolocation passes the actual GPS point to Google Maps', async ({ page, context }) => {
  await context.grantPermissions(['geolocation']);
  await context.setGeolocation({ latitude: 40.805981, longitude: -73.964838 });
  await page.goto('/');
  await page.getByRole('button', { name: /Find bathrooms near me/ }).click();
  await expect(page.getByRole('status')).toContainText('Location found');
  await expect(page.locator('.hall-column').first()).toContainText('John Jay Hall');
  await expect(page.locator('.entry-directions').first()).toHaveAttribute('href', /origin=40\.805981%2C-73\.964838.*travelmode=walking/);
});

test('location denial keeps manual hall sorting usable', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'geolocation', { configurable: true, value: { getCurrentPosition: (_ok: unknown, fail: (error: { code: number }) => void) => fail({ code: 1 }) } });
  });
  await page.goto('/');
  await page.getByRole('button', { name: /Find bathrooms near me/ }).click();
  await expect(page.getByRole('status')).toContainText('Location permission is off');
  await page.getByRole('combobox', { name: 'Starting building' }).selectOption({ label: 'John Jay Hall' });
  await expect(page.locator('.hall-column').first()).toContainText('John Jay Hall');
  await expect(page.locator('.entry-directions').first()).not.toHaveAttribute('href', /origin=/);
});
