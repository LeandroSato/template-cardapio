// Gera public/og.png (1200×630), a imagem que aparece quando o link é
// compartilhado no WhatsApp. Usa nome, cores e bairro do cardapio.json.
// Rode depois de trocar de cliente:  npm run og
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const dados = JSON.parse(await readFile(new URL('../src/data/cardapio.json', import.meta.url), 'utf8'));
const { restaurante: r, marca: m, endereco: e } = dados;

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

// Linhas do rejunte da faixa de azulejo
const azulejos = Array.from({ length: 56 }, (_, i) => `<line x1="${i * 22}" y1="560" x2="${i * 22}" y2="630" />`).join('');

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="${m.primaria}"/>
  <rect y="548" width="1200" height="12" fill="${m.primaria}"/>
  <rect y="560" width="1200" height="70" fill="#ffffff"/>
  <g stroke="#d9dcd6" stroke-width="2">${azulejos}
    <line x1="0" y1="582" x2="1200" y2="582"/><line x1="0" y1="604" x2="1200" y2="604"/><line x1="0" y1="626" x2="1200" y2="626"/>
  </g>
  <text x="80" y="150" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="34" letter-spacing="3" fill="${m.destaque}">${esc(r.tipoComida.toUpperCase())}</text>
  <text x="76" y="290" font-family="Rockwell, Georgia, serif" font-weight="900" font-size="128" fill="${m.fundo}">${esc(r.nome)}</text>
  <text x="80" y="370" font-family="Arial, Helvetica, sans-serif" font-size="40" fill="${m.fundo}" opacity="0.9">${esc(e.bairro)} · ${esc(e.cidade)}</text>
  <rect x="80" y="420" width="470" height="84" rx="14" fill="${m.destaque}"/>
  <text x="315" y="474" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="36" fill="${m.texto}">Peça pelo WhatsApp</text>
</svg>`;

await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(fileURLToPath(new URL('../public/og.png', import.meta.url)));
console.log('public/og.png gerado para', r.nome);
