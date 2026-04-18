BEGIN TRANSACTION;

-- ====== PESSOAS (novos clientes / operadores) ======
INSERT INTO "Pessoas" ("Nome","CPF","Ativo","Operador","Telefone") VALUES ('Ana Pereira (Operadora)','333.333.333-33',1,1,'(84) 90000-0001');
INSERT INTO "Pessoas" ("Nome","CPF","Ativo","Operador","Telefone") VALUES ('Bruno Costa (Operador)','444.444.444-44',1,1,'(84) 90000-0002');
INSERT INTO "Pessoas" ("Nome","CPF","Ativo","Operador","Telefone") VALUES ('Carlos Cliente','555.555.555-55',1,0,'(84) 90000-0003');
INSERT INTO "Pessoas" ("Nome","CPF","Ativo","Operador","Telefone") VALUES ('Daniela Cliente','666.666.666-66',1,0,'(84) 90000-0004');

-- ====== PRODUTOS ADICIONAIS ======
INSERT INTO "Produtos" ("Descricao","P.Venda","P.Custo","P.Atacado","P.Promocao","Q.Atacado","C.Barra","Grupo","EstoqueAtual") VALUES
('Leite Integral 1L',4.50,2.30,4.00,NULL,12,789123450001,'Alimentos',20.0),
('Pão Francês (6un)',5.00,2.00,4.50,NULL,10,789123450002,'Padaria',30.0),
('Sabão em Pó 1kg',15.90,8.00,14.0,NULL,8,789123450003,'Limpeza',15.0),
('Macarrão Espaguete 500g',3.80,1.50,3.50,NULL,10,789123450004,'Alimentos',40.0),
('Óleo de Soja 900ml',7.20,4.00,6.50,NULL,6,789123450005,'Alimentos',25.0),
('Chocolate Ao Leite 90g',6.00,2.50,5.50,NULL,12,789123450006,'Mercearia',50.0),
('Água Mineral 500ml',2.00,0.80,1.80,NULL,24,789123450007,'Bebidas',100.0),
('Refrigerante 350ml',4.00,1.80,3.80,NULL,12,789123450008,'Bebidas',60.0),
('Amaciante 2L',12.50,6.00,11.50,NULL,6,789123450009,'Limpeza',10.0),
('Biscoito Salgado 200g',3.20,1.20,3.00,NULL,10,789123450010,'Mercearia',40.0);

-- ====== VENDAS EXEMPLARES (15 vendas em datas diferentes)
-- Para cada venda: inserimos a venda, depois os itens referenciando (SELECT MAX(ID) FROM Vendas) como VendaID, atualizamos o total e inserimos pagamento(s).

-- Venda 1
INSERT INTO Vendas (DataHora, OperadorID, ClienteID, Total, Status) VALUES ('2026-04-15 09:12:00', 1, NULL, 0.0, 'CONCLUIDA');
INSERT INTO Venda_Itens (VendaID, ProdutoID, Quantidade, PrecoUnitario, Subtotal) VALUES ((SELECT MAX(ID) FROM Vendas), (SELECT ID FROM Produtos WHERE Descricao = 'Coca-Cola 2L' LIMIT 1), 2, (SELECT "P.Venda" FROM Produtos WHERE Descricao = 'Coca-Cola 2L' LIMIT 1), 2*(SELECT "P.Venda" FROM Produtos WHERE Descricao = 'Coca-Cola 2L' LIMIT 1));
UPDATE Vendas SET Total = (SELECT SUM(Subtotal) FROM Venda_Itens WHERE VendaID = (SELECT MAX(ID) FROM Vendas)) WHERE ID = (SELECT MAX(ID) FROM Vendas);
INSERT INTO Venda_Pagamentos (VendaID, FormaPagamento, ValorPago, ValorRecebido, Troco) VALUES ((SELECT MAX(ID) FROM Vendas), 'DINHEIRO', (SELECT Total FROM Vendas WHERE ID = (SELECT MAX(ID) FROM Vendas)), (SELECT Total FROM Vendas WHERE ID = (SELECT MAX(ID) FROM Vendas)), 0.0);

