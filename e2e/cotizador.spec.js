import { test, expect } from '@playwright/test';

/**
 * E2E-03 — Cotizador con diagnóstico IA por síntomas.
 * Requiere: frontend en localhost:5173 + backend en localhost:8080 con Groq configurado.
 * Si el backend no está disponible, el cotizador muestra el formulario de síntomas de todos modos.
 */
test.describe('Cotizador inteligente', () => {

  // E2E-03 — Diagnóstico IA
  test('E2E-03: página /cotizador carga y muestra el formulario de diagnóstico', async ({ page }) => {
    await page.goto('/cotizador');

    // La página debe cargar sin error 404
    await expect(page).not.toHaveURL(/\/404|\/error/);

    // Debe haber algún campo de texto o área para describir el problema
    // El cotizador tiene un textarea para ingresar síntomas
    const entradaTexto = page.locator('textarea, input[type="text"]').first();
    await expect(entradaTexto).toBeVisible({ timeout: 10_000 });
  });

  test('E2E-03b: cotizador muestra sección de selección de servicios', async ({ page }) => {
    await page.goto('/cotizador');

    // La página debe tener el título o texto del cotizador
    await expect(page.locator('body')).toContainText(
      /cotiz|servicio|diagnós|problema|fallo/i, { timeout: 10_000 }
    );
  });
});