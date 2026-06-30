document.addEventListener('DOMContentLoaded', () => {
    
    // --- Elementos do Carrossel ---
    const container = document.getElementById('slides-container');
    // ✅ NOVO ELEMENTO
    const descriptionElement = document.getElementById('carousel-news-description');
    const API_URL = '/api/noticias';
    let slides = [];
    let currentSlideIndex = 0;
    const SLIDE_INTERVAL = 8000;

    // --- Elementos do Modal ---
    const modalOverlay = document.getElementById('news-modal');
    // ... (o resto dos seletores do modal) ...
    const modalTitle = document.getElementById('modal-news-title');
    const modalImage = document.getElementById('modal-news-image');
    const modalDate = document.getElementById('modal-news-date');
    const modalContent = document.getElementById('modal-news-content');
    const modalCloseBtn = document.getElementById('modal-close-btn');

    // ✅ NOVA FUNÇÃO: Para criar o resumo de 3 linhas
    /**
     * Cria um resumo curto (snippet) a partir de um texto longo.
     * Limita a ~3 linhas (aprox. 150 caracteres) e adiciona "..."
     */
    function createSnippet(text) {
        if (!text) return "";
        const maxLength = 150; // Limite de caracteres
        
        // Remove tags HTML (caso haja alguma)
        const cleanText = text.replace(/<[^>]*>/g, ''); 
        
        if (cleanText.length <= maxLength) {
            return cleanText;
        }
        // Corta o texto e adiciona "..." no final
        return cleanText.substring(0, maxLength).trim() + "...";
    }

    // --- Lógica do Carrossel ---
    async function fetchRecentNews() {
        if (!container) return; 
        
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error('Falha ao buscar notícias');
            
            const noticias = await response.json();
            const recentNews = noticias.slice(0, 5); 

            if (recentNews.length === 0) {
                container.innerHTML = '<p style="text-align: center;">Nenhuma notícia publicada no momento.</p>';
                if (descriptionElement) descriptionElement.style.display = 'none'; // Esconde o parágrafo
                return;
            }

            renderSlides(recentNews); 
            startCarousel();

        } catch (error) {
            container.innerHTML = '<p style="color: red; text-align: center;">Erro ao carregar notícias.</p>';
            if (descriptionElement) descriptionElement.textContent = ''; // Limpa o parágrafo
            console.error(error);
        }
    }

    function renderSlides(newsItems) {
        container.innerHTML = ''; 
        
        newsItems.forEach((item, index) => {
            const slide = document.createElement('div');
            slide.className = 'carousel-slide';
            slide.style.cursor = 'pointer'; 
            
            if (index === 0) slide.classList.add('active');

            const imageUrl = item.imagemUrl ? `url(${item.imagemUrl})` : '#333';
            slide.style.backgroundImage = imageUrl;

            // =====================================
            // ✅ MUDANÇA: Adicionando o 'data-descricao'
            // =====================================
            slide.dataset.titulo = item.titulo;
            slide.dataset.conteudo = item.conteudo; // Conteúdo completo (para o modal)
            slide.dataset.imagem = item.imagemUrl || '';
            slide.dataset.data = new Date(item.dataPublicacao).toLocaleDateString('pt-BR');
            // ✅ Adiciona o novo resumo (snippet) ao dataset
            slide.dataset.descricao = createSnippet(item.conteudo); 
            // =====================================
            // ✅ FIM DA MUDANÇA
            // =====================================

            slide.innerHTML = `<div class="caption"><h3>${item.titulo}</h3></div>`;
            container.appendChild(slide);
        });

        slides = document.querySelectorAll('.carousel-slide');
        
        // ✅ ATUALIZAÇÃO: Mostra a descrição da primeira notícia assim que carrega
        if (slides.length > 0) {
            updateNewsDescription(slides[0]); // Passa o primeiro slide (o ativo)
        }
    }

    // ✅ NOVA FUNÇÃO: Para atualizar o parágrafo
    function updateNewsDescription(activeSlide) {
        if (descriptionElement && activeSlide) {
            // Pega o texto do resumo que guardamos no dataset
            descriptionElement.textContent = activeSlide.dataset.descricao;
        }
    }

    // Clique no carrossel (para o Modal)
    if (container) {
        container.addEventListener('click', () => {
            const activeSlide = container.querySelector('.carousel-slide.active');
            if (activeSlide) {
                openNewsModal(activeSlide.dataset);
            }
        });
    }

    function startCarousel() {
        if (slides.length <= 1) return;

        setInterval(() => {
            if (slides.length > 0) {
                // 1. Esconde o slide atual
                slides[currentSlideIndex].classList.remove('active');
                
                // 2. Calcula o próximo
                currentSlideIndex = (currentSlideIndex + 1) % slides.length;
                
                // 3. Mostra o próximo slide
                const newActiveSlide = slides[currentSlideIndex];
                newActiveSlide.classList.add('active');
                
                // 4. ✅ ATUALIZAÇÃO: Atualiza o texto da descrição
                updateNewsDescription(newActiveSlide);
            }
        }, SLIDE_INTERVAL);
    }

    // --- Funções do Modal (Inalteradas) ---
    function openNewsModal(data) {
        modalTitle.textContent = data.titulo;
        modalDate.textContent = `Publicado em: ${data.data}`;
        modalContent.innerHTML = data.conteudo.replace(/\n/g, '<br>'); // Usa o conteúdo completo

        if (data.imagem) {
            modalImage.src = data.imagem;
            modalImage.alt = data.titulo;
            modalImage.style.display = 'block';
        } else {
            modalImage.style.display = 'none';
        }
        modalOverlay.classList.add('active');
    }

    function closeNewsModal() {
        modalOverlay.classList.remove('active');
    }

    if(modalCloseBtn) modalCloseBtn.addEventListener('click', closeNewsModal);
    if(modalOverlay) modalOverlay.addEventListener('click', (event) => {
        if (event.target === modalOverlay) {
            closeNewsModal();
        }
    });

    // --- Lógica do Submenu da Sidebar (Inalterada) ---
    const triggerParticipacoes = document.getElementById('trigger-participacoes');
    const submenuParticipacoes = document.getElementById('submenu-participacoes');
    if (triggerParticipacoes && submenuParticipacoes) {
        triggerParticipacoes.addEventListener('click', () => {
            submenuParticipacoes.classList.toggle('active');
            triggerParticipacoes.classList.toggle('active');
        });
    }
    
    // --- Inicia o Carrossel ---
    fetchRecentNews();
});