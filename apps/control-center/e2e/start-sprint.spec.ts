import { test, expect } from '@playwright/test'

const PROJECT = 'j-o-b'
const BASE = `/projects/${PROJECT}`

test.describe('Start sprint', () => {
  test('F6 — Start sprint form appears, kanban shows after submit', async ({ page }) => {
    await page.goto(BASE)

    // Should show "No active sprint yet" heading and the form
    await expect(page.getByText('No active sprint yet')).toBeVisible()

    const nameInput = page.locator('input[placeholder="Sprint 1"]')
    const goalInput = page.locator('input[placeholder*="accomplish"]')
    await expect(nameInput).toBeVisible()
    await expect(goalInput).toBeVisible()

    // Fill and submit
    await nameInput.fill('Test Sprint')
    await goalInput.fill('Test goal')
    await page.getByRole('button', { name: 'Start sprint' }).click()

    // Kanban should appear with 5 lane headers (draft/ready/dispatched/in review/closed)
    await expect(page.getByText('No active sprint yet')).not.toBeVisible()

    // Verify 5 lane headers are visible (uppercase data font labels)
    const laneHeaders = ['draft', 'ready', 'dispatched', 'in review', 'closed']
    for (const label of laneHeaders) {
      // Lane headers are uppercase in CSS but text content is lowercase
      const header = page.locator('div').filter({ hasText: new RegExp(`^${label}\\s*\\(`, 'i') }).first()
      await expect(header).toBeVisible()
    }

    // Form disappears
    await expect(page.locator('input[placeholder="Sprint 1"]')).not.toBeVisible()
  })
})
