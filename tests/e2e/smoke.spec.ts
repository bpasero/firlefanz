import { test, expect } from '@playwright/test'

const PIN = '040522'

async function enterPin(page: import('@playwright/test').Page) {
  for (let i = 0; i < PIN.length; i++) {
    await page.locator('input[inputmode="numeric"]').nth(i).fill(PIN[i])
  }
}

// Books are <button> elements containing a cover <img>
const bookButton = (page: import('@playwright/test').Page) =>
  page.getByRole('button').filter({ has: page.locator('img') }).first()

// Back button says "← Zur Bibliothek" (DE) or "← Library" (EN)
const backButton = (page: import('@playwright/test').Page) =>
  page.getByRole('button', { name: /Bibliothek|Library/i }).first()

test.describe('PIN gate', () => {
  test('shows PIN entry on first load', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('Bitte gib den Geheimcode ein')).toBeVisible()
    await expect(page.locator('input[inputmode="numeric"]')).toHaveCount(6)
  })

  test('shows error on wrong PIN', async ({ page }) => {
    await page.goto('/')
    const inputs = page.locator('input[inputmode="numeric"]')
    for (let i = 0; i < 6; i++) {
      await inputs.nth(i).fill(String(i))
    }
    await expect(page.getByText('Das war leider falsch!')).toBeVisible()
  })

  test('grants access with correct PIN', async ({ page }) => {
    await page.goto('/')
    await enterPin(page)
    // Story library heading should appear
    await expect(page.getByText('Geschichten zum Einschlafen')).toBeVisible({ timeout: 5000 })
    await expect(page.getByText('Bitte gib den Geheimcode ein')).not.toBeVisible()
  })
})

test.describe('Story library', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await enterPin(page)
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
    await enterPin(page)
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
    await page.waitForTimeout(700)
    const after = await getPageText()
    expect(after).not.toBe(before)
  })

  test('back button returns to library', async ({ page }) => {
    await backButton(page).click()
    await expect(page.getByText('Geschichten zum Einschlafen')).toBeVisible({ timeout: 5000 })
    await expect(backButton(page)).not.toBeVisible()
  })
})
