import { test, expect } from '@playwright/test'

const PROJECT = 'exmachina-v022'
const BASE = `/projects/${PROJECT}`

test.describe('Card detail', () => {
  test('F1 — Navigate to card detail from kanban', async ({ page }) => {
    await page.goto(BASE)

    // Click the first card title link in the kanban
    const firstCardLink = page.locator('a[href*="/cards/"]').first()
    const cardTitle = await firstCardLink.textContent()
    await firstCardLink.click()

    // URL should change to card detail
    await expect(page).toHaveURL(/\/projects\/exmachina-v022\/cards\/[^/]+$/)

    // Card title should be visible on the detail page
    await expect(page.getByText(cardTitle!.trim())).toBeVisible()
  })

  test('F2 — Edit card title inline', async ({ page }) => {
    await page.goto(BASE)

    const firstCardLink = page.locator('a[href*="/cards/"]').first()
    const originalTitle = (await firstCardLink.textContent())!.trim()
    await firstCardLink.click()

    await expect(page).toHaveURL(/\/cards\//)

    // Click the title to enter edit mode
    const titleEl = page.locator('div[title="Click to edit"]').first()
    await titleEl.click()

    // Input should appear
    const input = page.locator('input[style*="font-size: 20px"]')
    await expect(input).toBeVisible()

    // Type new title + press Enter
    const newTitle = `${originalTitle} (edited)`
    await input.fill(newTitle)
    await input.press('Enter')

    // Input disappears, new title shows
    await expect(input).not.toBeVisible()
    await expect(page.getByText(newTitle)).toBeVisible()

    // Navigate back to kanban and confirm tile reflects new title
    await page.goto(BASE)
    await expect(page.locator(`a[href*="/cards/"]`).filter({ hasText: newTitle })).toBeVisible()

    // Restore original title (cleanup)
    await page.locator(`a[href*="/cards/"]`).filter({ hasText: newTitle }).click()
    const titleEl2 = page.locator('div[title="Click to edit"]').first()
    await titleEl2.click()
    await page.locator('input[style*="font-size: 20px"]').fill(originalTitle)
    await page.locator('input[style*="font-size: 20px"]').press('Enter')
  })

  test('F4 — Status badge click opens select, change reflects in badge', async ({ page }) => {
    await page.goto(BASE)
    await page.locator('a[href*="/cards/"]').first().click()
    await expect(page).toHaveURL(/\/cards\//)

    // Click status badge
    const statusBadge = page.locator('button[title="Change status"]').first()
    const currentStatus = (await statusBadge.textContent())!.trim()
    await statusBadge.click()

    // Select should appear
    const select = page.locator('select').first()
    await expect(select).toBeVisible()

    // Pick a different status
    const newStatus = currentStatus === 'draft' ? 'ready' : 'draft'
    await select.selectOption(newStatus)

    // Badge reflects new status
    // newStatus is 'draft' or 'ready' — neither maps to a different label
    await expect(page.locator('button[title="Change status"]').first()).toContainText(newStatus)
  })

  test('F5 — Escape on title edit reverts', async ({ page }) => {
    await page.goto(BASE)
    await page.locator('a[href*="/cards/"]').first().click()
    await expect(page).toHaveURL(/\/cards\//)

    const titleEl = page.locator('div[title="Click to edit"]').first()
    const originalTitle = (await titleEl.textContent())!.trim()

    // Click to edit
    await titleEl.click()
    const input = page.locator('input[style*="font-size: 20px"]')
    await expect(input).toBeVisible()

    // Type something then press Escape
    await input.fill('Should not save this')
    await input.press('Escape')

    // Input disappears, original title shows
    await expect(input).not.toBeVisible()
    await expect(page.getByText(originalTitle)).toBeVisible()
  })
})
