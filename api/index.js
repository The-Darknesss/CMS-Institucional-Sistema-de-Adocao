// VERSÃO CORRIGIDA FINAL - 16 DE OUTUBRO
console.log("--- EXECUTANDO A VERSÃO MAIS RECENTE DO SERVIDOR ---");

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const dotenv = require('dotenv');
const multer = require('multer'); 
const { put } = require('@vercel/blob');

dotenv.config();
const app = express();

// =======================================================
// 1. CONEXÃO E SCHEMAS
// =======================================================

const MONGODB_URI = process.env.MONGODB_URI; 
// ✅ CORREÇÃO: Removido o { dbName: ... } que estava causando o conflito
mongoose.connect(MONGODB_URI)
    .then(() => console.log('✅ Conexão com o MongoDB estabelecida com sucesso!'))
    .catch(err => console.error('❌ Erro na conexão com o MongoDB:', err));

const animalSchema = new mongoose.Schema({
    nome: { type: String, required: true },
    especie: { type: String, required: true },
    idade: { type: Number, required: true },
    raca: { type: String, required: true },
    castrado: { type: String, required: true },
    vacinado: { type: String, required: true },
    contato_tel: { type: String, required: true },
    contato_email: { type: String, required: false }, 
    sexo: String,
    descricao: String,
    foto_url: { type: String, required: true }, 
    dataCadastro: { type: Date, default: Date.now }
});

const noticiaSchema = new mongoose.Schema({
    titulo: { type: String, required: true },
    conteudo: { type: String, required: true },
    // ✅ MUDANÇA 1: Adicionado o campo 'categoria'
    categoria: { type: String, required: true },
    imagemUrl: { type: String, required: false },
    dataPublicacao: { type: Date, default: Date.now }
});

const Animal = mongoose.models.Animal || mongoose.model('Animal', animalSchema);
const Noticia = mongoose.models.Noticia || mongoose.model('Noticia', noticiaSchema);

// =======================================================
// 2. MIDDLEWARES
// =======================================================

const upload = multer({ storage: multer.memoryStorage() }); 
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// =======================================================
// 3. ROTAS DA API (Vêm primeiro)
// =======================================================

// --- ROTAS DE ANIMAIS ---
// (Seu código original 100% intacto)
app.post('/enviar-dados', upload.single('foto'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).send('Nenhuma foto enviada.');
        const blob = await put(req.file.originalname + '-' + Date.now(), req.file.buffer, {
            access: 'public',
            token: process.env.BLOB_READ_WRITE_TOKEN
        });
        const novoAnimal = new Animal({ ...req.body, foto_url: blob.url }); 
        await novoAnimal.save(); 
        res.redirect(302, '/sucesso.html'); 
    } catch (error) {
        res.status(500).send(`Erro interno no servidor: ${error.message}`);
    }
});

app.get('/api/animais', async (req, res) => {
    try {
        const animais = await Animal.find({}).sort({ dataCadastro: -1 });
        res.json(animais); 
    } catch (error) {
        res.status(500).json({ message: 'Erro interno ao buscar dados.' });
    }
});

app.delete('/api/animais-admin/:id', async (req, res) => {
    try {
        const resultado = await Animal.findByIdAndDelete(req.params.id);
        if (!resultado) return res.status(404).json({ message: 'Animal não encontrado.' });
        res.status(200).json({ message: 'Animal excluído com sucesso!' });
    } catch (error) {
        res.status(500).json({ message: 'Erro interno ao excluir dado.' });
    }
});

// --- ROTAS DE NOTÍCIAS (COM UPLOAD DE IMAGEM) ---
app.post('/api/noticias', upload.single('foto_noticia'), async (req, res) => {
    try {
        let imagemUrlParaSalvar = null;
        if (req.file) {
            const blob = await put(req.file.originalname + '-' + Date.now(), req.file.buffer, {
                access: 'public',
                token: process.env.BLOB_READ_WRITE_TOKEN
            });
            imagemUrlParaSalvar = blob.url;
        }
        const novaNoticiaData = {
            titulo: req.body.titulo,
            conteudo: req.body.conteudo,
            // ✅ MUDANÇA 2: Campo 'categoria' sendo salvo
            categoria: req.body.categoria,
            imagemUrl: imagemUrlParaSalvar
        };
        const novaNoticia = new Noticia(novaNoticiaData);
        await novaNoticia.save();
        res.status(201).json({ message: 'Notícia publicada com sucesso!', data: novaNoticia });
    } catch (error) {
        console.error('Erro ao salvar notícia:', error);
        res.status(500).json({ message: 'Erro ao salvar notícia.', error: error.message });
    }
});

// ✅ MUDANÇA 3: Rota 'GET' de notícias agora com filtro
app.get('/api/noticias', async (req, res) => {
    try {
        const filtro = {}; 
        if (req.query.categoria) {
            filtro.categoria = req.query.categoria; 
        }
        const noticias = await Noticia.find(filtro).sort({ dataPublicacao: -1 });
        res.json(noticias);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar notícias.' });
    }
});

app.delete('/api/noticias/:id', async (req, res) => {
    try {
        const resultado = await Noticia.findByIdAndDelete(req.params.id);
        if (!resultado) return res.status(404).json({ message: 'Notícia não encontrada.' });
        res.status(200).json({ message: 'Notícia excluída com sucesso!' });
    } catch (error) {
        res.status(500).json({ message: 'Erro interno ao excluir notícia.' });
    }
});

// =======================================================
// ✅ ROTAS DE EDIÇÃO DE NOTÍCIA (código original intacto)
// =======================================================

// ROTA 1: BUSCAR UMA ÚNICA NOTÍCIA POR ID
app.get('/api/noticias/:id', async (req, res) => {
    try {
        const noticia = await Noticia.findById(req.params.id);
        if (!noticia) {
            return res.status(404).json({ message: 'Notícia não encontrada.' });
        }
        res.json(noticia);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar notícia.' });
    }
});

// ROTA 2: ATUALIZAR UMA NOTÍCIA (PUT)
app.put('/api/noticias/:id', upload.single('foto_noticia_edit'), async (req, res) => {
    try {
        const noticia = await Noticia.findById(req.params.id);
        if (!noticia) {
            return res.status(404).json({ message: 'Notícia não encontrada.' });
        }

        // 1. Atualiza os dados de texto
        noticia.titulo = req.body.titulo_edit;
        noticia.conteudo = req.body.conteudo_edit;
        // ✅ MUDANÇA 4: Campo 'categoria' sendo salvo na edição
        noticia.categoria = req.body.categoria_edit;

        // 2. Verifica se uma NOVA imagem foi enviada
        if (req.file) {
            console.log("Novo arquivo de imagem recebido, fazendo upload...");
            const blob = await put(req.file.originalname + '-' + Date.now(), req.file.buffer, {
                access: 'public',
                token: process.env.BLOB_READ_WRITE_TOKEN
            });
            noticia.imagemUrl = blob.url; // Atualiza a URL da imagem
        }

        // 3. Salva a notícia atualizada
        const noticiaAtualizada = await noticia.save();
        res.status(200).json({ message: 'Notícia atualizada com sucesso!', data: noticiaAtualizada });

    } catch (error) {
        console.error('Erro ao atualizar notícia:', error);
        res.status(500).json({ message: 'Erro ao atualizar notícia.', error: error.message });
    }
});

// =======================================================
// 4. SERVIR ARQUIVOS ESTÁTICOS
// =======================================================

app.use(express.static(path.join(__dirname, '..', 'public')));

// =======================================================
// 5. EXPORTAÇÃO PARA O VERCEL
// =======================================================

module.exports = app;