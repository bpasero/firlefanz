import { test, expect } from '@playwright/test'

const bookButton = (page: import('@playwright/test').Page) =>
  page.getByRole('link').filter({ has: page.locator('img') }).first()

test.describe('Story reader mobile', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await bookButton(page).waitFor({ timeout: 10000 })
    await bookButton(page).click()
    // Wait for story page text to appear (back button text is hidden on mobile)
    await expect(page.locator('p').first()).toBeVisible({ timeout: 5000 })
  })

  test('fits entirely within viewport without scrolling', async ({ page }) => {
    const viewport = page.viewportSize()!

    // The body should not be scrollable beyond the viewport
    const bodyScrollHeight = await page.evaluate(() => document.body.scrollHeight)
    expect(bodyScrollHeight).toBeLessThanOrEqual(viewport.height)
  })

  test('high contrast toggle is reachable and keeps everything on screen', async ({ page }) => {
    const viewport = page.viewportSize()!
    const toggle = page.getByRole('button', { name: 'Hoher Kontrast' })
    await toggle.click()
    await expect(toggle).toHaveAttribute('aria-pressed', 'true')
    for (const button of await page.getByRole('button').all()) {
      const box = (await button.boundingBox())!
      expect(box.x).toBeGreaterThanOrEqual(0)
      expect(box.x + box.width).toBeLessThanOrEqual(viewport.width)
    }
  })

  test('no scrolling after navigating pages', async ({ page }) => {
    const viewport = page.viewportSize()!

    // Navigate to next page by tapping right side
    await page.touchscreen.tap(viewport.width * 0.8, viewport.height * 0.5)
    await page.waitForTimeout(800)

    const bodyScrollHeight = await page.evaluate(() => document.body.scrollHeight)
    expect(bodyScrollHeight).toBeLessThanOrEqual(viewport.height)
  })
})
