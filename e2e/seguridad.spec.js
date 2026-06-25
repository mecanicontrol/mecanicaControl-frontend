import { test, expect } from '@playwright/test';

/**
 * E2E-04 — Acceso a ruta protegida sin sesión activa.
 * Este es el test más robusto: no requiere backend ni datos reales.
 */
test.describe('Seguridad de rutas', () => {

  // E2E-04 — Redireccion sin sesion
  test('E2E-04: acceder a /admin sin sesión redirige a /login', async ({ page }) => {
    await page.goto('/admin');

    // RutaProtegida redirige a /login si no hay usuario
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });
  });

  test('E2E-04b: acceder a /cliente/dashboard sin sesión redirige a /login', async ({ page }) => {
    await page.goto('/cliente/dashboard');

    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });
  });

  test('E2E-04c: acceder a /tecnico/dashboard sin sesión redirige a /login', async ({ page }) => {
    await page.goto('/tecnico/dashboard');

    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });
  });
});