import { test, expect } from '@playwright/test';

test.describe('Catálogo público', () => {
    test('visitante abre /catalogo sem login', async ({ page }) => {
        const response = await page.goto('/catalogo');
        expect(response?.status()).toBe(200);
        await expect(page.getByRole('heading', { name: /Catálogo de ferramentas/i })).toBeVisible();
        await expect(page.getByTestId('catalog-nav')).toBeVisible();
    });

    test('filtros atualizam resultados e mantêm query na URL', async ({
        page,
    }) => {
        await page.goto('/catalogo');

        await page.getByTestId('catalog-filter-descricao').fill('furadeira_catalogo_token_xyz');
        await page.getByTestId('catalog-apply-filters').click();

        await expect(page).toHaveURL(/descricao=furadeira_catalogo_token_xyz/);
        await expect(page.getByText('Furadeira Catálogo E2E')).toBeVisible();
        await expect(page.getByText('Betoneira Premium Catálogo')).toHaveCount(0);
    });

    test('disponível sim oculta ferramenta indisponível no cadastro', async ({
        page,
    }) => {
        await page.goto('/catalogo');

        await page.selectOption('[data-testid="catalog-filter-disponivel"]', 'sim');
        await page.getByTestId('catalog-apply-filters').click();

        await expect(page.getByText('Ferramenta Indisponível Catálogo')).toHaveCount(
            0,
        );
        await expect(page.getByText('Furadeira Catálogo E2E')).toBeVisible();
    });

    test('período com empréstimo sobreposto oculta ferramenta ocupada', async ({
        page,
    }) => {
        await page.goto('/catalogo');

        await page.getByTestId('catalog-filter-periodo-inicio').fill('2030-06-03T09:00');
        await page.getByTestId('catalog-filter-periodo-fim').fill('2030-06-05T18:00');
        await page.getByTestId('catalog-apply-filters').click();

        await expect(page).toHaveURL(/periodo_inicio=/);
        await expect(page).toHaveURL(/periodo_fim=/);

        await expect(
            page.getByText('Ferramenta Alugada Período Catálogo'),
        ).toHaveCount(0);
        await expect(page.getByText('Furadeira Catálogo E2E')).toBeVisible();
    });

    test('paginação aparece quando há mais de uma página', async ({ page }) => {
        await page.goto('/catalogo');

        await expect(page.getByTestId('catalog-pagination')).toBeVisible();
        await expect(page.getByTestId('catalog-page-next')).toBeEnabled();

        await page.getByTestId('catalog-page-next').click();

        await expect(page).toHaveURL(/page=2/);
        await expect(page.getByTestId('catalog-results')).toBeVisible();
    });
});
