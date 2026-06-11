import { test, expect  } from '@playwright/test';
import type {Page} from '@playwright/test';

async function loginAdmin(page: Page) {
    await page.goto('/login');
    await page.locator('#email').fill('admin@teste.local');
    await page.locator('#password').fill('password');

    await Promise.all([
        page.waitForURL(/\/admin\/dashboard(\?.*)?$/, { timeout: 30_000 }),
        page.locator('[data-test="login-button"]').click(),
    ]);
}

test.describe('Fluxo completo do admin (E2E)', () => {
    test('login, CRUD de ferramenta e painéis operacional e financeiro', async ({
        page,
    }) => {
        const toolName = `Lixadeira Orbital ${Date.now()}`;
        const updatedName = `${toolName} Revisada`;

        await loginAdmin(page);

        await page.goto('/admin/ferramentas');
        await expect(page).toHaveURL(/\/admin\/ferramentas/);
        await expect(
            page.getByRole('heading', { name: 'Ferramentas' }),
        ).toBeVisible();

        await page.getByRole('link', { name: 'Nova ferramenta' }).click();
        await expect(page).toHaveURL(/\/admin\/ferramentas\/criar/);

        await page.locator('#name').fill(toolName);
        await page.locator('#description').fill('Lixadeira orbital 1/4 de folha para acabamento em madeira');
        await page.locator('#hourly_rate').fill('42.50');

        await Promise.all([
            page.waitForURL(/\/admin\/ferramentas(\?.*)?$/),
            page.getByRole('button', { name: 'Salvar' }).click(),
        ]);

        await expect(page.getByText(toolName)).toBeVisible();

        await page.getByRole('link', { name: `Editar ${toolName}` }).click();
        await expect(page).toHaveURL(/\/admin\/ferramentas\/\d+\/editar/);

        await page.locator('#name').fill(updatedName);

        await Promise.all([
            page.waitForURL(/\/admin\/ferramentas\/\d+\/editar/),
            page.getByRole('button', { name: 'Salvar' }).click(),
        ]);

        await page.goto('/admin/ferramentas');
        await expect(page.getByText(updatedName)).toBeVisible();

        page.once('dialog', (dialog) => dialog.accept());

        await page.getByRole('button', { name: `Excluir ${updatedName}` }).click();

        await expect(page.getByText(updatedName)).toHaveCount(0);

        await page.goto('/admin/dashboard');
        await expect(page.getByTestId('admin-dashboard-root')).toBeVisible();
        await expect(
            page.getByTestId('admin-dashboard-summary-total'),
        ).toBeVisible();
        await expect(page.getByTestId('admin-dashboard-tools')).toBeVisible();

        await page.goto('/admin/financeiro');
        await expect(page).toHaveURL(/\/admin\/financeiro/);
        await expect(page.getByTestId('admin-finance-root')).toBeVisible();
        await expect(
            page.getByTestId('admin-finance-summary-total'),
        ).toBeVisible();
        await expect(page.getByTestId('admin-finance-payments')).toBeVisible();
    });
});
