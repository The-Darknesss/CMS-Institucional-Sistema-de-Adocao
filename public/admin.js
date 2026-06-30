document.addEventListener('DOMContentLoaded', () => {

    // (Opcional) LÓGICA DE SENHA SIMPLES
    /* ... (seu código de senha) ... */

    // --- Seletores de Elementos ---
    const formNoticia = document.getElementById('form-noticia');
    const mensagemNoticia = document.getElementById('mensagem-noticia');
    const containerAnimais = document.getElementById('animais-listagem');
    const containerNoticias = document.createElement('div');
    containerNoticias.id = 'noticias-listagem';
    document.querySelector('#gerenciar-noticias').appendChild(containerNoticias);

    // ✅ NOVOS SELETORES PARA O MODAL DE EDIÇÃO
    const editModal = document.getElementById('edit-modal');
    const formNoticiaEdit = document.getElementById('form-noticia-edit');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const mensagemNoticiaEdit = document.getElementById('mensagem-noticia-edit');

    // =======================================================
    // 1. GERENCIAMENTO DE NOTÍCIAS (CRIAR, LISTAR, DELETAR)
    // =======================================================

    // --- Lógica para ENVIAR o formulário de nova notícia ---
    formNoticia.addEventListener('submit', async (event) => {
        event.preventDefault(); 
        mensagemNoticia.textContent = 'Enviando notícia...';
        mensagemNoticia.style.color = 'blue';
        const formData = new FormData(formNoticia);
        try {
            const response = await fetch('/api/noticias', {
                method: 'POST',
                body: formData,
            });
            const result = await response.json();
            if (response.ok) {
                mensagemNoticia.textContent = 'Notícia publicada com sucesso!';
                mensagemNoticia.style.color = 'green';
                formNoticia.reset(); 
                buscarNoticias(); 
            } else {
                throw new Error(result.message || 'Erro desconhecido');
            }
        } catch (error) {
            mensagemNoticia.textContent = `Erro: ${error.message}`;
            mensagemNoticia.style.color = 'red';
            console.error('Erro ao enviar notícia:', error);
        }
    });

    // --- Funções para LISTAR e EXCLUIR notícias ---
    async function buscarNoticias() {
        try {
            const response = await fetch('/api/noticias');
            const noticias = await response.json();
            renderizarTabelaNoticias(noticias);
        } catch (error) {
            containerNoticias.innerHTML = '<p style="color: red;">Erro ao carregar notícias.</p>';
        }
    }

    function renderizarTabelaNoticias(noticias) {
        containerNoticias.innerHTML = '<h3>Notícias Publicadas</h3>';
        if (noticias.length === 0) {
            containerNoticias.innerHTML += '<p>Nenhuma notícia publicada ainda.</p>';
            return;
        }
        const tabela = document.createElement('table');
        tabela.innerHTML = `
            <thead><tr><th>Título</th><th>Data</th><th>Ações</th></tr></thead>
            <tbody></tbody>
        `;
        const tbody = tabela.querySelector('tbody');
        noticias.forEach(noticia => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${noticia.titulo}</td>
                <td>${new Date(noticia.dataPublicacao).toLocaleDateString('pt-BR')}</td>
                <td>
                    <button class="btn-editar" data-id="${noticia._id}" data-type="noticia-edit">Editar</button>
                    <button class="btn-excluir" data-id="${noticia._id}" data-type="noticia">Excluir</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
        containerNoticias.appendChild(tabela);
    }

    async function excluirNoticia(id) {
        if (!confirm('Tem certeza que deseja excluir esta notícia?')) return;
        try {
            const response = await fetch(`/api/noticias/${id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Falha na exclusão.');
            alert('Notícia excluída com sucesso!');
            buscarNoticias(); 
        } catch (error) {
            alert(`Erro ao excluir notícia: ${error.message}`);
        }
    }

    // =======================================================
    // ✅ 2. NOVA LÓGICA DE EDIÇÃO DE NOTÍCIAS
    // =======================================================

    // --- Função para abrir e preencher o modal de edição ---
    async function abrirModalEdicao(id) {
        mensagemNoticiaEdit.textContent = 'Carregando dados...';
        editModal.style.display = 'block'; // Mostra o modal

        try {
            const response = await fetch(`/api/noticias/${id}`); // Busca dados da notícia
            if (!response.ok) throw new Error('Não foi possível carregar os dados da notícia.');
            
            const noticia = await response.json();
            
            // Preenche o formulário de edição com os dados
            document.getElementById('noticia-id-edit').value = noticia._id;
            document.getElementById('titulo-edit').value = noticia.titulo;
            document.getElementById('conteudo-edit').value = noticia.conteudo;
            // Limpa o campo de arquivo, pois não podemos "preencher" ele por segurança
            document.getElementById('foto-noticia-edit').value = ''; 
            mensagemNoticiaEdit.textContent = '';
            
        } catch (error) {
            mensagemNoticiaEdit.textContent = `Erro: ${error.message}`;
            mensagemNoticiaEdit.style.color = 'red';
        }
    }

    // --- Lógica para ENVIAR o formulário de edição ---
    formNoticiaEdit.addEventListener('submit', async (event) => {
        event.preventDefault();
        mensagemNoticiaEdit.textContent = 'Salvando alterações...';
        mensagemNoticiaEdit.style.color = 'blue';

        const noticiaId = document.getElementById('noticia-id-edit').value;
        const formData = new FormData(formNoticiaEdit);

        try {
            const response = await fetch(`/api/noticias/${noticiaId}`, {
                method: 'PUT',
                body: formData, // Enviamos como FormData para incluir o arquivo (se houver)
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Erro ao salvar');

            mensagemNoticiaEdit.textContent = 'Alterações salvas com sucesso!';
            mensagemNoticiaEdit.style.color = 'green';

            // Fecha o modal e atualiza a lista
            setTimeout(() => {
                editModal.style.display = 'none';
                mensagemNoticiaEdit.textContent = '';
                buscarNoticias(); // Atualiza a lista de notícias na página
            }, 1500); // Espera 1.5s para o usuário ler a mensagem

        } catch (error) {
            mensagemNoticiaEdit.textContent = `Erro: ${error.message}`;
            mensagemNoticiaEdit.style.color = 'red';
        }
    });

    // --- Lógica para FECHAR o modal ---
    modalCloseBtn.addEventListener('click', () => {
        editModal.style.display = 'none';
    });
    // Fecha o modal se o usuário clicar fora do conteúdo
    window.addEventListener('click', (event) => {
        if (event.target == editModal) {
            editModal.style.display = 'none';
        }
    });


    // =======================================================
    // 3. GERENCIAMENTO DE ANIMAIS (Inalterado)
    // =======================================================
    // ... (Todo o seu código de buscarAnimais, renderizarTabelaAnimais, excluirAnimal) ...
    
    async function buscarAnimais() {
        try {
            const response = await fetch('/api/animais');
            const animais = await response.json();
            renderizarTabelaAnimais(animais);
        } catch (error) {
            containerAnimais.innerHTML = '<p style="color: red;">Erro ao carregar animais.</p>';
        }
    }

    function renderizarTabelaAnimais(animais) {
        containerAnimais.innerHTML = '';
        if (animais.length === 0) {
            containerAnimais.innerHTML = '<p>Nenhum animal cadastrado.</p>';
            return;
        }
        const tabela = document.createElement('table');
        tabela.innerHTML = `
            <thead><tr><th>Nome</th><th>Espécie/Raça</th><th>Contato</th><th>Data</th><th>Ações</th></tr></thead>
            <tbody></tbody>
        `;
        const tbody = tabela.querySelector('tbody');
        animais.forEach(animal => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${animal.nome}</td>
                <td>${animal.especie} / ${animal.raca}</td>
                <td>${animal.contato_tel}</td>
                <td>${new Date(animal.dataCadastro).toLocaleDateString('pt-BR')}</td>
                <td><button class="btn-excluir" data-id="${animal._id}" data-type="animal">Excluir</button></td>
            `;
            tbody.appendChild(tr);
        });
        containerAnimais.appendChild(tabela);
    }
    
    async function excluirAnimal(id) {
        if (!confirm('Tem certeza que deseja excluir este animal?')) return;
        try {
            const response = await fetch(`/api/animais-admin/${id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Falha na exclusão.');
            alert('Animal excluído com sucesso!');
            buscarAnimais(); 
        } catch (error) {
            alert(`Erro ao excluir animal: ${error.message}`);
        }
    }

    // =======================================================
    // 4. INICIALIZAÇÃO E EVENTOS GERAIS
    // =======================================================

    document.addEventListener('click', (event) => {
        const target = event.target;
        if (target.classList.contains('btn-excluir')) {
            const id = target.dataset.id;
            const type = target.dataset.type;
            if (type === 'noticia') {
                excluirNoticia(id);
            } else if (type === 'animal') {
                excluirAnimal(id);
            }
        }
        
        // ✅ NOVO: Escutador para o botão "Editar"
        if (target.classList.contains('btn-editar')) {
            const id = target.dataset.id;
            const type = target.dataset.type;
            if (type === 'noticia-edit') {
                abrirModalEdicao(id);
            }
        }
    });

    // Carrega os dados iniciais ao abrir a página
    buscarNoticias();
    buscarAnimais();
});