-- Venda 2
INSERT INTO Vendas (DataHora, OperadorID, ClienteID, Total, Status) VALUES ('2026-03-22 14:05:00', 2, (SELECT ID FROM Pessoas WHERE Nome = 'Carlos Cliente' LIMIT 1), 0.0, 'CONCLUIDA');
INSERT INTO Venda_Itens (VendaID, ProdutoID, Quantidade, PrecoUnitario, Subtotal) VALUES ((SELECT MAX(ID) FROM Vendas), (SELECT ID FROM Produtos WHERE Descricao = 'ARROZ 5KG PREMIUM' LIMIT 1), 1, (SELECT "P.Venda" FROM Produtos WHERE Descricao = 'ARROZ 5KG PREMIUM' LIMIT 1), (SELECT "P.Venda" FROM Produtos WHERE Descricao = 'ARROZ 5KG PREMIUM' LIMIT 1));
INSERT INTO Venda_Itens (VendaID, ProdutoID, Quantidade, PrecoUnitario, Subtotal) VALUES ((SELECT MAX(ID) FROM Vendas), (SELECT ID FROM Produtos WHERE Descricao = 'Leite Integral 1L' LIMIT 1), 4, (SELECT "P.Venda" FROM Produtos WHERE Descricao = 'Leite Integral 1L' LIMIT 1), 4*(SELECT "P.Venda" FROM Produtos WHERE Descricao = 'Leite Integral 1L' LIMIT 1));
UPDATE Vendas SET Total = (SELECT SUM(Subtotal) FROM Venda_Itens WHERE VendaID = (SELECT MAX(ID) FROM Vendas)) WHERE ID = (SELECT MAX(ID) FROM Vendas);
INSERT INTO Venda_Pagamentos (VendaID, FormaPagamento, ValorPago, ValorRecebido, Troco) VALUES ((SELECT MAX(ID) FROM Vendas), 'PIX', (SELECT Total FROM Vendas WHERE ID = (SELECT MAX(ID) FROM Vendas)), (SELECT Total FROM Vendas WHERE ID = (SELECT MAX(ID) FROM Vendas)), 0.0);

-- Venda 3
INSERT INTO Vendas (DataHora, OperadorID, ClienteID, Total, Status) VALUES ('2026-03-10 11:30:00', 1, (SELECT ID FROM Pessoas WHERE Nome = 'Daniela Cliente' LIMIT 1), 0.0, 'CONCLUIDA');
INSERT INTO Venda_Itens (VendaID, ProdutoID, Quantidade, PrecoUnitario, Subtotal) VALUES ((SELECT MAX(ID) FROM Vendas), (SELECT ID FROM Produtos WHERE Descricao = 'Feijão Carioca 1kg' LIMIT 1), 2, (SELECT "P.Venda" FROM Produtos WHERE Descricao = 'Feijão Carioca 1kg' LIMIT 1), 2*(SELECT "P.Venda" FROM Produtos WHERE Descricao = 'Feijão Carioca 1kg' LIMIT 1));
UPDATE Vendas SET Total = (SELECT SUM(Subtotal) FROM Venda_Itens WHERE VendaID = (SELECT MAX(ID) FROM Vendas)) WHERE ID = (SELECT MAX(ID) FROM Vendas);
INSERT INTO Venda_Pagamentos (VendaID, FormaPagamento, ValorPago, ValorRecebido, Troco) VALUES ((SELECT MAX(ID) FROM Vendas), 'DEBITO', (SELECT Total FROM Vendas WHERE ID = (SELECT MAX(ID) FROM Vendas)), (SELECT Total FROM Vendas WHERE ID = (SELECT MAX(ID) FROM Vendas)), 0.0);

-- Venda 4
INSERT INTO Vendas (DataHora, OperadorID, ClienteID, Total, Status) VALUES ('2026-02-25 17:45:00', 1, NULL, 0.0, 'CONCLUIDA');
INSERT INTO Venda_Itens (VendaID, ProdutoID, Quantidade, PrecoUnitario, Subtotal) VALUES ((SELECT MAX(ID) FROM Vendas), (SELECT ID FROM Produtos WHERE Descricao = 'Detergente Neutro' LIMIT 1), 3, (SELECT "P.Venda" FROM Produtos WHERE Descricao = 'Detergente Neutro' LIMIT 1), 3*(SELECT "P.Venda" FROM Produtos WHERE Descricao = 'Detergente Neutro' LIMIT 1));
UPDATE Vendas SET Total = (SELECT SUM(Subtotal) FROM Venda_Itens WHERE VendaID = (SELECT MAX(ID) FROM Vendas)) WHERE ID = (SELECT MAX(ID) FROM Vendas);
INSERT INTO Venda_Pagamentos (VendaID, FormaPagamento, ValorPago, ValorRecebido, Troco) VALUES ((SELECT MAX(ID) FROM Vendas), 'DINHEIRO', (SELECT Total FROM Vendas WHERE ID = (SELECT MAX(ID) FROM Vendas)), (SELECT Total FROM Vendas WHERE ID = (SELECT MAX(ID) FROM Vendas)), 0.0);

