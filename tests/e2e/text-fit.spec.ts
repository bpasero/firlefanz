import { test, expect } from '@playwright/test'

// The longest page the library ships with; it used to be cut off.
const LONG_PAGE = '/geschichten/das-museum-der-lebendigen-statuen/#11'

// How far the story text sticks out of its (clipping) page, in px.
const overflow = (page: import('@playwright/test').Page) =>
  page.locator('.paper-texture').first().evaluate((el) => {
    const panel = el.getBoundingClientRect()
    const paragraphs = [...el.querySelectorAll('p')].map((p) => p.getBoundingClientRect())
    return Math.max(paragraphs[paragraphs.length - 1].bottom - panel.bottom, panel.top - paragraphs[0].top)
  })

for (const [width, height] of [[1280, 800], [1024, 768], [768, 1024], [360, 740], [915, 412]]) {
  test(`long text fits its page at ${width}x${height}`, async ({ page }) => {
    await page.setViewportSize({ width, height })
    await page.goto(LONG_PAGE)
    await page.locator('.paper-texture p').first().waitFor({ timeout: 10000 })
    await expect.poll(() => overflow(page)).toBeLessThanOrEqual(0)
  })
}

test('text refits when the window shrinks', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 })
  await page.goto(LONG_PAGE)
  await page.locator('.paper-texture p').first().waitFor({ timeout: 10000 })
  await page.setViewportSize({ width: 1280, height: 800 })
  await expect.poll(() => overflow(page)).toBeLessThanOrEqual(0)
})
