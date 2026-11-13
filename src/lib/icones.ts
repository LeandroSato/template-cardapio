// Conjunto único de ícones do site (react-icons, família Lucide: traço fino e sóbrio).
// Para usar um ícone novo, importe aqui e dê um nome em português.
import {
  LuClock,
  LuExternalLink,
  LuMapPin,
  LuMinus,
  LuNavigation,
  LuPhone,
  LuPlus,
  LuShoppingBag,
  LuUtensils,
  LuX,
} from 'react-icons/lu';
import { FaWhatsapp } from 'react-icons/fa6';

export const icones = {
  relogio: LuClock,
  externo: LuExternalLink,
  local: LuMapPin,
  menos: LuMinus,
  rota: LuNavigation,
  telefone: LuPhone,
  mais: LuPlus,
  sacola: LuShoppingBag,
  talher: LuUtensils,
  fechar: LuX,
  whatsapp: FaWhatsapp,
} as const;

export type NomeIcone = keyof typeof icones;
