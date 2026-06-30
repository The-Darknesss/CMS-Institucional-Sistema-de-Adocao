document.addEventListener('DOMContentLoaded', function() {
    const container = document.getElementById('animais-listagem');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const API_URL = '/api/animais'; 
    
    // Variável para armazenar a lista COMPLETA de animais
    let todosOsAnimais = []; 

    // Função que renderiza os cartões na tela
    function renderizarAnimais(animaisParaExibir) {
        container.innerHTML = ''; // Limpa a listagem atual

        if (animaisParaExibir.length === 0) {
            container.innerHTML = '<p style="text-align: center;">Nenhum animal encontrado para o filtro selecionado.</p>';
            return;
        }

        animaisParaExibir.forEach(animal => {
            const card = document.createElement('div');
            card.className = 'card-animal'; 
            
            // Variáveis para status de saúde (mantido do código anterior)
            const statusCastrado = animal.castrado === 'Sim' ? `<span style="color: #28a745; font-weight: bold;">Castrado</span>` : `<span style="color: #dc3545;">Não Castrado</span>`; 
            const statusVacinado = animal.vacinado === 'Sim' ? `<span style="color: #28a745; font-weight: bold;">Vacinado</span>` : `<span style="color: #dc3545;">Não Vacinado</span>`;

            card.innerHTML = `
                <img src="${animal.foto_url}" alt="Foto de ${animal.nome}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px; margin-bottom: 15px;">
                <h3>${animal.nome}</h3>
                <p><strong>Raça:</strong> ${animal.raca}</p>
                <p><strong>Idade:</strong> ${animal.idade} anos</p>
                <p><strong>Espécie:</strong> ${animal.especie} | <strong>Sexo:</strong> ${animal.sexo}</p>
                <hr style="margin: 10px 0; border-color: #eee;">
                <p><strong>Saúde:</strong> ${statusCastrado} e ${statusVacinado}</p>
                <p><strong>História:</strong> ${animal.descricao.substring(0, 150)}...</p>
                <a href="mailto:${animal.contato_email}?subject=Interesse em adotar ${animal.nome} (Tel: ${animal.contato_tel})" class="adote-btn">
                    Quero Adotar!
                </a>
                <p style="font-size: 0.8em; margin-top: 5px; color: #888;">Contato: ${animal.contato_tel}</p>
            `;
            
            container.appendChild(card);
        });
    }

    // Função que gerencia o filtro
    function aplicarFiltro(especie) {
        // 1. Remove a classe 'active' de todos os botões
        filterButtons.forEach(btn => btn.classList.remove('active'));
        
        // 2. Adiciona a classe 'active' no botão clicado
        document.querySelector(`[data-filter="${especie}"]`).classList.add('active');

        let animaisFiltrados = [];

        if (especie === 'all') {
            animaisFiltrados = todosOsAnimais;
        } else {
            // Filtra o array completo baseado na espécie (case-insensitive)
            animaisFiltrados = todosOsAnimais.filter(animal => 
                animal.especie.toLowerCase() === especie
            );
        }

        // 3. Redesenha a lista
        renderizarAnimais(animaisFiltrados);
    }
    
    // Adiciona o evento de clique aos botões
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const filtro = button.getAttribute('data-filter');
            aplicarFiltro(filtro);
        });
    });

    // Função principal que busca os dados
    async function buscarAnimaisCliente() { 
        try {
            const resposta = await fetch(API_URL);
            
            if (!resposta.ok) {
                throw new Error(`Falha na requisição: Status ${resposta.status}.`);
            }
            
            // Armazena a lista completa na variável global
            todosOsAnimais = await resposta.json();

            if (todosOsAnimais.length === 0) {
                 container.innerHTML = '<p style="text-align: center;">Nenhum animal cadastrado no momento.</p>';
                return;
            }
            
            // Inicia mostrando todos os animais (aplicando o filtro 'all')
            aplicarFiltro('all'); 

        } catch (erro) {
            console.error('Erro ao buscar animais:', erro);
            container.innerHTML = '<p style="color: red; text-align: center;">Erro ao carregar a lista. O servidor pode estar inativo.</p>';
        }
    }

    // Inicia a busca
    buscarAnimaisCliente();
});