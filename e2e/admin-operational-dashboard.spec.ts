import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

async function loginAdmin(page: Page) {
    await page.goto('/login');
    await page.locator('#email').fill('admin@teste.local');
    await page.locator('#password').fill('password');

    await Promise.all([
        page.waitForURL(/\/admin\/dashboard(\?.*)?$/, { timeout: 30_000 }),
        page.locator('[data-test="login-button"]').click(),
    ]);
}

test.describe('Painel operacional do admin', () => {
    test('Admin visualiza resumo, ferramentas e empréstimos ativos', async ({
        page,
    }) => {
        await loginAdmin(page);

        await expect(page.getByTestId('admin-dashboard-root')).toBeVisible();
        await expect(page.getByTestId('admin-dashboard-summary-total')).toBeVisible();
        await expect(page.getByTestId('admin-dashboard-summary-available')).toBeVisible();
        await expect(page.getByTestId('admin-dashboard-summary-rented')).toBeVisible();
        await expect(page.getByTestId('admin-dashboard-tools')).toBeVisible();
        await expect(page.getByTestId('admin-dashboard-rentals')).toBeVisible();
    });

    test('Filtros por status e busca textual atualizam a listagem', async ({
        page,
    }) => {
        await loginAdmin(page);

        await page.getByTestId('admin-filter-rental-status').selectOption('active');
        await page.getByTestId('admin-filter-search').fill('Furadeira');
        await page.getByRole('button', { name: 'Aplicar filtros' }).click();

        await expect(page).toHaveURL(/status=active/);
        await expect(page).toHaveURL(/q=Furadeira/);
        await expect(page.getByTestId('admin-dashboard-rentals')).toBeVisible();
    });

    test('Cliente não acessa painel operacional do admin', async ({ page }) => {
        await page.goto('/login');
        await page.locator('#email').fill('cliente@teste.local');
        await page.locator('#password').fill('password');

        await Promise.all([
            page.waitForURL(/\/cliente\/dashboard(\?.*)?$/, {
                timeout: 30_000,
            }),
            page.locator('[data-test="login-button"]').click(),
        ]);

        const response = await page.goto('/admin/dashboard');
        expect(response?.status()).toBe(403);
    });
});
