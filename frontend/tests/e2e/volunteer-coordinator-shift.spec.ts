/**
 * @file: volunteer-coordinator-shift.spec.ts
 * @description: E2E-сценарій «волонтер подає заявку → координатор підтверджує → волонтер приєднується до зміни».
 * @dependencies: @playwright/test, tests/e2e/utils/apiClient
 * @created: 2025-11-09
 */

import { test, expect } from "@playwright/test";
import type { BrowserContext } from "@playwright/test";
import {
  createCampaign,
  createCampaignCategory,
  createCampaignShift,
  deleteCampaign,
  deleteCampaignCategory,
  deleteCampaignShift,
  findCampaignByTitle,
  isoDate,
  registerUser,
} from "./utils/apiClient";

const TEST_PASSWORD = process.env.PLAYWRIGHT_TEST_PASSWORD ?? "Playwright#12345";

test.describe("Флоу волонтера та координатора", () => {
  test("волонтер отримує підтвердження та приєднується до зміни", async ({
    page,
    browser,
  }) => {
    const now = Date.now();
    const volunteerEmail = `playwright-volunteer+${now}@example.com`;
    const coordinatorEmail = `playwright-coordinator+${now}@example.com`;
    const campaignTitle = `Playwright кампанія ${now}`;
    const campaignCategoryName = `Playwright категорія ${now}`;
    const motivation = "Готовий допомагати у реєстрації на зміни.";

    test.info().annotations.push({
      type: "dataset",
      description: `volunteer=${volunteerEmail}, coordinator=${coordinatorEmail}`,
    });

    const cleanupActions: Array<() => Promise<void>> = [];
    let coordinatorAccessToken: string | null = null;
    let coordinatorContext: BrowserContext | null = null;

    try {
      // 1. Реєструємо координатора та готуємо кампанію зі зміною через API.
      const coordinator = await registerUser({
        email: coordinatorEmail,
        password: TEST_PASSWORD,
        first_name: "Playwright",
        last_name: "Coordinator",
        role: "coordinator",
      });
      coordinatorAccessToken = coordinator.tokens.access;

      const category = await createCampaignCategory(
        {
          name: campaignCategoryName,
          description: "Категорія для e2e-перевірок.",
        },
        coordinatorAccessToken,
      );
      cleanupActions.push(async () => {
        if (!coordinatorAccessToken) return;
        await deleteCampaignCategory(category.id, coordinatorAccessToken);
      });

      const startDate = isoDate(new Date(Date.now() + 48 * 60 * 60 * 1000));
      const endDate = isoDate(new Date(Date.now() + 72 * 60 * 60 * 1000));

      await createCampaign(
        {
          title: campaignTitle,
          short_description:
            "E2E кампанія для тестування повного користувацького шляху.",
          description:
            "Автоматизований сценарій Playwright: волонтер подає заявку, координатор підтверджує, волонтер обирає зміну.",
          status: "published",
          category: category.id,
          location_name: "Центральний хаб",
          location_address: "м. Київ, вул. Прикладна, 1",
          region: "Київська",
          required_volunteers: 10,
          target_amount: 150000,
          start_date: startDate,
          end_date: endDate,
          contact_email: "coordinator@example.com",
          contact_phone: "+380501234567",
        },
        coordinatorAccessToken,
      );

      const campaign = await findCampaignByTitle(
        campaignTitle,
        coordinatorAccessToken,
      );
      cleanupActions.push(async () => {
        if (!coordinatorAccessToken) return;
        await deleteCampaign(campaign.slug, coordinatorAccessToken);
      });

      const shiftStart = new Date(Date.now() + 96 * 60 * 60 * 1000);
      const shiftEnd = new Date(shiftStart.getTime() + 3 * 60 * 60 * 1000);

      const shift = await createCampaignShift(
        {
          campaign_id: campaign.id,
          title: `Playwright зміна ${now}`,
          description: "Пакування гуманітарних наборів.",
          start_at: shiftStart.toISOString(),
          end_at: shiftEnd.toISOString(),
          capacity: 5,
          location_details: "Склад №3",
          instructions: "Прийти за 15 хв до початку, мати посвідчення.",
        },
        coordinatorAccessToken,
      );
      cleanupActions.push(async () => {
        if (!coordinatorAccessToken) return;
        await deleteCampaignShift(shift.id, coordinatorAccessToken);
      });

    const volunteer = await registerUser({
        email: volunteerEmail,
        password: TEST_PASSWORD,
        first_name: "Playwright",
        last_name: "Volunteer",
        role: "volunteer",
      });

      expect(volunteer.user.role).toBe("volunteer");

    // 2. Волонтер заходить у систему через UI та подає заявку на кампанію.
    await page.goto("/auth/login");
    await page.getByLabel("Email").fill(volunteerEmail);
    await page.getByLabel("Пароль").fill(TEST_PASSWORD);
    await page.getByRole("button", { name: "Увійти" }).click();
    await expect(page).toHaveURL(/\/dashboard$/);

      await page.goto(`/campaigns/${campaign.slug}`);
      const applyButton = page.getByRole("button", { name: "Подати заявку волонтера" });
      await expect(applyButton).toBeVisible();

      await page
        .getByLabel("Чому хочете долучитись? (опційно)")
        .fill(motivation);
      await applyButton.click();

      await expect(
        page.getByTestId("volunteer-application-status"),
      ).toHaveAttribute("data-status", "pending");

      // 3. Координатор у паралельному контексті підтверджує заявку через UI.
    coordinatorContext = await browser.newContext();
      const coordinatorPage = await coordinatorContext.newPage();
    await coordinatorPage.goto("/auth/login");
    await coordinatorPage.getByLabel("Email").fill(coordinatorEmail);
    await coordinatorPage.getByLabel("Пароль").fill(TEST_PASSWORD);
    await coordinatorPage.getByRole("button", { name: "Увійти" }).click();
    await expect(coordinatorPage).toHaveURL(/\/dashboard$/);

      const pendingApplicationCard = coordinatorPage
        .getByTestId("coordinator-application-card")
        .filter({
          hasText: volunteerEmail,
        });
      await expect(pendingApplicationCard).toBeVisible();
      await expect(
        pendingApplicationCard.getByTestId("coordinator-application-status"),
      ).toHaveAttribute("data-status", "pending");

      await coordinatorPage
        .getByRole("button", { name: "Підтвердити" })
        .first()
        .click();

      await expect(
        pendingApplicationCard.getByTestId("coordinator-application-status"),
      ).toHaveAttribute("data-status", "approved");

      // 4. Волонтер оновлює сторінку кампанії та записується на зміну.
      await page.reload();

      await expect(
        page.getByTestId("volunteer-application-status"),
      ).toHaveAttribute("data-status", "approved");

      const joinButton = page.getByRole("button", {
        name: "Приєднатися до зміни",
      });
      await expect(joinButton).toBeVisible();
      await joinButton.click();

      await expect(
        page.getByText("Ви приєдналися до зміни", { exact: false }),
      ).toBeVisible();

      const leaveButton = page.getByRole("button", { name: "Вийти зі зміни" });
      await expect(leaveButton).toBeVisible();

      await leaveButton.click();

      await expect(
        page.getByText("Зміну залишено", { exact: false }),
      ).toBeVisible();

      await expect(
        page.getByRole("button", { name: "Приєднатися до зміни" }),
      ).toBeVisible();
    } finally {
      if (coordinatorContext) {
        await coordinatorContext.close();
      }
      for (const cleanup of cleanupActions.reverse()) {
        try {
          await cleanup();
        } catch (error) {
          test.info().annotations.push({
            type: "cleanup-error",
            description: error instanceof Error ? error.message : String(error),
          });
        }
      }
    }
  });
});