-- Venda 5
INSERT INTO Vendas (DataHora, OperadorID, ClienteID, Total, Status) VALUES ('2026-02-12 09:20:00', 2, NULL, 0.0, 'CONCLUIDA');
INSERT INTO Venda_Itens (VendaID, ProdutoID, Quantidade, PrecoUnitario, Subtotal) VALUES ((SELECT MAX(ID) FROM Vendas), (SELECT ID FROM Produtos WHERE Descricao = 'Biscoito Recheado' LIMIT 1), 5, (SELECT "P.Venda" FROM Produtos WHERE Descricao = 'Biscoito Recheado' LIMIT 1), 5*(SELECT "P.Venda" FROM Produtos WHERE Descricao = 'Biscoito Recheado' LIMIT 1));
UPDATE Vendas SET Total = (SELECT SUM(Subtotal) FROM Venda_Itens WHERE VendaID = (SELECT MAX(ID) FROM Vendas)) WHERE ID = (SELECT MAX(ID) FROM Vendas);
INSERT INTO Venda_Pagamentos (VendaID, FormaPagamento, ValorPago, ValorRecebido, Troco) VALUES ((SELECT MAX(ID) FROM Vendas), 'CREDITO', (SELECT Total FROM Vendas WHERE ID = (SELECT MAX(ID) FROM Vendas)), (SELECT Total FROM Vendas WHERE ID = (SELECT MAX(ID) FROM Vendas)), 0.0);

-- Venda 6
INSERT INTO Vendas (DataHora, OperadorID, ClienteID, Total, Status) VALUES ('2026-01-30 13:05:00', 1, NULL, 0.0, 'CONCLUIDA');
INSERT INTO Venda_Itens (VendaID, ProdutoID, Quantidade, PrecoUnitario, Subtotal) VALUES ((SELECT MAX(ID) FROM Vendas), (SELECT ID FROM Produtos WHERE Descricao = 'Leite Integral 1L' LIMIT 1), 6, (SELECT "P.Venda" FROM Produtos WHERE Descricao = 'Leite Integral 1L' LIMIT 1), 6*(SELECT "P.Venda" FROM Produtos WHERE Descricao = 'Leite Integral 1L' LIMIT 1));
UPDATE Vendas SET Total = (SELECT SUM(Subtotal) FROM Venda_Itens WHERE VendaID = (SELECT MAX(ID) FROM Vendas)) WHERE ID = (SELECT MAX(ID) FROM Vendas);
INSERT INTO Venda_Pagamentos (VendaID, FormaPagamento, ValorPago, ValorRecebido, Troco) VALUES ((SELECT MAX(ID) FROM Vendas), 'PIX', (SELECT Total FROM Vendas WHERE ID = (SELECT MAX(ID) FROM Vendas)), (SELECT Total FROM Vendas WHERE ID = (SELECT MAX(ID) FROM Vendas)), 0.0);

-- Venda 7
INSERT INTO Vendas (DataHora, OperadorID, ClienteID, Total, Status) VALUES ('2026-01-22 18:40:00', 2, NULL, 0.0, 'CONCLUIDA');
INSERT INTO Venda_Itens (VendaID, ProdutoID, Quantidade, PrecoUnitario, Subtotal) VALUES ((SELECT MAX(ID) FROM Vendas), (SELECT ID FROM Produtos WHERE Descricao = 'Sabão em Pó 1kg' LIMIT 1), 2, (SELECT "P.Venda" FROM Produtos WHERE Descricao = 'Sabão em Pó 1kg' LIMIT 1), 2*(SELECT "P.Venda" FROM Produtos WHERE Descricao = 'Sabão em Pó 1kg' LIMIT 1));
UPDATE Vendas SET Total = (SELECT SUM(Subtotal) FROM Venda_Itens WHERE VendaID = (SELECT MAX(ID) FROM Vendas)) WHERE ID = (SELECT MAX(ID) FROM Vendas);
INSERT INTO Venda_Pagamentos (VendaID, FormaPagamento, ValorPago, ValorRecebido, Troco) VALUES ((SELECT MAX(ID) FROM Vendas), 'DEBITO', (SELECT Total FROM Vendas WHERE ID = (SELECT MAX(ID) FROM Vendas)), (SELECT Total FROM Vendas WHERE ID = (SELECT MAX(ID) FROM Vendas)), 0.0);

