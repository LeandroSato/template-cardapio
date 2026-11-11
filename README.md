# _template-cardapio

Template base dos cardápios digitais. O protótipo usa o restaurante fictício **Sabor da Vila**.

Ele é uma página única e mobile-first, com:
- capa com o prato do dia;
- categorias e itens;
- comanda com pedido pelo WhatsApp;
- apps de delivery;
- endereço, horários e mapa;
- SEO local.

## Rodar no computador

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # gera a pasta dist/
```

Precisa do Node 22.12 ou mais novo. O Astro está fixado na versão 6, porque o Astro 7 exige o Node 22.23.

### Testar outro dia e horário

O prato do dia e o selo "Aberto/Fechado" usam o horário de São Paulo. Para mostrar ao cliente outro dia, coloque na URL:

```
http://localhost:4321/?dia=qua&hora=12:30
```

Os valores de `dia` são `dom`, `seg`, `ter`, `qua`, `qui`, `sex` e `sab`.

## Trocar de cliente

Todo o conteúdo fica em **`src/data/cardapio.json`**:

| Bloco | O que tem |
|---|---|
| `restaurante` | Slug, nome, tipo de comida, frase de capa, descrição (SEO), logo e URL final |
| `marca` | 4 cores: `primaria` (parede), `destaque` (preço e botão), `fundo` e `texto` |
| `contato` | WhatsApp só com dígitos e DDI (`5511999999999`) e telefone para exibir |
| `endereco` | Rua, bairro, cidade, CEP, ponto de referência e latitude/longitude do mapa |
| `horarios` | Faixas de horário. Os dias que não aparecem são mostrados como fechados |
| `delivery` | Links do iFood, 99Food e Keeta. Um link vazio esconde o botão daquele app |
| `pedido` | Se pede o nome do cliente e o texto do rodapé da mensagem |
| `categorias` | Categorias e itens. `preco` é um número (`34.9`). `dias` é opcional e serve para pratos do dia |

Depois de editar o JSON:
1. Troque `public/logo.svg` e `public/favicon.svg` pelos do cliente.
2. Coloque as fotos em `public/fotos/` (em WebP, quadradas, com uns 400 px) e preencha `"imagem": "/fotos/arquivo.webp"`. Sem foto, aparece o desenho de prato.
3. Rode `npm run og` para gerar a imagem de compartilhamento (`public/og.png`).
4. Confira com o **Checklist - QA** do vault.

## Deploy (Cloudflare Pages)

1. Suba o repositório no GitHub (privado).
2. No Cloudflare, abra **Workers & Pages → Create → Pages → Connect to Git** e escolha o repositório.
3. Use estas configurações:
   - framework: **Astro**;
   - build command: `npm run build`;
   - output: `dist`.

   A versão do Node vem do arquivo `.node-version`.
4. Ligue o domínio do cliente em **Custom domains**. O domínio fica registrado no nome do cliente, no Registro.br.
5. Atualize `restaurante.url` no JSON com o endereço final e faça um novo deploy. O sitemap e o Open Graph usam essa URL.

## Estrutura

```
src/
├── data/cardapio.json      ← único arquivo que muda por cliente
├── lib/                    ← tipos, preço em R$, links de mapa e mensagem do WhatsApp
├── components/             ← Capa, NavCategorias, Categoria, Comanda, Delivery, Localizacao, SeoLocal
├── scripts/                ← hoje.ts (dia/horário), carrinho.ts (comanda), navegacao.ts
├── layouts/Base.astro      ← fontes, cores da marca e <head>
└── pages/index.astro
scripts/gerar-og.mjs        ← gera public/og.png
```

As fontes são Alfa Slab One (títulos e preços), Figtree (texto) e Courier Prime (comanda). Ficam hospedadas no próprio site, via Fontsource.
