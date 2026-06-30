# CMS Institucional e Sistema de Adoção

Este é o repositório do CMS Institucional e Sistema de Adoção, uma API desenvolvida com Node.js e Express, projetada para gerenciar conteúdo e processos de adoção de animais.

## 🚀 Tecnologias Utilizadas

- **[Node.js](https://nodejs.org/)** e **[Express](https://expressjs.com/)**: Construção da API e servidor web.
- **[MongoDB](https://www.mongodb.com/)** e **[Mongoose](https://mongoosejs.com/)**: Banco de dados NoSQL e modelagem de objetos.
- **[Vercel Blob](https://vercel.com/docs/storage/vercel-blob)** e **[Multer](https://github.com/expressjs/multer)**: Upload e armazenamento de arquivos/imagens.
- **[Dotenv](https://github.com/motdotla/dotenv)**: Gerenciamento de variáveis de ambiente.

## 📋 Pré-requisitos

Antes de iniciar, você precisará ter instalado em sua máquina:
- [Node.js](https://nodejs.org/) (versão 18+ recomendada)
- [NPM](https://www.npmjs.com/) ou [Yarn](https://yarnpkg.com/)
- Conta e Cluster no [MongoDB Atlas](https://www.mongodb.com/atlas) (ou banco MongoDB local)
- Conta na [Vercel](https://vercel.com/) (para o Blob Storage)

## 🛠️ Configuração e Instalação

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/seu-usuario/cms-institucional-adocao.git
   cd cms-institucional-adocao
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente:**
   - Baseie-se no arquivo `.env.example` e crie um novo arquivo chamado `.env` na raiz do projeto.
   - Preencha as chaves com suas credenciais:
     - `MONGODB_URI`: URL de conexão do MongoDB.
     - `BLOB_READ_WRITE_TOKEN`: Token gerado no Vercel Blob para upload de imagens.
     - `ADMIN_PASSWORD`: Senha para acesso a rotas restritas/administrativas.

## ▶️ Executando a Aplicação

Para iniciar o servidor localmente:

```bash
node index.js
# Ou utilize um gerenciador como o nodemon para recarregar automaticamente durante o desenvolvimento:
# npx nodemon index.js
```

O servidor será iniciado na porta padrão ou na configurada no ambiente.

## 📄 Estrutura Principal

- `/api` - Controladores, rotas e modelos principais da aplicação.
- `/public` - Arquivos estáticos servidos diretamente.

## 📄 Licença

Este projeto está sob a licença ISC.
