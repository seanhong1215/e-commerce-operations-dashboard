import { expect, test, type Page } from '@playwright/test'

async function pause(page: Page, milliseconds: number) {
  await page.waitForTimeout(milliseconds)
}

async function chapter(page: Page, label: string) {
  await page.evaluate(text => {
    document.querySelector('[data-demo-chapter]')?.remove()
    const badge = document.createElement('div')
    badge.dataset.demoChapter = 'true'
    badge.textContent = text
    badge.style.cssText = [
      'position:fixed', 'right:28px', 'bottom:24px', 'z-index:99999',
      'padding:10px 16px', 'border-radius:999px', 'background:#173425',
      'color:#f5c987', 'font:700 12px Arial,sans-serif', 'letter-spacing:.12em',
      'box-shadow:0 10px 30px #0003',
    ].join(';')
    document.body.appendChild(badge)
  }, label)
  await pause(page, 750)
}

test('complete commerce operations journey @demo', async ({ page }) => {
  test.setTimeout(90_000)

  await page.goto('/#/login')
  await page.evaluate(() => localStorage.clear())
  await page.reload()
  await chapter(page, 'COMMERCE OS / COMPLETE WORKFLOW')
  await pause(page, 1_500)
  await page.getByTestId('login-submit').click()
  await expect(page.getByTestId('dashboard')).toBeVisible()
  await chapter(page, '01 / OPERATIONS OVERVIEW')
  await pause(page, 3_500)

  await page.getByTestId('nav-products').click()
  await expect(page.getByTestId('products-page')).toBeVisible()
  await chapter(page, '02 / CREATE A PRODUCT')
  await page.getByTestId('new-product').click()
  await expect(page.getByTestId('product-form')).toBeVisible()
  await page.getByTestId('product-name').fill('Interview Edition T-Shirt')
  await pause(page, 600)
  await page.getByTestId('next-step').click()
  await page.getByTestId('product-description').fill('Heavyweight cotton apparel designed for everyday city life.')
  await pause(page, 500)
  await page.getByTestId('next-step').click()
  await pause(page, 450)
  await page.getByTestId('next-step').click()
  await chapter(page, '03 / VARIANTS TO SKU MATRIX')
  await pause(page, 1_200)
  await page.getByTestId('next-step').click()
  await expect(page.getByTestId('sku-code').first()).toBeVisible()
  await pause(page, 1_500)
  await page.getByTestId('next-step').click()
  await pause(page, 450)
  await page.getByTestId('next-step').click()
  await page.getByTestId('seo-title').fill('Interview Edition T-Shirt | CommerceOS')
  await pause(page, 500)
  await page.getByTestId('next-step').click()
  await page.getByTestId('image-upload').locator('input[type="file"]').setInputFiles({
    name: 'interview-shirt.svg',
    mimeType: 'image/svg+xml',
    buffer: Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900"><rect width="100%" height="100%" fill="#315e43"/><text x="50%" y="50%" text-anchor="middle" fill="#fff" font-size="72">Interview Edition</text></svg>'),
  })
  await pause(page, 700)
  await page.getByTestId('next-step').click()
  await chapter(page, '04 / REVIEW AND PUBLISH')
  await pause(page, 1_800)
  await page.getByTestId('confirm-publish').click()
  await expect(page.getByTestId('products-page')).toBeVisible()
  await expect(page.getByText('Interview Edition T-Shirt', { exact: true })).toBeVisible()
  await pause(page, 1_200)

  await page.getByTestId('nav-orders').click()
  await expect(page.getByTestId('orders-page')).toBeVisible()
  await chapter(page, '05 / SEARCH AND FULFILL ORDER')
  await page.getByTestId('order-search').fill('ORD-20260828-1042')
  await pause(page, 900)
  await page.getByText('ORD-20260828-1042', { exact: true }).click()
  await expect(page.getByTestId('order-detail')).toBeVisible()
  await pause(page, 900)
  await page.getByTestId('open-ship').click()
  await page.getByTestId('tracking-number').fill('DEMO-2026-0828')
  await pause(page, 700)
  await page.getByTestId('confirm-ship').click()
  await expect(page.getByText('DEMO-2026-0828', { exact: true })).toBeVisible()
  await pause(page, 2_000)

  await page.getByTestId('nav-customers').click()
  await expect(page.getByTestId('customers-page')).toBeVisible()
  await chapter(page, '06 / CUSTOMER 360')
  await page.locator('.el-table__row').first().click()
  await expect(page.locator('.el-drawer')).toBeVisible()
  await pause(page, 1_800)
  await page.keyboard.press('Escape')
  await expect(page.locator('.el-drawer')).toBeHidden()

  await page.getByTestId('nav-promotions').click()
  await expect(page.getByTestId('promotions-page')).toBeVisible()
  await chapter(page, '07 / CREATE A CAMPAIGN')
  await page.getByTestId('new-promotion').click()
  await page.getByTestId('promotion-name').fill('Interview Demo Offer')
  await page.getByTestId('promotion-code').fill('INTERVIEW88')
  await page.getByTestId('promotion-discount').fill('88% limited-time offer')
  await pause(page, 700)
  await page.getByTestId('save-promotion').click()
  await expect(page.getByText('Interview Demo Offer', { exact: true })).toBeVisible()
  await pause(page, 1_500)

  await page.getByTestId('global-search').click()
  await page.getByTestId('global-search-input').fill('Interview Edition')
  await chapter(page, '08 / VERIFY SAVED DATA')
  await page.getByText('Interview Edition T-Shirt', { exact: true }).click()
  await expect(page.getByTestId('product-form')).toBeVisible()
  await expect(page.getByTestId('product-name')).toHaveValue('Interview Edition T-Shirt')
  await pause(page, 3_000)
})
