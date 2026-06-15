import { test, expect } from '@playwright/test'

// Books are <a> links containing a cover <img>
const bookButton = (page: import('@playwright/test').Page) =>
  page.getByRole('link').filter({ has: page.locator('img') }).first()

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
    const books = page.getByRole('link').filter({ has: page.locator('img') })
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

  test('arrow keys navigate between pages', async ({ page }) => {
    const getPageText = () => page.locator('p').first().textContent()
    const before = await getPageText()
    await page.keyboard.press('ArrowRight')
    await page.waitForTimeout(1000)
    const afterRight = await getPageText()
    expect(afterRight).not.toBe(before)
    await page.keyboard.press('ArrowLeft')
    await page.waitForTimeout(1000)
    const afterLeft = await getPageText()
    expect(afterLeft).toBe(before)
  })

  test('back to library returns to the root URL', async ({ page }) => {
    // While reading, the URL is the real per-story path
    expect(page.url()).toMatch(/\/geschichten\/[\w-]+\//)
    await backButton(page).click()
    await page.getByText('Geschichten zum Einschlafen').waitFor({ timeout: 5000 })
    expect(page.url()).not.toMatch(/\/geschichten\//)
  })
})

test.describe('Language toggle', () => {
  test('switches the library tagline + URL between DE and EN', async ({ page }) => {
    await page.goto('/')
    await page.getByText('Geschichten zum Einschlafen').waitFor({ timeout: 10000 })
    // Toggle is the only button in the top-right showing "DE" or "EN"
    const langToggle = page.getByRole('button', { name: /^(DE|EN)$/ })
    await langToggle.click()
    await expect(page.getByText('Bedtime Stories')).toBeVisible({ timeout: 5000 })
    expect(page.url()).toMatch(/\/en\/$/)
    await langToggle.click()
    await expect(page.getByText('Geschichten zum Einschlafen')).toBeVisible({ timeout: 5000 })
    expect(page.url()).not.toMatch(/\/en\//)
  })

  test('switches the back-button label inside the reader', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link').filter({ has: page.locator('img') }).first().waitFor({ timeout: 10000 })
    await page.getByRole('link').filter({ has: page.locator('img') }).first().click()
    await page.getByRole('button', { name: /Zur Bibliothek/ }).waitFor({ timeout: 5000 })
    await page.getByRole('button', { name: /^(DE|EN)$/ }).click()
    await expect(page.getByRole('button', { name: /Library/ })).toBeVisible({ timeout: 5000 })
  })
})

test.describe('Deep-link via story URL', () => {
  test('opens a specific story at a specific page from the URL', async ({ page }) => {
    // Pick a real story id that the App ships with; page in the hash (1-based).
    await page.goto('/geschichten/der-mond/#3')
    await page.locator('p').first().waitFor({ timeout: 10000 })
    // Page counter should show "3/<n>"
    await expect(page.getByText(/^3\/\d+$/)).toBeVisible({ timeout: 5000 })
  })

  test('falls back to the library when the story does not exist', async ({ page }) => {
    await page.goto('/geschichten/this-story-id-does-not-exist/')
    await expect(page.getByText('Geschichten zum Einschlafen')).toBeVisible({ timeout: 10000 })
  })

  test('an old hash deep-link still resolves (back-compat redirect)', async ({ page }) => {
    await page.goto('/#/der-mond/3')
    await page.locator('p').first().waitFor({ timeout: 10000 })
    await expect(page.getByText(/^3\/\d+$/)).toBeVisible({ timeout: 5000 })
    expect(page.url()).toMatch(/\/geschichten\/der-mond\//)
  })

  test('an /en/ deep-link opens the story in English', async ({ page }) => {
    await page.goto('/en/geschichten/der-mond/')
    await page.locator('p').first().waitFor({ timeout: 10000 })
    // The English back-button label confirms the active language.
    await expect(page.getByRole('button', { name: /Library/ })).toBeVisible({ timeout: 5000 })
  })
})
