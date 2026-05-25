import { test, expect } from '@playwright/test';

async function loginAdmin(page: import('@playwright/test').Page) {
    await page.goto('/login');
    await page.locator('#email').fill('admin@teste.local');
    await page.locator('#password').fill('password');

    await Promise.all([
        page.waitForURL(/\/admin\/dashboard(\?.*)?$/, { timeout: 30_000 }),
        page.locator('[data-test="login-button"]').click(),
    ]);
}

test.describe('Painel financeiro do admin', () => {
    test('Admin visualiza ganhos acumulados e historico de pagamentos', async ({
        page,
    }) => {
        await loginAdmin(page);

        const response = await page.goto('/admin/financeiro');
        expect(response?.status()).toBe(200);

        await expect(page.getByTestId('admin-finance-root')).toBeVisible();
        await expect(page.getByTestId('admin-finance-summary-total')).toBeVisible();
        await expect(page.getByTestId('admin-finance-summary-approved')).toBeVisible();
        await expect(page.getByTestId('admin-finance-period-revenue')).toBeVisible();
        await expect(page.getByTestId('admin-finance-payments')).toBeVisible();
    });

    test('Filtros por status e datas atualizam totais e historico', async ({
        page,
    }) => {
        await loginAdmin(page);
        await page.goto('/admin/financeiro');

        await page.getByTestId('admin-finance-filter-status').selectOption('approved');
        await page.getByTestId('admin-finance-filter-from').fill('2020-01-01');
        await page.getByTestId('admin-finance-filter-to').fill('2030-12-31');

        await Promise.all([
            page.waitForURL(/status=approved/),
            page.getByRole('button', { name: 'Aplicar filtros' }).click(),
        ]);

        await expect(page).toHaveURL(/status=approved/);
        await expect(page).toHaveURL(/from=2020-01-01/);
        await expect(page).toHaveURL(/to=2030-12-31/);
        await expect(page.getByTestId('admin-finance-payments')).toBeVisible();
    });

    test('Cliente nao acessa painel financeiro do admin', async ({ page }) => {
        await page.goto('/login');
        await page.locator('#email').fill('cliente@teste.local');
        await page.locator('#password').fill('password');

        await Promise.all([
            page.waitForURL(/\/cliente\/dashboard(\?.*)?$/, {
                timeout: 30_000,
            }),
            page.locator('[data-test="login-button"]').click(),
        ]);

        const response = await page.goto('/admin/financeiro');
        expect(response?.status()).toBe(403);
    });
});
