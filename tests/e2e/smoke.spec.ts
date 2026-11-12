import { test, expect } from '@playwright/test';
import cardapio from '../../src/data/cardapio.json' with { type: 'json' };

const { restaurante, categorias } = cardapio;

test('a página abre sem erros e mostra o restaurante', async ({ page }) => {
  const erros: string[] = [];
  page.on('pageerror', (e) => erros.push(e.message));
  page.on('console', (m) => m.type() === 'error' && erros.push(m.text()));

  const resposta = await page.goto('/');
  expect(resposta?.ok()).toBeTruthy();
  await expect(page).toHaveTitle(new RegExp(restaurante.nome));
  expect(erros, 'erros no console').toEqual([]);
});

test('todas as categorias do cardápio aparecem', async ({ page }) => {
  await page.goto('/');
  for (const c of categorias) {
    await expect(page.getByRole('heading', { name: c.nome }).first()).toBeVisible();
  }
});

test('existe o caminho para pedir no WhatsApp', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Pedir no WhatsApp').first()).toBeAttached();
});

test('não tem rolagem horizontal', async ({ page }) => {
  await page.goto('/');
  const sobra = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(sobra).toBeLessThanOrEqual(0);
});
