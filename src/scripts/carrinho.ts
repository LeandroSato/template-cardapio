import { cardapio, formatarPreco, type Dia, type Item } from '../lib/cardapio';
import { linkWhatsApp, montarMensagem, totalPedido, type LinhaPedido } from '../lib/whatsapp';
import { disponivelHoje } from './hoje';

const CHAVE = `comanda:${cardapio.restaurante.slug}`;
const itens = new Map<string, Item>(cardapio.categorias.flatMap((c) => c.itens).map((i) => [i.id, i]));

/** id do item → quantidade */
let comanda = new Map<string, number>();

function carregar(dia: Dia) {
  try {
    const salvo = JSON.parse(localStorage.getItem(CHAVE) ?? '{}') as Record<string, number>;
    for (const [id, qtd] of Object.entries(salvo)) {
      if (itens.has(id) && qtd > 0 && disponivelHoje(id, dia)) comanda.set(id, Math.floor(qtd));
    }
  } catch {
    comanda = new Map();
  }
}

function salvar() {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(Object.fromEntries(comanda)));
  } catch {
    /* modo anônimo ou armazenamento cheio: a comanda vale só nesta visita */
  }
}

function linhas(): LinhaPedido[] {
  return [...comanda].map(([id, quantidade]) => {
    const item = itens.get(id)!;
    return { nome: item.nome, preco: item.preco, quantidade };
  });
}

function mudar(id: string, delta: number) {
  if (!itens.has(id)) return;
  const nova = (comanda.get(id) ?? 0) + delta;
  if (nova <= 0) comanda.delete(id);
  else comanda.set(id, Math.min(nova, 99));
  salvar();
  desenhar();
}

const pluralItens = (n: number) => `${n} ${n === 1 ? 'item' : 'itens'}`;

function desenhar() {
  const qtdTotal = [...comanda.values()].reduce((s, q) => s + q, 0);
  const total = formatarPreco(totalPedido(linhas()));

  // Controles de cada prato no cardápio
  document.querySelectorAll<HTMLElement>('[data-controle]').forEach((el) => {
    const qtd = comanda.get(el.dataset.controle!) ?? 0;
    el.querySelector('[data-botao-adicionar]')?.classList.toggle('hidden', qtd > 0);
    const stepper = el.querySelector<HTMLElement>('[data-stepper]');
    stepper?.classList.toggle('hidden', qtd === 0);
    stepper?.classList.toggle('flex', qtd > 0);
    const num = el.querySelector('[data-qtd]');
    if (num) num.textContent = String(qtd);
  });

  // Botão do prato do dia na capa
  const botaoCapa = document.querySelector<HTMLButtonElement>('[data-prato-hoje-botao]');
  if (botaoCapa) {
    const qtd = comanda.get(botaoCapa.dataset.adicionar ?? '') ?? 0;
    botaoCapa.textContent = qtd > 0 ? `+ Mais um (${qtd})` : 'Adicionar';
  }

  // Barra fixa
  const barraTexto = document.querySelector('[data-barra-texto]');
  const barraTotal = document.querySelector<HTMLElement>('[data-barra-total]');
  if (barraTexto) barraTexto.textContent = qtdTotal > 0 ? `Ver comanda · ${pluralItens(qtdTotal)}` : 'Pedir no WhatsApp';
  if (barraTotal) {
    barraTotal.hidden = qtdTotal === 0;
    barraTotal.textContent = total;
  }

  // Comanda aberta
  const lista = document.querySelector<HTMLElement>('[data-comanda-lista]');
  const modelo = document.querySelector<HTMLTemplateElement>('[data-modelo-linha]');
  if (lista && modelo) {
    lista.replaceChildren(
      ...[...comanda].map(([id, qtd]) => {
        const item = itens.get(id)!;
        const li = modelo.content.firstElementChild!.cloneNode(true) as HTMLElement;
        li.querySelector('[data-linha-nome]')!.textContent = item.nome;
        li.querySelector('[data-linha-subtotal]')!.textContent =
          `${qtd} × ${formatarPreco(item.preco)} = ${formatarPreco(item.preco * qtd)}`;
        li.querySelector('[data-linha-qtd]')!.textContent = String(qtd);
        const menos = li.querySelector<HTMLButtonElement>('[data-linha-menos]')!;
        const mais = li.querySelector<HTMLButtonElement>('[data-linha-mais]')!;
        menos.dataset.remover = id;
        mais.dataset.adicionar = id;
        menos.setAttribute('aria-label', `Tirar um ${item.nome}`);
        mais.setAttribute('aria-label', `Mais um ${item.nome}`);
        return li;
      }),
    );
  }
  const vazia = qtdTotal === 0;
  document.querySelector<HTMLElement>('[data-comanda-vazia]')!.hidden = !vazia;
  document.querySelector<HTMLElement>('[data-comanda-totalbloco]')!.hidden = vazia;
  document.querySelector<HTMLElement>('[data-limpar-comanda]')!.hidden = vazia;
  document.querySelector<HTMLButtonElement>('[data-comanda-enviar]')!.disabled = vazia;
  const totalEl = document.querySelector('[data-comanda-total]');
  if (totalEl) totalEl.textContent = total;
}

