import { test, expect } from '@playwright/test'

const bookButton = (page: import('@playwright/test').Page) =>
  page.getByRole('link').filter({ has: page.locator('img') }).first()

test.describe('Story reader mobile landscape', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await bookButton(page).waitFor({ timeout: 10000 })
    await bookButton(page).click()
    await expect(page.locator('p').first()).toBeVisible({ timeout: 5000 })
  })

  test('fits entirely within viewport without scrolling', async ({ page }) => {
    const viewport = page.viewportSize()!
    const bodyScrollHeight = await page.evaluate(() => document.body.scrollHeight)
    expect(bodyScrollHeight).toBeLessThanOrEqual(viewport.height)
  })

  test('uses side-by-side layout (image left, text right)', async ({ page }) => {
    const viewport = page.viewportSize()!
    // In landscape, the book should use a row layout: image on the left half, text on the right half
    const img = page.locator('img[alt^="Seite"]').first()
    const text = page.locator('p').first()
    const imgBox = await img.boundingBox()
    const textBox = await text.boundingBox()
    expect(imgBox).not.toBeNull()
    expect(textBox).not.toBeNull()
    // Image center x is in the left half of the viewport
    const imgCenterX = imgBox!.x + imgBox!.width / 2
    expect(imgCenterX).toBeLessThan(viewport.width / 2)
    // Text is in the right half of the viewport
    expect(textBox!.x).toBeGreaterThan(viewport.width / 2)
  })

  test('nav buttons are hidden to save vertical space', async ({ page }) => {
    // Navigation arrow buttons should be hidden in landscape (use swipe/click zones instead)
    const prevBtn = page.getByRole('button', { name: '‹' })
    const nextBtn = page.getByRole('button', { name: '›' })
    await expect(prevBtn).toBeHidden()
    await expect(nextBtn).toBeHidden()
  })

  test('no scrolling after navigating pages', async ({ page }) => {
    const viewport = page.viewportSize()!

    // Navigate to next page by tapping right side
    await page.touchscreen.tap(viewport.width * 0.8, viewport.height * 0.5)
    await page.waitForTimeout(800)

    const bodyScrollHeight = await page.evaluate(() => document.body.scrollHeight)
    expect(bodyScrollHeight).toBeLessThanOrEqual(viewport.height)
  })

  test('swipe left navigates to next page', async ({ page }) => {
    const viewport = page.viewportSize()!
    const initialPage = await page.locator('[style*="Lora"]').filter({ hasText: /— 1 —/ }).count()
    expect(initialPage).toBeGreaterThan(0)

    // Swipe left to go to page 2
    await page.touchscreen.tap(viewport.width * 0.7, viewport.height * 0.5)
    await page.waitForTimeout(800)

    // Should now show page 2
    await expect(page.locator('[style*="Lora"]').filter({ hasText: /— 2 —/ })).toBeVisible({ timeout: 3000 })
  })
})
