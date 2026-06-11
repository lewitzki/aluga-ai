import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

async function login(
    page: Page,
    email: string,
    password = 'password',
) {
    await page.goto('/login');
    await page.locator('#email').fill(email);
    await page.locator('#password').fill(password);

    await Promise.all([
        page.waitForURL(
            /\/(admin\/dashboard|cliente\/dashboard)(\?.*)?$/,
            {
                timeout: 30_000,
            },
        ),
        page.locator('[data-test="login-button"]').click(),
    ]);
}

test.describe('Painel do cliente — empréstimos e histórico', () => {
    test('Cliente visualiza empréstimos ativos, histórico e total pago', async ({
        page,
    }) => {
        await login(page, 'cliente@teste.local');

        await expect(page.getByTestId('client-dashboard-root')).toBeVisible();
        await expect(page.getByTestId('client-dashboard-total-paid')).toHaveText(
            /R\$\s*7\.150,00/,
        );

        await expect(
            page.getByTestId('client-dashboard-active'),
        ).toBeVisible();
        await expect(
            page.getByTestId('client-dashboard-active'),
        ).toContainText('Furadeira Catálogo E2E');
        await expect(
            page.getByTestId('client-dashboard-active'),
        ).toContainText('Ativo');
        await expect(
            page.getByTestId('client-dashboard-active'),
        ).toContainText('Ferramenta Alugada Período Catálogo');
        await expect(
            page.getByTestId('client-dashboard-active'),
        ).toContainText('Agendado');

        await expect(
            page.getByTestId('client-dashboard-history'),
        ).toBeVisible();
        await expect(
            page.getByTestId('client-dashboard-history'),
        ).toContainText('Betoneira Premium Catálogo');
    });

    test('Cliente encerra empréstimo agendado e vê confirmação', async ({
        page,
    }) => {
        await login(page, 'cliente@teste.local');

        const scheduledRow = page
            .getByTestId('client-dashboard-active')
            .locator('tr', {
                hasText: 'Ferramenta Alugada Período Catálogo',
            });
        await expect(scheduledRow).toBeVisible();

        const closeButton = scheduledRow.getByRole('button', {
            name: 'Encerrar',
        });
        await expect(closeButton).toBeVisible();

        await Promise.all([
            page.waitForURL(/\/cliente\/dashboard(\?.*)?$/),
            closeButton.click(),
        ]);

        await expect(page.getByTestId('dashboard-flash-success')).toContainText(
            'Empréstimo encerrado',
        );
        await expect(page.getByTestId('dashboard-flash-success')).toContainText(
            'Pagamento aprovado',
        );
        await expect(
            page.getByTestId('client-dashboard-history'),
        ).toContainText('Ferramenta Alugada Período Catálogo');
    });
});
