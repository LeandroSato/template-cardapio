import { formatarPreco } from './cardapio';

export interface LinhaPedido {
  nome: string;
  preco: number;
  quantidade: number;
}

export interface DadosPedido {
  restaurante: string;
  linhas: LinhaPedido[];
  nomeCliente: string;
  observacao: string;
  rodape?: string;
}

export function totalPedido(linhas: LinhaPedido[]): number {
  // Soma em centavos para não acumular erro de ponto flutuante.
  const centavos = linhas.reduce((s, l) => s + Math.round(l.preco * 100) * l.quantidade, 0);
  return centavos / 100;
}

/** Texto que chega no WhatsApp do restaurante. */
export function montarMensagem(p: DadosPedido): string {
  const itens = p.linhas
    .map((l) => `${l.quantidade}x ${l.nome} – ${formatarPreco(l.preco * l.quantidade)}`)
    .join('\n');

  const partes = [
    `Olá, ${p.restaurante}! Quero fazer um pedido:`,
    '',
    itens,
    '',
    `*Total: ${formatarPreco(totalPedido(p.linhas))}*`,
  ];
  if (p.nomeCliente.trim()) partes.push(`Nome: ${p.nomeCliente.trim()}`);
  if (p.observacao.trim()) partes.push(`Observação: ${p.observacao.trim()}`);
  if (p.rodape) partes.push('', `_${p.rodape}_`);
  return partes.join('\n');
}

/** Link wa.me com a mensagem pronta. `numero` só com dígitos, com DDI (ex.: 5511999999999). */
export function linkWhatsApp(numero: string, mensagem: string): string {
  const digitos = numero.replace(/\D/g, '');
  return `https://wa.me/${digitos}?text=${encodeURIComponent(mensagem)}`;
}
