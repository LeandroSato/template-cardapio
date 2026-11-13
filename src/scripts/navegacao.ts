/** Destaca na barra fixa a categoria que está na tela. */
function destacarCategoriaVisivel() {
  const barra = document.querySelector<HTMLElement>('[data-nav-categorias]');
  const secoes = document.querySelectorAll<HTMLElement>('[data-secao-categoria]');
  if (!barra || !secoes.length || !('IntersectionObserver' in window)) return;

  const marcar = (id: string) => {
    barra.querySelectorAll<HTMLAnchorElement>('[data-nav-link]').forEach((a) => {
      const ativo = a.dataset.navLink === id;
      a.setAttribute('aria-current', ativo ? 'true' : 'false');
      if (ativo) {
        // Rola só a barra (não a página) para o chip ativo aparecer.
        const esquerda = a.offsetLeft - barra.offsetLeft - (barra.clientWidth - a.offsetWidth) / 2;
        barra.scrollTo({ left: esquerda, behavior: 'smooth' });
      }
    });
  };

  const observador = new IntersectionObserver(
    (entradas) => {
      const visivel = entradas.find((e) => e.isIntersecting);
      if (visivel) marcar(visivel.target.id);
    },
    { rootMargin: '-30% 0px -60% 0px' },
  );
  secoes.forEach((s) => observador.observe(s));
}

/** O mapa do Google só carrega quando a pessoa toca em "Ver no mapa". */
function mapaSobDemanda() {
  const botao = document.querySelector<HTMLButtonElement>('[data-carregar-mapa]');
  botao?.addEventListener('click', () => {
    const iframe = document.createElement('iframe');
    iframe.src = botao.dataset.carregarMapa!;
    iframe.title = 'Mapa com a localização do restaurante';
    iframe.className = 'absolute inset-0 size-full border-0';
    iframe.referrerPolicy = 'no-referrer-when-downgrade';
    botao.replaceWith(iframe);
  });
}

export function iniciarNavegacao() {
  destacarCategoriaVisivel();
  mapaSobDemanda();
}
