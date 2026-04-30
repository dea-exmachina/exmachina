import { chromium, FullConfig } from '@playwright/test'

async function globalSetup(config: FullConfig) {
  const { baseURL } = config.projects[0].use
  const browser = await chromium.launch()
  const page = await browser.newPage()

  // Navigate to sign-in and authenticate
  await page.goto(`${baseURL}/sign-in`)

  // Fill email + password (adjust selectors to match the actual sign-in form)
  await page.fill('input[type="email"]', 'georgeata@pm.me')
  await page.fill('input[type="password"]', 'MovingForward1!')
  await page.click('button[type="submit"]')

  // Wait for redirect to home/projects
  await page.waitForURL(`${baseURL}/`, { timeout: 10000 })

  // Save auth state (cookies + localStorage)
  await page.context().storageState({ path: 'e2e/.auth/user.json' })
  await browser.close()
}

export default globalSetup
