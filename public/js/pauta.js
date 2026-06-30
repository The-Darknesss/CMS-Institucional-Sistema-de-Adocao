document.addEventListener('DOMContentLoaded', () => {
    // Pega o contêiner onde as notícias da pauta serão inseridas
    const container = document.getElementById('pauta-noticias-container');
    
    // ✅ MUDANÇA CRUCIAL AQUI:
    // Em vez de 'document.currentScript', procuramos nosso script pelo ID
    const scriptTag = document.getElementById('script-pauta');

    // Se o contêiner ou a tag de script não existirem, paramos.
    if (!container) {
        console.error("Contêiner '#pauta-noticias-container' não encontrado na página.");
        return;
    }
    if (!scriptTag) {
        console.error("A tag <script> com o id='script-pauta' não foi encontrada.");
        return;
    }
    
    const categoriaFiltro = scriptTag.dataset.categoria;

    // Se a categoria não foi definida, paramos.
    if (!categoriaFiltro) {
        console.error("O atributo 'data-categoria' não foi definido na tag <script id='script-pauta'>");
        return;
    }

    // Monta a URL da API com o filtro de categoria
    const API_URL = `/api/noticias?categoria=${categoriaFiltro}`;
    container.innerHTML = '<p>Carregando notícias sobre esta pauta...</p>';

    async function buscarNoticiasFiltradas() {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) {
                throw new Error(`Erro na requisição: ${response.status}`);
            }
            const noticias = await response.json();
            renderizarNoticias(noticias);
        } catch (error) {
            container.innerHTML = `<p style="color: red;">Erro ao carregar notícias sobre ${categoriaFiltro}.</p>`;
            console.error('Erro ao buscar notícias:', error);
        }
    }

    function renderizarNoticias(noticias) {
        container.innerHTML = ''; // Limpa a mensagem "Carregando..."

        if (noticias.length === 0) {
            container.innerHTML = `<p style="text-align: center;">Nenhuma notícia encontrada para a categoria "${categoriaFiltro}".</p>`;
            return;
        }

        // Re-utiliza a mesma lógica de renderização da página 'noticias.js'
        noticias.forEach(noticia => {
            const noticiaElement = document.createElement('article');
            noticiaElement.className = 'noticia-item'; // Reutiliza o estilo de 'noticias.html'

            const dataFormatada = new Date(noticia.dataPublicacao).toLocaleDateString('pt-BR');
            let imagemHTML = '';
            if (noticia.imagemUrl) {
                imagemHTML = `<img src="${noticia.imagemUrl}" alt="${noticia.titulo}" class="noticia-imagem">`;
            }

            noticiaElement.innerHTML = `
                <h3 class="noticia-titulo">${noticia.titulo}</h3>
                <p class="noticia-data">Publicado em: ${dataFormatada}</p>
                ${imagemHTML}
                <p class="noticia-conteudo">${noticia.conteudo.replace(/\n/g, '<br>')}</p> 
            `;
            container.appendChild(noticiaElement);
        });
    }

    // Inicia o processo
    buscarNoticiasFiltradas();
});