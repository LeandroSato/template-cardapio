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

test('mostra se está aberto e destaca o horário do dia', async ({ page }) => {
  await page.goto('/?dia=qua&hora=12:30');
  await expect(page.locator('[data-status-aberto]')).toContainText('Aberto até');
  await expect(page.locator('[data-horario~="qua"]').first()).toHaveClass(/font-bold/);
});

test('todo botão sem texto tem nome acessível', async ({ page }) => {
  await page.goto('/');
  const semNome = await page.$$eval('button', (botoes) =>
    botoes
      .filter((b) => !(b.textContent ?? '').trim() && !b.getAttribute('aria-label'))
      .map((b) => b.outerHTML.slice(0, 80)),
  );
  expect(semNome).toEqual([]);
});

test('Pedir no WhatsApp da capa e da barra abrem a comanda', async ({ page }) => {
  await page.goto('/');
  const gatilhos = page.locator('[data-abrir-comanda]');
  for (let i = 0; i < (await gatilhos.count()); i++) {
    const gatilho = gatilhos.nth(i);
    if (!(await gatilho.isVisible())) continue;
    await gatilho.click();
    await expect(page.locator('dialog[open]')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('dialog[open]')).toHaveCount(0);
  }
});

test('no desktop o cartão de endereço da capa aparece ao lado do prato do dia', async ({ page, isMobile }) => {
  test.skip(!!isMobile, 'só vale no desktop');
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Horário e endereço' })).toBeVisible();
});

test('o único h1 é o nome do restaurante e o prato do dia é h2', async ({ page }) => {
  await page.goto('/?dia=qua&hora=12:30');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(restaurante.nome);
  const prato = await page.locator('[data-prato-hoje-nome]').innerText();
  await expect(page.getByRole('heading', { level: 2, name: prato })).toBeVisible();
});

test('o foco acompanha quem adiciona e tira itens do cardápio', async ({ page }) => {
  await page.goto('/');
  const controle = page.locator('[data-item]:not([data-dias]) [data-controle]').first();
  await controle.locator('[data-botao-adicionar]').click();
  await expect(page.locator(':focus')).toHaveAttribute('aria-label', /^Mais um /);
  await page.locator(':focus').click();
  await page.keyboard.press('Shift+Tab');
  await expect(page.locator(':focus')).toHaveAttribute('aria-label', /^Tirar um /);
  await page.locator(':focus').click();
  await page.locator(':focus').click();
  await expect(page.locator(':focus')).toHaveAttribute('data-botao-adicionar', '');
});

test('o foco fica na comanda ao mudar a quantidade', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-item]:not([data-dias]) [data-botao-adicionar]').first().click();
  await page.locator('[data-abrir-comanda]:visible').first().click();
  const mais = page.locator('[data-comanda-lista] [data-linha-mais]').first();
  await mais.click();
  await expect(page.locator(':focus')).toHaveAttribute('aria-label', /^Mais um /);
  await expect(page.locator('[data-comanda-lista] [data-linha-qtd]').first()).toHaveText('2');
});

test('a barra de pedido avisa o leitor de tela quando a comanda muda', async ({ page }) => {
  await page.goto('/');
  const aviso = page.locator('[data-barra-aviso]');
  await expect(aviso).toHaveAttribute('role', 'status');
  await page.locator('[data-item]:not([data-dias]) [data-botao-adicionar]').first().click();
  await expect(aviso).toContainText('1 item');
});

test('o botão Adicionar da capa diz qual é o prato', async ({ page }) => {
  await page.goto('/?dia=qua&hora=12:30');
  const prato = await page.locator('[data-prato-hoje-nome]').innerText();
  await expect(page.locator('[data-prato-hoje-botao]')).toHaveAttribute('aria-label', `Adicionar ${prato}`);
});
