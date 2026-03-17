const { test, expect } = require("playwright/test");

async function tabUntil(page, selector, maxTabs = 40) {
  for (let i = 0; i < maxTabs; i += 1) {
    await page.keyboard.press("Tab");
    const isFocused = await page.evaluate((sel) => {
      const el = document.activeElement;
      return Boolean(el && el.matches(sel));
    }, selector);

    if (isFocused) {
      return true;
    }
  }

  return false;
}

test.describe("Landing QA checks", () => {
  [
    { width: 390, height: 844 },
    { width: 520, height: 960 },
    { width: 680, height: 1024 },
    { width: 920, height: 1180 },
    { width: 1440, height: 1400 }
  ].forEach((viewport) => {
    test(`responsive overflow check ${viewport.width}px`, async ({ browser, baseURL }) => {
      const context = await browser.newContext({ viewport });
      const page = await context.newPage();
      await page.goto(baseURL, { waitUntil: "networkidle" });
      await page.waitForTimeout(350);

      const overflow = await page.evaluate(() => {
        const html = document.documentElement;
        const body = document.body;

        return {
          htmlOverflow: html.scrollWidth - html.clientWidth,
          bodyOverflow: body.scrollWidth - body.clientWidth
        };
      });

      expect(overflow.htmlOverflow).toBeLessThanOrEqual(1);
      expect(overflow.bodyOverflow).toBeLessThanOrEqual(1);
      await context.close();
    });
  });

  test("keyboard: hero CTA can be reached with Tab", async ({ page, baseURL }) => {
    await page.setViewportSize({ width: 920, height: 1180 });
    await page.goto(baseURL, { waitUntil: "networkidle" });

    const heroCtaReached = await tabUntil(page, ".hero__cta", 30);
    expect(heroCtaReached).toBeTruthy();
  });

  test("keyboard: mobile menu opens/closes and handles Escape", async ({ page, baseURL }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(baseURL, { waitUntil: "networkidle" });

    const menuToggleReached = await tabUntil(page, ".site-header__menu-toggle", 10);
    expect(menuToggleReached).toBeTruthy();

    await page.keyboard.press("Enter");
    await expect(page.locator(".site-header__menu-toggle")).toHaveAttribute("aria-expanded", "true");

    await page.keyboard.press("Escape");
    await expect(page.locator(".site-header__menu-toggle")).toHaveAttribute("aria-expanded", "false");
  });

  test("keyboard: anchor navigation from mobile menu reaches results section", async ({
    page,
    baseURL
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(baseURL, { waitUntil: "networkidle" });

    const menuToggleReached = await tabUntil(page, ".site-header__menu-toggle", 10);
    expect(menuToggleReached).toBeTruthy();
    await page.keyboard.press("Enter");
    await expect(page.locator(".site-header__menu-toggle")).toHaveAttribute("aria-expanded", "true");

    const resultsLinkReached = await tabUntil(page, ".site-header__menu-panel a[href='#results']", 10);
    expect(resultsLinkReached).toBeTruthy();
    await page.keyboard.press("Enter");

    await expect(page).toHaveURL(/#results/);
    const resultsY = await page.locator("#results").evaluate((el) => el.getBoundingClientRect().top);
    expect(resultsY).toBeLessThan(120);
  });

  test("keyboard: floating CTA becomes focusable after scroll", async ({ page, baseURL }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(baseURL, { waitUntil: "networkidle" });

    await page.evaluate(() => window.scrollTo(0, 1000));
    await page.waitForTimeout(250);

    const floatingCta = page.locator(".floating-telegram__link");
    await expect(floatingCta).toHaveAttribute("tabindex", "0");
  });

  test("keyboard: results tabs react to arrows/home/end", async ({ page, baseURL }) => {
    await page.setViewportSize({ width: 920, height: 1180 });
    await page.goto(baseURL, { waitUntil: "networkidle" });
    await page.locator("#results").scrollIntoViewIfNeeded();

    const creamTab = page.locator("#resultsTab-cream");
    const drinkTab = page.locator("#resultsTab-drink");
    const petTab = page.locator("#resultsTab-pet");

    await creamTab.focus();
    await page.keyboard.press("ArrowRight");
    await expect(drinkTab).toHaveAttribute("aria-selected", "true");

    await page.keyboard.press("End");
    await expect(petTab).toHaveAttribute("aria-selected", "true");

    await page.keyboard.press("Home");
    await expect(creamTab).toHaveAttribute("aria-selected", "true");
  });
});
