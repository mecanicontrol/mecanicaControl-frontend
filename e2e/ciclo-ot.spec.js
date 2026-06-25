import { test, expect } from '@playwright/test';

/**
 * E2E-06 — Ciclo completo de OT.
 * Valida que las páginas del flujo de OT cargan correctamente.
 * El ciclo completo (admin confirma → crea OT → técnico avanza fases → seguimiento)
 * requiere datos reales; aquí validamos que cada pantalla del flujo es accesible.
 */

test.describe('Ciclo de Orden de Trabajo', () => {

  // E2E-06a — Panel admin de OT
  test('E2E-06: /admin/ot sin sesión redirige a /login', async ({ page }) => {
    await page.goto('/admin/ot');

    // Sin sesión, RutaProtegida redirige
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });
  });

  // E2E-06b — Panel técnico de órdenes
  test('E2E-06b: /tecnico/ordenes sin sesión redirige a /login', async ({ page }) => {
    await page.goto('/tecnico/ordenes');

    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });
  });

  // E2E-06c — Seguimiento público (sin sesión)
  test('E2E-06c: /seguimiento es accesible públicamente (sin login)', async ({ page }) => {
    await page.goto('/seguimiento');

    // Seguimiento es público — no debe redirigir a login
    await expect(page).not.toHaveURL(/\/login/);

    // Debe mostrar algún contenido de seguimiento
    await expect(page.locator('body')).toContainText(
      /seguimiento|orden|vehículo|patente|OT/i, { timeout: 10_000 }
    );
  });

  // E2E-06d — Home page carga correctamente
  test('E2E-06d: la página principal carga y muestra los CTAs principales', async ({ page }) => {
    await page.goto('/');

    await expect(page).not.toHaveURL(/\/404/);

    // La home debe tener algún call-to-action principal
    await expect(page.locator('body')).toContainText(
      /cotiz|agendar|taller|mecánica|servicio/i, { timeout: 10_000 }
    );
  });
});