import { test, expect } from '@playwright/test'

// Books are <button> elements containing a cover <img>
const bookButton = (page: import('@playwright/test').Page) =>
  page.getByRole('button').filter({ has: page.locator('img') }).first()

// Back button says "← Zur Bibliothek" (DE) or "← Library" (EN)
const backButton = (page: import('@playwright/test').Page) =>
  page.getByRole('button', { name: /Bibliothek|Library/i }).first()

test.describe('Story library', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // Wait for stories to load (at least one book button with img appears)
    await bookButton(page).waitFor({ timeout: 10000 })
  })

  test('displays story books', async ({ page }) => {
    const books = page.getByRole('button').filter({ has: page.locator('img') })
    const count = await books.count()
    expect(count).toBeGreaterThan(0)
  })

  test('opens story reader when clicking a book', async ({ page }) => {
    await bookButton(page).click()
    await expect(backButton(page)).toBeVisible({ timeout: 5000 })
  })
})

test.describe('Story reader', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await bookButton(page).waitFor({ timeout: 10000 })
    await bookButton(page).click()
    await backButton(page).waitFor({ timeout: 5000 })
  })

  test('shows page text content', async ({ page }) => {
    await expect(page.locator('p').first()).toBeVisible({ timeout: 5000 })
  })

  test('can navigate to next page', async ({ page }) => {
    const getPageText = () => page.locator('p').first().textContent()
    const before = await getPageText()
    // Click right third of the screen to advance
    const viewport = page.viewportSize()!
    await page.mouse.click(viewport.width * 0.8, viewport.height * 0.5)
    await page.waitForTimeout(1000)
    const after = await getPageText()
    expect(after).not.toBe(before)
  })

  test('back button returns to library', async ({ page }) => {
    await backButton(page).click()
    await expect(page.getByText('Geschichten zum Einschlafen')).toBeVisible({ timeout: 5000 })
    await expect(backButton(page)).not.toBeVisible()
  })
})
