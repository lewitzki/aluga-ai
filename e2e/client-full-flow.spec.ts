import { test, expect } from '@playwright/test';

test.describe('Fluxo completo do cliente (E2E)', () => {
    test('registro, catálogo, empréstimo e pagamento mockado', async ({
        page,
    }) => {
        const uniqueEmail = `cliente.e2e.${Date.now()}@teste.local`;

        await page.goto('/register');
        await page.locator('#name').fill('Cliente E2E Fluxo');
        await page.locator('#email').fill(uniqueEmail);
        await page.locator('#password').fill('password');
        await page.locator('#password_confirmation').fill('password');

        await Promise.all([
            page.waitForURL(/\/cliente\/dashboard(\?.*)?$/, {
                timeout: 30_000,
            }),
            page.locator('[data-test="register-user-button"]').click(),
        ]);

        await page.goto('/catalogo');
        await page
            .getByTestId('catalog-filter-descricao')
            .fill('furadeira_catalogo_token_xyz');
        await page.getByTestId('catalog-apply-filters').click();

        await page
            .getByRole('link', {
                name: /Ver detalhes de Furadeira Catálogo E2E/i,
            })
            .click();

        await expect(page.getByTestId('catalog-detail-cta-rental')).toBeVisible();

        await page
            .getByTestId('catalog-rental-starts-at')
            .fill('2032-01-10T10:00');
        await page
            .getByTestId('catalog-rental-ends-at')
            .fill('2032-01-11T18:00');

        await Promise.all([
            page.waitForURL(/\/cliente\/dashboard(\?.*)?$/, {
                timeout: 30_000,
            }),
            page.getByTestId('catalog-detail-cta-rental').click(),
        ]);

        await expect(page.getByTestId('dashboard-flash-success')).toBeVisible();

        const scheduledRow = page
            .getByTestId('client-dashboard-active')
            .locator('tr', { hasText: 'Furadeira Catálogo E2E' });
        await expect(scheduledRow).toBeVisible();

        const closeButton = scheduledRow.getByRole('button', {
            name: 'Encerrar',
        });

        await Promise.all([
            page.waitForURL(/\/cliente\/dashboard(\?.*)?$/),
            closeButton.click(),
        ]);

        await expect(page.getByTestId('dashboard-flash-success')).toContainText(
            'Pagamento aprovado',
        );
        await expect(
            page.getByTestId('client-dashboard-history'),
        ).toContainText('Furadeira Catálogo E2E');
    });
});
