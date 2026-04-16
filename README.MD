# 📦 BERP - Sistema Modular (Electron + SQLite)

Sistema desktop desenvolvido com **Electron** e **SQLite**, focado em gestão comercial simples (ERP leve), com módulos de **clientes, produtos e ajuste de preços**.

---

## 🚀 Tecnologias utilizadas

- **Electron** → Aplicação desktop
- **SQLite3** → Banco de dados local
- **Node.js** → Backend (IPC)
- **Bootstrap 5** → Interface
- **JavaScript (Vanilla)** → Lógica do frontend

---

## 📁 Estrutura do Projeto

/projeto
│
├── main.js # Processo principal do Electron
├── berp.db # Banco de dados SQLite
│
├── index.html # Layout principal (menu lateral)
├── clientes.html # Módulo de clientes
├── Produtos.html # Módulo de produtos
├── ajustesprecos.HTML # Ajuste rápido de preços
│
└── /src
└── index.html # Tela carregada inicialmente

---

## 🧠 Arquitetura

O sistema segue o padrão:

- **Main Process (main.js)**  
  Responsável por:
  - Gerenciar banco SQLite
  - Criar janela do Electron
  - Comunicação via IPC (`ipcMain`)

- **Renderer Process (HTML + JS)**  
  Responsável por:
  - Interface do usuário
  - Chamadas ao backend via `ipcRenderer`

---

## 🔌 Comunicação (IPC)

### Pessoas
- `get-pessoas` → Buscar pessoas com filtro
- `save-pessoa` → Inserir ou atualizar

### Produtos
- `get-produtos` → Buscar produtos
- `save-produto` → Inserir ou atualizar
- `update-preco-rapido` → Atualizar preço e custo

---

## 📊 Funcionalidades

### 👥 Gestão de Clientes
- Cadastro de pessoas
- Edição de dados
- Busca por:
  - Nome
  - CPF
  - Endereço
- Status ativo/inativo

---

### 📦 Gestão de Produtos
- Cadastro completo de produtos:
  - Descrição
  - Código de barras
  - Preço de custo
  - Preço de venda
  - Promoções
  - Atacado
- Edição rápida via modal
- Listagem com busca

---

### 💰 Ajuste de Preços (Diferencial)

- Alteração rápida de:
  - Preço de custo
  - Preço de venda

- Cálculo automático de margem:
Margem (%) = ((Venda - Custo) / Venda) * 100

- Indicadores visuais:
  - 🔴 Vermelho → margem < 20%
  - 🟢 Verde → margem ≥ 20%

- Salvamento individual por produto

---

## 🖥️ Interface

- Menu lateral fixo
- Navegação dinâmica via carregamento de HTML
- Execução manual de scripts ao trocar de página
- Layout responsivo com Bootstrap

---

## ⚙️ Como executar

### 1. Instalar dependências

```bash
npm install

### 2. Rodar o projeto

```bash
npx electron 

## 🗄️ Banco de Dados

O sistema utiliza **SQLite** com banco local (`berp.db`).

### 📋 Estrutura das Tabelas

#### Pessoas
- Id
- Nome
- CPF
- Aniversario
- Endereço
- Bairro
- Cidade
- Ativo

#### Produtos
- ID
- Descricao
- P.Venda
- P.Custo
- P.Atacado
- P.Promocao
- Q.Atacado
- C.Barra
- Grupo
- D.P.Init
- D.P.Fim

---

### 🧪 Script de Criação

```sql
CREATE TABLE IF NOT EXISTS Pessoas (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    Nome TEXT NOT NULL,
    CPF TEXT,
    Aniversario TEXT,
    "Endereço" TEXT,
    Bairro TEXT,
    Cidade TEXT,
    Ativo INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS Produtos (
    ID INTEGER PRIMARY KEY AUTOINCREMENT,
    Descricao TEXT NOT NULL,
    "P.Venda" REAL DEFAULT 0,
    "P.Custo" REAL DEFAULT 0,
    "P.Atacado" REAL DEFAULT 0,
    "P.Promocao" REAL DEFAULT 0,
    "Q.Atacado" INTEGER DEFAULT 0,
    "C.Barra" TEXT,
    Grupo TEXT,
    "D.P.Init" TEXT,
    "D.P.Fim" TEXT
);