function enviar(form: HTMLFormElement) {
  const nome = (form.elements.namedItem('nome') as HTMLInputElement | null)?.value ?? '';
  const observacao = (form.elements.namedItem('observacao') as HTMLTextAreaElement | null)?.value ?? '';
  const erro = form.querySelector<HTMLElement>('[data-erro-nome]');

  if (cardapio.pedido.pedirNome && !nome.trim()) {
    erro?.classList.remove('hidden');
    const campo = form.elements.namedItem('nome') as HTMLInputElement;
    campo.setAttribute('aria-invalid', 'true');
    campo.focus();
    return;
  }
  erro?.classList.add('hidden');

  const mensagem = montarMensagem({
    restaurante: cardapio.restaurante.nome,
    linhas: linhas(),
    nomeCliente: nome,
    observacao,
    rodape: cardapio.pedido.rodapeMensagem,
  });
  window.location.href = linkWhatsApp(cardapio.contato.whatsapp, mensagem);
}

export function iniciarCarrinho(dia: Dia) {
  carregar(dia);

  const dialogo = document.querySelector<HTMLDialogElement>('[data-comanda]')!;
  const form = document.querySelector<HTMLFormElement>('[data-comanda-form]')!;

  const data = document.querySelector('[data-comanda-data]');
  if (data) data.textContent = new Date().toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });

  // Um único ouvinte para todos os botões + e −, inclusive os criados depois.
  document.addEventListener('click', (ev) => {
    const alvo = (ev.target as HTMLElement).closest<HTMLElement>('[data-adicionar], [data-remover]');
    if (!alvo || (alvo as HTMLButtonElement).disabled) return;
    if (alvo.dataset.adicionar) mudar(alvo.dataset.adicionar, +1);
    else if (alvo.dataset.remover) mudar(alvo.dataset.remover, -1);
  });

  document.querySelector('[data-abrir-comanda]')?.addEventListener('click', () => dialogo.showModal());
  document.querySelector('[data-fechar-comanda]')?.addEventListener('click', () => dialogo.close());
  // Toque fora da comanda fecha.
  dialogo.addEventListener('click', (ev) => {
    if (ev.target === dialogo) dialogo.close();
  });

  document.querySelector('[data-limpar-comanda]')?.addEventListener('click', () => {
    comanda.clear();
    salvar();
    desenhar();
  });

  form.addEventListener('submit', (ev) => {
    ev.preventDefault();
    enviar(form);
  });
  form.querySelector('[name="nome"]')?.addEventListener('input', (ev) => {
    const campo = ev.target as HTMLInputElement;
    if (campo.value.trim()) {
      campo.removeAttribute('aria-invalid');
      form.querySelector('[data-erro-nome]')?.classList.add('hidden');
    }
  });

  desenhar();
}
