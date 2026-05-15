import { test, expect } from '@playwright/test';

async function login(
    page: import('@playwright/test').Page,
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

test.describe('Autenticação e perfil (fluxo navegador)', () => {
    test('Cliente redireciona para /cliente/dashboard após login', async ({
        page,
    }) => {
        await login(page, 'cliente@teste.local');
        await expect(page).toHaveURL(/\/cliente\/dashboard/);
    });

    test('Admin redireciona para /admin/dashboard após login', async ({
        page,
    }) => {
        await login(page, 'admin@teste.local');
        await expect(page).toHaveURL(/\/admin\/dashboard/);
    });

    test('Cliente recebe HTTP 403 ao abrir área administrativa diretamente', async ({
        page,
    }) => {
        await login(page, 'cliente@teste.local');
        const response = await page.goto('/admin/dashboard');
        expect(response?.status()).toBe(403);
    });

    test('Admin recebe HTTP 403 ao abrir área do cliente diretamente', async ({
        page,
    }) => {
        await login(page, 'admin@teste.local');
        const response = await page.goto('/cliente/dashboard');
        expect(response?.status()).toBe(403);
    });
});
