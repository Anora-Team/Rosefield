import { test, expect, type Page } from "@playwright/test";

// End-to-end coverage for the Route A demo. Each test exercises one of the
// four demo scenarios end-to-end in a real browser against the dev server,
// asserting on rendered Companion bubbles + Operations Theater panels.
//
// The app intentionally falls back to canned pipelines on API failure, so
// these tests pass even if the live Sonnet pipeline is slow or the
// ANTHROPIC_API_KEY is missing — the fallback cache returns identical
// narrative shape with the same Theater payload.

const TITLES = {
  intake: "Intake",
  profile: "Profile Hub",
  property: "Property Experience Hub",
  cultural: "Cultural Reasoning",
  composition: "Composition",
  actions: ["Action Routing", "Composition → Actions"], // either form is acceptable
};

async function waitForTheaterPanels(page: Page) {
  await expect(page.getByText(TITLES.intake, { exact: true })).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText(TITLES.profile, { exact: true })).toBeVisible();
  await expect(page.getByText(TITLES.property, { exact: true })).toBeVisible();
  await expect(page.getByText(TITLES.cultural, { exact: true })).toBeVisible();
  await expect(page.getByText(TITLES.composition, { exact: true })).toBeVisible();
  const actionsLocator = page.getByText(/Action Routing|Composition → Actions/);
  await expect(actionsLocator.first()).toBeVisible();
}

test.describe("Rosefield demo — Route A", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Cultural Resonance")).toBeVisible();
    await expect(page.getByText("Rosewood Sand Hill")).toBeVisible();
  });

  test("Liu — pre-arrival anniversary turn surfaces full pipeline + consent", async ({ page }) => {
    // Liu is the default persona; the opening guest message is pre-seeded.
    await expect(page.getByText(/25th anniversary trip/)).toBeVisible();

    // Submit the first turn.
    const input = page.getByPlaceholder("Write to the Companion…");
    await input.fill("We'd love something quiet for the first morning.");
    await page.getByRole("button", { name: /^Send$/ }).click();

    // Companion's first reply mentions the "quiet morning" framing.
    // Use .first() because the Composition panel quotes the guest_facing_body too.
    await expect(page.getByText(/quiet morning/i).first()).toBeVisible({ timeout: 15_000 });

    // Theater renders all six panels.
    await waitForTheaterPanels(page);

    // Action Routing should show at least one of the four routed teams.
    // Labels are title-cased in the DOM ("In-Room Dining" / "Housekeeping" / …).
    const teamCells = page.getByText(/in-room dining|housekeeping|concierge|garden/i);
    await expect(teamCells.first()).toBeVisible();

    // Submit a follow-up that should trip the consent gate.
    await input.fill("Yes, please plan it.");
    await page.getByRole("button", { name: /^Send$/ }).click();

    // Consent affordance buttons should appear when the next turn requests them.
    // (Liu Turn 2 has consent_required = true.)
    const yesBtn = page.getByRole("button", { name: /^Yes$/ }).first();
    await expect(yesBtn).toBeVisible({ timeout: 15_000 });
    await yesBtn.click();

    // After consent, the Action Routing panel flips to LIVE indicator.
    await expect(page.getByText(/LIVE|Live|live/).first()).toBeVisible();
  });

  test("Sarah — solo retreat pivot wires the softened reply + restaurant routing", async ({ page }) => {
    await page.getByRole("tab", { name: /Sarah/ }).click();
    await expect(page.getByText("Sarah Anderson")).toBeVisible();

    // Sarah's pre-seeded message about cancelling couples wine-pairing.
    await expect(page.getByText(/couples wine-pairing/)).toBeVisible();

    await page.getByPlaceholder("Write to the Companion…").fill("Yes — just dinner alone tonight.");
    await page.getByRole("button", { name: /^Send$/ }).click();

    // Sarah's pipeline reply. .first() — Composition panel also quotes the line.
    await expect(page.getByText(/book corner near the fire/i).first()).toBeVisible({ timeout: 15_000 });

    await waitForTheaterPanels(page);

    // Restaurant + concierge should be routed.
    await expect(page.getByText(/restaurant/i).first()).toBeVisible();
  });

  test("Patel — Jain dietary context routes kitchen + housekeeping", async ({ page }) => {
    await page.getByRole("tab", { name: /Patel/ }).click();
    await expect(page.getByText("Mr. & Mrs. Patel")).toBeVisible();

    await expect(page.getByText(/Jain dietary practice/)).toBeVisible();

    await page.getByPlaceholder("Write to the Companion…").fill("Thank you — also need a quiet prayer window.");
    await page.getByRole("button", { name: /^Send$/ }).click();

    await expect(page.getByText(/kitchen will be briefed/i).first()).toBeVisible({ timeout: 15_000 });

    await waitForTheaterPanels(page);

    await expect(page.getByText(/kitchen/i).first()).toBeVisible();
    await expect(page.getByText(/housekeeping/i).first()).toBeVisible();
  });

  test("Liu — mid-stay weather pivot fires when fog clears at midday", async ({ page }) => {
    // Stay on Liu. Run the pre-arrival turn so we have a pipeline + consent baseline.
    await page.getByPlaceholder("Write to the Companion…").fill("Plan something restful.");
    await page.getByRole("button", { name: /^Send$/ }).click();
    await waitForTheaterPanels(page);

    // Need consent to be given so the weather-pivot trigger fires.
    await page.getByPlaceholder("Write to the Companion…").fill("Yes, please.");
    await page.getByRole("button", { name: /^Send$/ }).click();
    const yesBtn = page.getByRole("button", { name: /^Yes$/ }).first();
    if (await yesBtn.isVisible().catch(() => false)) {
      await yesBtn.click();
    }

    // Scrub time to noon, then flip weather to clear.
    const timeSlider = page.getByRole("slider");
    await timeSlider.focus();
    // Default cursor sits at stop 3 (Sat 3pm) for Liu pre-arrival context. Move to Sat 12pm = stop 2.
    // Press ArrowLeft repeatedly to be index-agnostic, then ArrowRight to reach 12pm.
    for (let i = 0; i < 5; i++) await page.keyboard.press("ArrowLeft");
    for (let i = 0; i < 2; i++) await page.keyboard.press("ArrowRight");

    await page.getByRole("button", { name: "clear", exact: true }).click();

    // The proactive Companion line about fog lifting should appear.
    await expect(page.getByText(/fog has lifted/i).first()).toBeVisible({ timeout: 15_000 });

    // Theater re-reasons with the weather-pivot pipeline; garden should be routed.
    await expect(page.getByText(/garden/i).first()).toBeVisible();
  });
});
