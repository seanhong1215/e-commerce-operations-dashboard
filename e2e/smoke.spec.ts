import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/#/login')
  await page.evaluate(() => localStorage.clear())
  await page.reload()
})

test('signs in and opens the main operations pages', async ({ page }) => {
  await expect(page.getByTestId('login-submit')).toBeVisible()
  await page.getByTestId('login-submit').click()
  await expect(page.getByTestId('dashboard')).toBeVisible()
  await expect(page.getByTestId('trend-chart')).toBeVisible()

  await page.goto('/#/products')
  await expect(page.getByTestId('products-page')).toBeVisible()
  await expect(page.getByTestId('new-product')).toBeVisible()

  await page.goto('/#/orders')
  await expect(page.getByTestId('orders-page')).toBeVisible()

  await page.goto('/#/customers')
  await expect(page.getByTestId('customers-page')).toBeVisible()

  await page.goto('/#/promotions')
  await expect(page.getByTestId('promotions-page')).toBeVisible()
})

test('opens the product creation workflow', async ({ page }) => {
  await page.getByTestId('login-submit').click()
  await expect(page.getByTestId('dashboard')).toBeVisible()
  await page.goto('/#/products/new')
  await expect(page.getByTestId('product-form')).toBeVisible()
  await page.getByTestId('product-name').fill('Automation Sample')
  await page.getByTestId('next-step').click()
  await expect(page.getByText('STEP 2 / 9')).toBeVisible()
})

test('exports the filtered order list as CSV', async ({ page }) => {
  await page.getByTestId('login-submit').click()
  await expect(page.getByTestId('dashboard')).toBeVisible()
  await page.goto('/#/orders')
  await expect(page.getByTestId('orders-page')).toBeVisible()
  await page.getByTestId('order-search').fill('ORD-20260828-1042')
  const downloadPromise = page.waitForEvent('download')
  await page.getByTestId('export-orders').click()
  const download = await downloadPromise
  expect(download.suggestedFilename()).toMatch(/^orders-\d{4}-\d{2}-\d{2}\.csv$/)
})
