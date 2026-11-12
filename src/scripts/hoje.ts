import { cardapio, DIAS, NOME_DIA, formatarPreco, type Dia, type Item } from '../lib/cardapio';

const SEMANA: Record<string, Dia> = { Sun: 'dom', Mon: 'seg', Tue: 'ter', Wed: 'qua', Thu: 'qui', Fri: 'sex', Sat: 'sab' };

/**
 * Dia e hora em São Paulo, não no fuso do celular.
 * Para demonstrar ao cliente: ?dia=qua&hora=12:30 na URL força um dia/horário.
 */
function agora(): { dia: Dia; minutos: number } {
  const partes = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Sao_Paulo',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date());
  const valor = (t: string) => partes.find((p) => p.type === t)?.value ?? '';

  const params = new URLSearchParams(location.search);
  const diaForcado = params.get('dia') as Dia | null;
  const horaForcada = params.get('hora')?.match(/^(\d{1,2}):(\d{2})$/);

  const dia = diaForcado && DIAS.includes(diaForcado) ? diaForcado : (SEMANA[valor('weekday')] ?? 'seg');
  const minutos = horaForcada
    ? Number(horaForcada[1]) * 60 + Number(horaForcada[2])
    : Number(valor('hour')) * 60 + Number(valor('minute'));
  return { dia, minutos };
}

const paraMinutos = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};
const horaCurta = (hhmm: string) => hhmm.replace(/:00$/, 'h').replace(':', 'h');

const todosItens: Item[] = cardapio.categorias.flatMap((c) => c.itens);

/** Pratos com "dias" só podem ir para a comanda no dia deles. */
export function disponivelHoje(id: string, dia: Dia): boolean {
  const item = todosItens.find((i) => i.id === id);
  if (!item) return false;
  return !item.dias?.length || item.dias.includes(dia);
}

function statusAberto(dia: Dia, minutos: number) {
  const el = document.querySelector<HTMLElement>('[data-status-aberto]');
  if (!el) return;
  const horario = cardapio.horarios.find((h) => h.dias.includes(dia));
  let texto = 'Fechado hoje';
  if (horario) {
    const abre = paraMinutos(horario.abre);
    const fecha = paraMinutos(horario.fecha);
    if (minutos >= abre && minutos < fecha) texto = `Aberto até ${horaCurta(horario.fecha)}`;
    else if (minutos < abre) texto = `Abre às ${horaCurta(horario.abre)}`;
    else texto = 'Fechado agora';
  }
  el.textContent = texto;
  el.classList.remove('hidden');
}

function pratoDoDia(dia: Dia) {
  const bloco = document.querySelector<HTMLElement>('[data-prato-hoje]');
  if (!bloco) return;
  const pratos = todosItens.filter((i) => i.dias?.length);
  const set = (sel: string, texto: string) => {
    const el = bloco.querySelector<HTMLElement>(sel);
    if (el) el.textContent = texto;
  };

  const deHoje = pratos.find((p) => p.dias!.includes(dia));
  const botao = bloco.querySelector<HTMLButtonElement>('[data-prato-hoje-botao]');
  const aviso = bloco.querySelector<HTMLElement>('[data-prato-hoje-aviso]');

  if (deHoje) {
    set('[data-prato-hoje-dia]', `Hoje, ${NOME_DIA[dia]}`);
    set('[data-prato-hoje-nome]', deHoje.nome);
    set('[data-prato-hoje-descricao]', deHoje.descricao ?? '');
    set('[data-prato-hoje-preco]', formatarPreco(deHoje.preco));
    if (botao) botao.dataset.adicionar = deHoje.id;
    return;
  }

  // Sem prato hoje (ex.: domingo): mostra o próximo, sem botão de pedir.
  const hojeIdx = DIAS.indexOf(dia);
  for (let passo = 1; passo <= 7; passo++) {
    const proximoDia = DIAS[(hojeIdx + passo) % 7];
    const proximo = pratos.find((p) => p.dias!.includes(proximoDia));
    if (!proximo) continue;
    set('[data-prato-hoje-dia]', passo === 1 ? `Amanhã, ${NOME_DIA[proximoDia]}` : `Na ${NOME_DIA[proximoDia]}`);
    set('[data-prato-hoje-nome]', proximo.nome);
    set('[data-prato-hoje-descricao]', proximo.descricao ?? '');
    set('[data-prato-hoje-preco]', formatarPreco(proximo.preco));
    botao?.remove();
    if (aviso) {
      aviso.textContent = 'Hoje não tem prato do dia. Porções, bebidas e sobremesas seguem no cardápio abaixo.';
      aviso.classList.remove('hidden');
    }
    return;
  }
}

function itensDoDia(dia: Dia) {
  document.querySelectorAll<HTMLElement>('[data-item][data-dias]').forEach((li) => {
    const dias = (li.dataset.dias ?? '').split(' ').filter(Boolean);
    if (!dias.length) return;
    if (dias.includes(dia)) {
      li.querySelector('[data-rotulo-hoje]')?.classList.remove('hidden');
    } else {
      li.classList.add('opacity-60');
      const botao = li.querySelector<HTMLButtonElement>('[data-botao-adicionar]');
      if (botao) {
        botao.disabled = true;
        botao.title = 'Este prato não é servido hoje';
      }
    }
  });
}

function horarioDeHoje(dia: Dia) {
  document.querySelectorAll<HTMLElement>('[data-horario]').forEach((linha) => {
    if ((linha.dataset.horario ?? '').split(' ').includes(dia)) {
      linha.classList.add('bg-gema/25', 'font-bold', '-mx-2', 'px-2');
      linha.querySelector('dt')?.insertAdjacentHTML('beforeend', '<span class="sr-only"> (hoje)</span>');
    }
  });
}

export function iniciarHoje(): Dia {
  const { dia, minutos } = agora();
  statusAberto(dia, minutos);
  pratoDoDia(dia);
  itensDoDia(dia);
  horarioDeHoje(dia);
  return dia;
}
