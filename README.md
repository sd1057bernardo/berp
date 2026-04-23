# BERP — Instruções rápidas

Este repositório contém uma aplicação desktop feita com Electron que usa SQLite como banco local (`berp.db`). Aqui estão instruções práticas para preparar o ambiente, criar o banco a partir das migrations e rodar a aplicação no Windows.

## Resumo

- Backend principal: `main.js` (handlers IPC e acesso ao banco via `sqlite3` do Node)
- Frontend: arquivos HTML em `src/`
- Migrations: pasta `migrations/` (arquivo inicial `001_initial.sql`)

## Pré-requisitos

- Node.js e npm
- `sqlite3` CLI (apenas para criar/importar o banco; a app usa `sqlite3` via Node)

Verifique o sqlite no PowerShell:

```powershell
sqlite3 --version
```

Se não estiver instalado, baixe o pacote "sqlite-tools" em https://www.sqlite.org/download.html ou instale via Chocolatey:

```powershell
# como Administrador
choco install sqlite
```

## Criar / aplicar migrations (Windows)

Um script PowerShell está em `scripts\apply_migrations.ps1`. Ele faz backup de `berp.db` (se existir) e aplica as migrations encontradas na pasta `migrations/` em ordem alfabética.

Passos:

1. Abra PowerShell na raiz do projeto.
2. Verifique `sqlite3 --version` (deve existir no PATH).
3. Execute:

```powershell
.\scripts\apply_migrations.ps1
```

O script criará `berp.db` se não existir e fará um backup com timestamp caso já exista.

## Rodar a aplicação

1. Instale dependências:

```powershell
npm install
```

2. Rode em modo desenvolvimento (conforme `package.json`):

```powershell
npm start
```

Isso inicia a janela Electron apontando para `src/index.html`.

## Principais handlers / funcionalidades (resumo)

Os principais endpoints IPC expostos em `main.js` são usados pelo frontend:

- `get-produtos(filtro)` — busca produtos por nome ou código de barras
- `save-produto(produto)` — insere/atualiza produto
- `delete-produto(id)` — remove produto
- `update-preco-rapido(d)` — atualiza preços (usado em ajustes)
- `get-pessoas(filtro, mostrarInativos)` — busca clientes/operadores
- `save-pessoa(pessoa)` — insere/atualiza pessoa
- `get-vendas(dataFiltro)` — lista vendas
- `cancelar-venda(id)` — marca venda como CANCELADA
- `print-cupom(vendaId)` / `imprimir-venda(vendaId)` — gera cupom para impressão
- `get-caixa-open()` / `abrir-caixa(valorInicial)` — controle de caixa
- `save-venda(venda)` — persiste venda (itens, pagamentos) e atualiza estoque

## Regras de negócio importantes

- Produtos com `EstoqueAtual <= 24` são considerados críticos no dashboard.
- Vendas com `Status = 'CANCELADA'` não devem ser somadas em relatórios.
- Quando cliente não é informado, o cupom mostra `CONSUMIDOR FINAL`.
- Se `OperadorID` não for enviado ao salvar venda, o sistema usa `1` por padrão.

## Boas práticas

- Sempre faça backup de `berp.db` antes de alterações: `copy .\berp.db .\berp.db.bak`.
- Para mudanças de schema crie uma nova migration em `migrations/` em vez de alterar arquivos SQL antigos.
- Teste localmente com um banco separado (copie `berp.db` antes).
