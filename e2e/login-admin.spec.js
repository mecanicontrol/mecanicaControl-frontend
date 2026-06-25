import { test, expect } from '@playwright/test';

/**
 * E2E-02 — Login admin y acceso al dashboard.
 * Requiere: frontend en :5173 + backend en :8080 con usuario admin activo.
 *
 * En el ambiente de presentación, asegurarse de que exista un usuario ADMIN
 * con email y contraseña conocidos. Ajustar las constantes abajo si es necesario.
 */

const ADMIN_EMAIL    = 'admin@mecanicahub.cl';
const ADMIN_PASSWORD = 'Admin2026!';          // ajustar a la contraseña real del demo

test.describe('Login y dashboard admin', () => {

  // E2E-02 — Login y dashboard
  test('E2E-02: login como admin y ver el dashboard', async ({ page }) => {
    await page.goto('/login');

    // Debe mostrar el campo de email
    await expect(page.locator('input[type="email"], input[name="email"]').first())
      .toBeVisible({ timeout: 8_000 });

    // Llenar credenciales
    await page.locator('input[type="email"], input[name="email"]').first()
      .fill(ADMIN_EMAIL);
    await page.locator('input[type="password"]').first()
      .fill(ADMIN_PASSWORD);

    // Hacer click en el botón "INICIAR SESIÓN"
    await page.getByRole('button', { name: /iniciar sesión/i }).click();

    // Esperar redirección al panel del admin (requiere backend activo con credenciales válidas)
    await page.waitForURL(/\/(admin|dashboard|cliente)/, { timeout: 15_000 });
  });

  test('E2E-02b: página de login renderiza correctamente', async ({ page }) => {
    await page.goto('/login');

    // El formulario de login debe mostrar los campos de email y contraseña
    await expect(page.locator('input[type="email"], input[name="email"]').first())
      .toBeVisible({ timeout: 8_000 });
    await expect(page.locator('input[type="password"]').first())
      .toBeVisible({ timeout: 8_000 });
    await expect(page.getByRole('button', { name: /iniciar sesión/i }))
      .toBeVisible({ timeout: 8_000 });
  });
});
