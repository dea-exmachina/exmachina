import { test, expect } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'

const PROJECT = 'exmachina-v022'
const COUNCIL_URL = `/projects/${PROJECT}/council`

test.describe('Council', () => {
  test('F7 — Convene review creates row + vault file', async ({ page }) => {
    await page.goto(COUNCIL_URL)

    // Click "Convene review"
    await page.getByRole('button', { name: 'Convene review' }).click()

    // Form appears — fill context field (synthesis)
    const contextField = page.locator('textarea[placeholder*="decision"]')
    await expect(contextField).toBeVisible()
    await contextField.fill('Test decision')

    // Submit
    await page.getByRole('button', { name: 'Submit' }).click()

    // New review should appear in the list with "pending" status chip
    await expect(page.locator('span').filter({ hasText: 'pending' }).first()).toBeVisible()

    // Check vault file exists (if CC_VAULT_ROOT is set)
    const vaultRoot = process.env.CC_VAULT_ROOT
    if (vaultRoot) {
      const councilDir = path.join(vaultRoot, 'projects', PROJECT, 'council')
      const files = fs.existsSync(councilDir) ? fs.readdirSync(councilDir) : []
      expect(files.some((f) => f.endsWith('.md'))).toBe(true)
    }
  })

  test('F8 — Record decision changes status chip to decided', async ({ page }) => {
    await page.goto(COUNCIL_URL)

    // Find a pending review and record decision
    const pendingChip = page.locator('span').filter({ hasText: 'pending' }).first()

    // If no pending review, convene one first
    const hasPending = await pendingChip.isVisible().catch(() => false)
    if (!hasPending) {
      await page.getByRole('button', { name: 'Convene review' }).click()
      await page.locator('textarea[placeholder*="decision"]').fill('F8 test review')
      await page.getByRole('button', { name: 'Submit' }).click()
      await expect(page.locator('span').filter({ hasText: 'pending' }).first()).toBeVisible()
    }

    // Find record decision form for the first pending review
    const decisionSelect = page.locator('select').filter({ hasText: 'Approve' }).first()
    await expect(decisionSelect).toBeVisible()

    // Fill notes and submit
    await decisionSelect.selectOption('approve')
    const notesField = page.locator('textarea[placeholder="Notes (optional)"]').first()
    await notesField.fill('Looks good')
    await page.getByRole('button', { name: 'Record decision' }).first().click()

    // "Decision recorded." confirmation + status chip changes
    await expect(page.getByText('Decision recorded.')).toBeVisible()

    // Refresh to confirm persisted state — status chip should now show 'approve'
    await page.reload()
    await expect(page.locator('span').filter({ hasText: 'approve' }).first()).toBeVisible()
  })
})