-- Venda 8
INSERT INTO Vendas (DataHora, OperadorID, ClienteID, Total, Status) VALUES ('2026-01-10 10:10:00', 1, (SELECT ID FROM Pessoas WHERE Nome = 'Carlos Cliente' LIMIT 1), 0.0, 'CONCLUIDA');
INSERT INTO Venda_Itens (VendaID, ProdutoID, Quantidade, PrecoUnitario, Subtotal) VALUES ((SELECT MAX(ID) FROM Vendas), (SELECT ID FROM Produtos WHERE Descricao = 'Macarrão Espaguete 500g' LIMIT 1), 3, (SELECT "P.Venda" FROM Produtos WHERE Descricao = 'Macarrão Espaguete 500g' LIMIT 1), 3*(SELECT "P.Venda" FROM Produtos WHERE Descricao = 'Macarrão Espaguete 500g' LIMIT 1));
UPDATE Vendas SET Total = (SELECT SUM(Subtotal) FROM Venda_Itens WHERE VendaID = (SELECT MAX(ID) FROM Vendas)) WHERE ID = (SELECT MAX(ID) FROM Vendas);
INSERT INTO Venda_Pagamentos (VendaID, FormaPagamento, ValorPago, ValorRecebido, Troco) VALUES ((SELECT MAX(ID) FROM Vendas), 'DINHEIRO', (SELECT Total FROM Vendas WHERE ID = (SELECT MAX(ID) FROM Vendas)), (SELECT Total FROM Vendas WHERE ID = (SELECT MAX(ID) FROM Vendas)), 0.0);

-- Venda 9
INSERT INTO Vendas (DataHora, OperadorID, ClienteID, Total, Status) VALUES ('2026-03-01 15:55:00', 1, NULL, 0.0, 'CONCLUIDA');
INSERT INTO Venda_Itens (VendaID, ProdutoID, Quantidade, PrecoUnitario, Subtotal) VALUES ((SELECT MAX(ID) FROM Vendas), (SELECT ID FROM Produtos WHERE Descricao = 'Óleo de Soja 900ml' LIMIT 1), 2, (SELECT "P.Venda" FROM Produtos WHERE Descricao = 'Óleo de Soja 900ml' LIMIT 1), 2*(SELECT "P.Venda" FROM Produtos WHERE Descricao = 'Óleo de Soja 900ml' LIMIT 1));
UPDATE Vendas SET Total = (SELECT SUM(Subtotal) FROM Venda_Itens WHERE VendaID = (SELECT MAX(ID) FROM Vendas)) WHERE ID = (SELECT MAX(ID) FROM Vendas);
INSERT INTO Venda_Pagamentos (VendaID, FormaPagamento, ValorPago, ValorRecebido, Troco) VALUES ((SELECT MAX(ID) FROM Vendas), 'CREDITO', (SELECT Total FROM Vendas WHERE ID = (SELECT MAX(ID) FROM Vendas)), (SELECT Total FROM Vendas WHERE ID = (SELECT MAX(ID) FROM Vendas)), 0.0);

-- Venda 10
INSERT INTO Vendas (DataHora, OperadorID, ClienteID, Total, Status) VALUES ('2026-02-05 12:15:00', 2, (SELECT ID FROM Pessoas WHERE Nome = 'Daniela Cliente' LIMIT 1), 0.0, 'CONCLUIDA');
INSERT INTO Venda_Itens (VendaID, ProdutoID, Quantidade, PrecoUnitario, Subtotal) VALUES ((SELECT MAX(ID) FROM Vendas), (SELECT ID FROM Produtos WHERE Descricao = 'Chocolate Ao Leite 90g' LIMIT 1), 4, (SELECT "P.Venda" FROM Produtos WHERE Descricao = 'Chocolate Ao Leite 90g' LIMIT 1), 4*(SELECT "P.Venda" FROM Produtos WHERE Descricao = 'Chocolate Ao Leite 90g' LIMIT 1));
UPDATE Vendas SET Total = (SELECT SUM(Subtotal) FROM Venda_Itens WHERE VendaID = (SELECT MAX(ID) FROM Vendas)) WHERE ID = (SELECT MAX(ID) FROM Vendas);
INSERT INTO Venda_Pagamentos (VendaID, FormaPagamento, ValorPago, ValorRecebido, Troco) VALUES ((SELECT MAX(ID) FROM Vendas), 'PIX', (SELECT Total FROM Vendas WHERE ID = (SELECT MAX(ID) FROM Vendas)), (SELECT Total FROM Vendas WHERE ID = (SELECT MAX(ID) FROM Vendas)), 0.0);

