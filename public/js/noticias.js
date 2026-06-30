document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('noticias-container');
    const API_URL = '/api/noticias';

    async function buscarNoticias() {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) {
                throw new Error(`Erro na requisição: ${response.status}`);
            }
            const noticias = await response.json();
            renderizarNoticias(noticias);

        } catch (error) {
            container.innerHTML = '<p style="color: red; text-align: center;">Erro ao carregar as notícias. Tente novamente mais tarde.</p>';
            console.error('Erro ao buscar notícias:', error);
        }
    }

    function renderizarNoticias(noticias) {
        container.innerHTML = ''; // Limpa a mensagem "Carregando..."

        if (noticias.length === 0) {
            container.innerHTML = '<p style="text-align: center;">Nenhuma notícia publicada no momento.</p>';
            return;
        }

        // Variável para rastrear o mês/ano atual
        let mesAnoAtual = ""; 

        noticias.forEach(noticia => {
            const data = new Date(noticia.dataPublicacao);
            const dataFormatada = data.toLocaleDateString('pt-BR');
            const mes = data.toLocaleString('pt-BR', { month: 'long' });
            const ano = data.getFullYear();
            
            // Capitaliza a primeira letra do mês (ex: "outubro" -> "Outubro")
            const mesCapitalizado = mes.charAt(0).toUpperCase() + mes.slice(1);
            const mesAno = `${mesCapitalizado} de ${ano}`;

            // ✅ REQUISIÇÃO 3: Adiciona o separador de mês
            // Se o mês/ano desta notícia for diferente do anterior, cria o título
            if (mesAno !== mesAnoAtual) {
                mesAnoAtual = mesAno; // Atualiza o rastreador
                const separadorMes = document.createElement('h2');
                separadorMes.className = 'separador-mes'; // Classe para estilizar no CSS
                separadorMes.textContent = mesAno;
                container.appendChild(separadorMes);
            }

            // --- Cria o elemento da notícia ---
            const noticiaElement = document.createElement('article');
            noticiaElement.className = 'noticia-item'; // Classe para o separador visível

            // Monta a imagem (se existir)
            let imagemHTML = '';
            if (noticia.imagemUrl) {
                imagemHTML = `<img src="${noticia.imagemUrl}" alt="${noticia.titulo}" class="noticia-imagem">`;
            }

            // ✅ REQUISIÇÃO 1: Título e Data em cima da Imagem
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
    buscarNoticias();
});