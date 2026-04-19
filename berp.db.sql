BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS Caixa (
    ID INTEGER PRIMARY KEY AUTOINCREMENT,
    DataAbertura TEXT,
    DataFechamento TEXT,
    ValorInicial REAL,
    ValorFinal REAL,
    Status TEXT -- ABERTO / FECHADO
);
CREATE TABLE IF NOT EXISTS Devolucoes (
    ID INTEGER PRIMARY KEY AUTOINCREMENT,
    VendaID INTEGER,
    DataHora TEXT,
    Motivo TEXT,
    FOREIGN KEY (VendaID) REFERENCES Vendas(ID)
);
CREATE TABLE IF NOT EXISTS "Pessoas" (
	"Id"	INTEGER,
	"Nome"	TEXT,
	"CPF"	NUMERIC,
	"Aniversario"	TEXT,
	"Endereço"	TEXT,
	"Bairro"	TEXT,
	"Cidade"	TEXT,
	"Ativo"	INTEGER COLLATE BINARY, Operador INTEGER DEFAULT 0, Telefone TEXT,
	PRIMARY KEY("Id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "Produtos" (
	"ID"	INTEGER,
	"Descricao"	TEXT,
	"P.Venda"	NUMERIC, -- preco de Venda
	"P.Custo"	NUMERIC, -- preco de Custo
	"P.Atacado"	NUMERIC, -- preco de Atacado
	"P.Promocao"	NUMERIC, -- preco de Promocao
	"Q.Atacado"	NUMERIC, -- quantidade minima para Atacado
	"D.P.Init"	TEXT, -- data de inicio da promocao
	"D.P.Fim"	TEXT, -- data de fim da promocao
	"C.Barra"	NUMERIC, -- codigo de barras
	"Grupo"	TEXT, -- grupo do produto
    "EstoqueAtual"	REAL DEFAULT 0,
	PRIMARY KEY("ID" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS Venda_Itens (
    ID INTEGER PRIMARY KEY AUTOINCREMENT,
    VendaID INTEGER,
    ProdutoID INTEGER,
    Quantidade DECIMAL(10,2),
    PrecoUnitario DECIMAL(10,2),
    Subtotal DECIMAL(10,2),
    FOREIGN KEY (VendaID) REFERENCES Vendas(ID),
    FOREIGN KEY (ProdutoID) REFERENCES Produtos(ID)
);
CREATE TABLE IF NOT EXISTS Venda_Pagamentos (
    ID INTEGER PRIMARY KEY AUTOINCREMENT,
    VendaID INTEGER,
    FormaPagamento TEXT, 
    ValorPago DECIMAL(10,2), 
    ValorRecebido DECIMAL(10,2),
    Troco DECIMAL(10,2),
    FOREIGN KEY (VendaID) REFERENCES Vendas(ID)
);
CREATE TABLE IF NOT EXISTS Vendas (
    ID INTEGER PRIMARY KEY AUTOINCREMENT,
    DataHora DATETIME DEFAULT CURRENT_TIMESTAMP,
    OperadorID INTEGER,
    ClienteID INTEGER,
    Total DECIMAL(10,2),
    Status TEXT DEFAULT 'CONCLUIDA',
    FOREIGN KEY (OperadorID) REFERENCES Pessoas(Id),
    FOREIGN KEY (ClienteID) REFERENCES Pessoas(Id)
);

-- Tabela para registrar movimentos de estoque (entradas/saídas)
CREATE TABLE IF NOT EXISTS Estoque_Movimentos (
    ID INTEGER PRIMARY KEY AUTOINCREMENT,
    ProdutoID INTEGER,
    Tipo TEXT, -- 'ENTRADA' ou 'SAIDA'
    Quantidade REAL,
    Preco REAL,
    Descricao TEXT,
    DataHora DATETIME DEFAULT CURRENT_TIMESTAMP,
    Cancelado INTEGER DEFAULT 0,
    CancelObs TEXT,
    CancelData DATETIME
);

CREATE TABLE IF NOT EXISTS Caixa_Movimentos (
        ID INTEGER PRIMARY KEY AUTOINCREMENT,
        Tipo TEXT,
        Valor REAL,
        Observacao TEXT,
        DataHora TEXT DEFAULT (datetime('now'))
COMMIT;