-- Venda 11
INSERT INTO Vendas (DataHora, OperadorID, ClienteID, Total, Status) VALUES ('2026-04-01 08:50:00', 1, NULL, 0.0, 'CONCLUIDA');
INSERT INTO Venda_Itens (VendaID, ProdutoID, Quantidade, PrecoUnitario, Subtotal) VALUES ((SELECT MAX(ID) FROM Vendas), (SELECT ID FROM Produtos WHERE Descricao = 'Água Mineral 500ml' LIMIT 1), 10, (SELECT "P.Venda" FROM Produtos WHERE Descricao = 'Água Mineral 500ml' LIMIT 1), 10*(SELECT "P.Venda" FROM Produtos WHERE Descricao = 'Água Mineral 500ml' LIMIT 1));
UPDATE Vendas SET Total = (SELECT SUM(Subtotal) FROM Venda_Itens WHERE VendaID = (SELECT MAX(ID) FROM Vendas)) WHERE ID = (SELECT MAX(ID) FROM Vendas);
INSERT INTO Venda_Pagamentos (VendaID, FormaPagamento, ValorPago, ValorRecebido, Troco) VALUES ((SELECT MAX(ID) FROM Vendas), 'DINHEIRO', (SELECT Total FROM Vendas WHERE ID = (SELECT MAX(ID) FROM Vendas)), (SELECT Total FROM Vendas WHERE ID = (SELECT MAX(ID) FROM Vendas)), 0.0);

-- Venda 12
INSERT INTO Vendas (DataHora, OperadorID, ClienteID, Total, Status) VALUES ('2026-03-14 19:10:00', 2, NULL, 0.0, 'CONCLUIDA');
INSERT INTO Venda_Itens (VendaID, ProdutoID, Quantidade, PrecoUnitario, Subtotal) VALUES ((SELECT MAX(ID) FROM Vendas), (SELECT ID FROM Produtos WHERE Descricao = 'Refrigerante 350ml' LIMIT 1), 6, (SELECT "P.Venda" FROM Produtos WHERE Descricao = 'Refrigerante 350ml' LIMIT 1), 6*(SELECT "P.Venda" FROM Produtos WHERE Descricao = 'Refrigerante 350ml' LIMIT 1));
UPDATE Vendas SET Total = (SELECT SUM(Subtotal) FROM Venda_Itens WHERE VendaID = (SELECT MAX(ID) FROM Vendas)) WHERE ID = (SELECT MAX(ID) FROM Vendas);
INSERT INTO Venda_Pagamentos (VendaID, FormaPagamento, ValorPago, ValorRecebido, Troco) VALUES ((SELECT MAX(ID) FROM Vendas), 'DEBITO', (SELECT Total FROM Vendas WHERE ID = (SELECT MAX(ID) FROM Vendas)), (SELECT Total FROM Vendas WHERE ID = (SELECT MAX(ID) FROM Vendas)), 0.0);

-- Venda 13
INSERT INTO Vendas (DataHora, OperadorID, ClienteID, Total, Status) VALUES ('2026-02-28 16:00:00', 1, NULL, 0.0, 'CONCLUIDA');
INSERT INTO Venda_Itens (VendaID, ProdutoID, Quantidade, PrecoUnitario, Subtotal) VALUES ((SELECT MAX(ID) FROM Vendas), (SELECT ID FROM Produtos WHERE Descricao = 'Amaciante 2L' LIMIT 1), 1, (SELECT "P.Venda" FROM Produtos WHERE Descricao = 'Amaciante 2L' LIMIT 1), 1*(SELECT "P.Venda" FROM Produtos WHERE Descricao = 'Amaciante 2L' LIMIT 1));
INSERT INTO Venda_Itens (VendaID, ProdutoID, Quantidade, PrecoUnitario, Subtotal) VALUES ((SELECT MAX(ID) FROM Vendas), (SELECT ID FROM Produtos WHERE Descricao = 'Biscoito Salgado 200g' LIMIT 1), 2, (SELECT "P.Venda" FROM Produtos WHERE Descricao = 'Biscoito Salgado 200g' LIMIT 1), 2*(SELECT "P.Venda" FROM Produtos WHERE Descricao = 'Biscoito Salgado 200g' LIMIT 1));
UPDATE Vendas SET Total = (SELECT SUM(Subtotal) FROM Venda_Itens WHERE VendaID = (SELECT MAX(ID) FROM Vendas)) WHERE ID = (SELECT MAX(ID) FROM Vendas);
INSERT INTO Venda_Pagamentos (VendaID, FormaPagamento, ValorPago, ValorRecebido, Troco) VALUES ((SELECT MAX(ID) FROM Vendas), 'PIX', (SELECT Total FROM Vendas WHERE ID = (SELECT MAX(ID) FROM Vendas)), (SELECT Total FROM Vendas WHERE ID = (SELECT MAX(ID) FROM Vendas)), 0.0);

