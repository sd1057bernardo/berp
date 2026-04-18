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
    "Estoque"	REAL DEFAULT 0,
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
INSERT INTO "Caixa" ("ID","DataAbertura","DataFechamento","ValorInicial","ValorFinal","Status") VALUES (1,NULL,NULL,NULL,NULL,NULL);
INSERT INTO "Pessoas" ("Id","Nome","CPF","Aniversario","Endereço","Bairro","Cidade","Ativo","Operador","Telefone") VALUES (1,'Matheus Admin','000.000.000-00',NULL,'Rua Central, 100',NULL,NULL,1,1,'(84) 99999-9999');
INSERT INTO "Pessoas" ("Id","Nome","CPF","Aniversario","Endereço","Bairro","Cidade","Ativo","Operador","Telefone") VALUES (2,'João Silva (Cliente)','111.111.111-11',NULL,'Av. Principal, 50',NULL,NULL,1,0,'(84) 98888-8888');
INSERT INTO "Pessoas" ("Id","Nome","CPF","Aniversario","Endereço","Bairro","Cidade","Ativo","Operador","Telefone") VALUES (3,'Maria Souza (Cliente)','222.222.222-22',NULL,'Rua das Flores, 12',NULL,NULL,1,0,'(84) 97777-7777');
INSERT INTO "Produtos" ("ID","Descricao","P.Venda","P.Custo","P.Atacado","P.Promocao","Q.Atacado","D.P.Init","D.P.Fim","C.Barra","Grupo","Estoque") VALUES (1,'Coca-Cola 2L',12,5.5,11,NULL,6,NULL,NULL,789123456001,'Bebidas',0.0);
INSERT INTO "Produtos" ("ID","Descricao","P.Venda","P.Custo","P.Atacado","P.Promocao","Q.Atacado","D.P.Init","D.P.Fim","C.Barra","Grupo","Estoque") VALUES (2,'Arroz 5kg Premium',26.9,18,24.5,NULL,10,NULL,NULL,789123456002,'Alimentos',0.0);
INSERT INTO "Produtos" ("ID","Descricao","P.Venda","P.Custo","P.Atacado","P.Promocao","Q.Atacado","D.P.Init","D.P.Fim","C.Barra","Grupo","Estoque") VALUES (3,'Feijão Carioca 1kg',8.9,4.5,7.5,NULL,12,NULL,NULL,789123456003,'Alimentos',0.0);
INSERT INTO "Produtos" ("ID","Descricao","P.Venda","P.Custo","P.Atacado","P.Promocao","Q.Atacado","D.P.Init","D.P.Fim","C.Barra","Grupo","Estoque") VALUES (4,'Detergente Neutro',2.45,1.2,2.1,NULL,24,NULL,NULL,789123456004,'Limpeza',0.0);
INSERT INTO "Produtos" ("ID","Descricao","P.Venda","P.Custo","P.Atacado","P.Promocao","Q.Atacado","D.P.Init","D.P.Fim","C.Barra","Grupo","Estoque") VALUES (5,'Biscoito Recheado',3.5,1.8,3,NULL,10,NULL,NULL,789123456005,'Mercearia',0.0);
INSERT INTO "Venda_Itens" ("ID","VendaID","ProdutoID","Quantidade","PrecoUnitario","Subtotal") VALUES (1,1,1,1,12,12);
INSERT INTO "Venda_Itens" ("ID","VendaID","ProdutoID","Quantidade","PrecoUnitario","Subtotal") VALUES (2,1,2,2,25.9,51.8);
INSERT INTO "Venda_Pagamentos" ("ID","VendaID","FormaPagamento","ValorPago","ValorRecebido","Troco") VALUES (1,1,'PIX',20,20,0);
INSERT INTO "Venda_Pagamentos" ("ID","VendaID","FormaPagamento","ValorPago","ValorRecebido","Troco") VALUES (2,1,'DINHEIRO',20,50,30);
INSERT INTO "Venda_Pagamentos" ("ID","VendaID","FormaPagamento","ValorPago","ValorRecebido","Troco") VALUES (3,1,'DEBITO',23.8,23.8,0);
INSERT INTO "Vendas" ("ID","DataHora","OperadorID","ClienteID","Total","Status") VALUES (1,'2026-04-16 17:54:41',1,NULL,63.8,'CONCLUIDA');

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
COMMIT;