-- Venda 14
INSERT INTO Vendas (DataHora, OperadorID, ClienteID, Total, Status) VALUES ('2026-03-07 21:30:00', 2, NULL, 0.0, 'CONCLUIDA');
INSERT INTO Venda_Itens (VendaID, ProdutoID, Quantidade, PrecoUnitario, Subtotal) VALUES ((SELECT MAX(ID) FROM Vendas), (SELECT ID FROM Produtos WHERE Descricao = 'Macarrão Espaguete 500g' LIMIT 1), 2, (SELECT "P.Venda" FROM Produtos WHERE Descricao = 'Macarrão Espaguete 500g' LIMIT 1), 2*(SELECT "P.Venda" FROM Produtos WHERE Descricao = 'Macarrão Espaguete 500g' LIMIT 1));
UPDATE Vendas SET Total = (SELECT SUM(Subtotal) FROM Venda_Itens WHERE VendaID = (SELECT MAX(ID) FROM Vendas)) WHERE ID = (SELECT MAX(ID) FROM Vendas);
INSERT INTO Venda_Pagamentos (VendaID, FormaPagamento, ValorPago, ValorRecebido, Troco) VALUES ((SELECT MAX(ID) FROM Vendas), 'DINHEIRO', (SELECT Total FROM Vendas WHERE ID = (SELECT MAX(ID) FROM Vendas)), (SELECT Total FROM Vendas WHERE ID = (SELECT MAX(ID) FROM Vendas)), 0.0);

-- Venda 15
INSERT INTO Vendas (DataHora, OperadorID, ClienteID, Total, Status) VALUES ('2026-04-05 14:00:00', 1, (SELECT ID FROM Pessoas WHERE Nome = 'Daniela Cliente' LIMIT 1), 0.0, 'CONCLUIDA');
INSERT INTO Venda_Itens (VendaID, ProdutoID, Quantidade, PrecoUnitario, Subtotal) VALUES ((SELECT MAX(ID) FROM Vendas), (SELECT ID FROM Produtos WHERE Descricao = 'Refrigerante 350ml' LIMIT 1), 3, (SELECT "P.Venda" FROM Produtos WHERE Descricao = 'Refrigerante 350ml' LIMIT 1), 3*(SELECT "P.Venda" FROM Produtos WHERE Descricao = 'Refrigerante 350ml' LIMIT 1));
INSERT INTO Venda_Itens (VendaID, ProdutoID, Quantidade, PrecoUnitario, Subtotal) VALUES ((SELECT MAX(ID) FROM Vendas), (SELECT ID FROM Produtos WHERE Descricao = 'Biscoito Recheado' LIMIT 1), 2, (SELECT "P.Venda" FROM Produtos WHERE Descricao = 'Biscoito Recheado' LIMIT 1), 2*(SELECT "P.Venda" FROM Produtos WHERE Descricao = 'Biscoito Recheado' LIMIT 1));
UPDATE Vendas SET Total = (SELECT SUM(Subtotal) FROM Venda_Itens WHERE VendaID = (SELECT MAX(ID) FROM Vendas)) WHERE ID = (SELECT MAX(ID) FROM Vendas);
INSERT INTO Venda_Pagamentos (VendaID, FormaPagamento, ValorPago, ValorRecebido, Troco) VALUES ((SELECT MAX(ID) FROM Vendas), 'DEBITO', (SELECT Total FROM Vendas WHERE ID = (SELECT MAX(ID) FROM Vendas)), (SELECT Total FROM Vendas WHERE ID = (SELECT MAX(ID) FROM Vendas)), 0.0);

COMMIT;
