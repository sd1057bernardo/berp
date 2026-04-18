const { app, BrowserWindow, ipcMain } = require('electron');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'berp.db');
const db = new sqlite3.Database(dbPath);

// --- HANDLERS DE PRODUTOS ---
ipcMain.handle('get-produtos', async (event, filtro = '') => {
    return new Promise((resolve, reject) => {
        // Busca produtos por nome ou código de barras
        const sql = `SELECT * FROM Produtos WHERE Descricao LIKE ? OR "C.Barra" LIKE ? ORDER BY Descricao ASC`;
        const param = `%${filtro}%`;
        db.all(sql, [param, param], (err, rows) => {
            if (err) {
                console.error("Erro ao buscar produtos:", err);
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
});

// Adicione também o save-produto se for usar o cadastro
ipcMain.handle('save-produto', async (event, p) => {
    return new Promise((resolve, reject) => {
        if (p.ID) {
            const sql = `UPDATE Produtos SET Descricao=?, "P.Custo"=?, "P.Venda"=?, "C.Barra"=? WHERE ID=?`;
            db.run(sql, [p.Descricao, p.P_Custo, p.P_Venda, p.C_Barra, p.ID], err => {
                if (err) reject(err); else resolve({ success: true });
            });
        } else {
            const sql = `INSERT INTO Produtos (Descricao, "P.Custo", "P.Venda", "C.Barra") VALUES (?, ?, ?, ?)`;
            db.run(sql, [p.Descricao, p.P_Custo, p.P_Venda, p.C_Barra], function(err) {
                if (err) reject(err); else resolve({ success: true, id: this.lastID });
            });
        }
    });
});

ipcMain.handle('delete-produto', async (event, id) => {
    return new Promise((resolve, reject) => {
        db.run(`DELETE FROM Produtos WHERE ID = ?`, [id], err => {
            if (err) reject(err); else resolve({ success: true });
        });
    });
});

// Atualização rápida de preços (usado por ajustesprecos.HTML)
ipcMain.handle('update-preco-rapido', async (event, d) => {
    return new Promise((resolve, reject) => {
        try{
            const sql = `UPDATE Produtos SET "P.Custo" = ?, "P.Venda" = ? WHERE ID = ?`;
            db.run(sql, [d.PCusto, d.PVenda, d.ID], function(err) {
                if (err) return reject(err);
                resolve({ success: true });
            });
        }catch(e){ reject(e); }
    });
});


// --- FUNÇÃO AUXILIAR PARA IMPRESSÃO (80mm) ---
function abrirJanelaImpressao(htmlContent) {
    let winPrint = new BrowserWindow({ 
        show: true, // Alterado para false para não "piscar" na tela
        webPreferences: { nodeIntegration: true, contextIsolation: false } 
    });
    
    const estiloEConteudo = `
        <html>
            <head>
                <style>
                    @page { margin: 0; }
                    body { 
                        width: 72mm; font-family: 'Courier New', Courier, monospace; 
                        font-size: 11px; padding: 0; margin: 0; color: #000;
                    }
                    .text-center { text-align: center; }
                    .dashed { border-top: 1px dashed #000; margin: 5px 0; width: 100%; }
                    .flex { display: flex; justify-content: space-between; }
                    .bold { font-weight: bold; }
                    .small { font-size: 9px; }
                </style>
            </head>
            <body><div style="padding: 10px;">${htmlContent}</div></body>
            <script>
                window.onload = () => { 
                    setTimeout(() => { window.print(); window.close(); }, 500); 
                };
            </script>
        </html>
    `;
    winPrint.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(estiloEConteudo)}`);
}

// --- HANDLERS DE PESSOAS ---
ipcMain.handle('get-pessoas', async (event, filtro = '', mostrarInativos = false) => {
    return new Promise((resolve, reject) => {
        const condicaoAtivo = mostrarInativos ? "" : " AND Ativo = 1";
        const query = `SELECT * FROM Pessoas WHERE (Nome LIKE ? OR CPF LIKE ?) ${condicaoAtivo} ORDER BY Nome ASC`;
        const param = `%${filtro}%`;
        db.all(query, [param, param], (err, rows) => {
            if (err) reject(err); else resolve(rows);
        });
    });
});

ipcMain.handle('save-pessoa', async (event, d) => {
    return new Promise((resolve, reject) => {
        if (d.Id) {
            const sql = `UPDATE Pessoas SET Nome=?, CPF=?, Aniversario=?, "Endereço"=?, Bairro=?, Cidade=?, Ativo=?, Operador=?, Telefone=? WHERE Id=?`;
            db.run(sql, [d.Nome, d.CPF, d.Aniversario, d.Endereço, d.Bairro, d.Cidade, d.Ativo, d.Operador, d.Telefone, d.Id], err => {
                if (err) reject(err); else resolve({ success: true });
            });
        } else {
            const sql = `INSERT INTO Pessoas (Nome, CPF, Aniversario, "Endereço", Bairro, Cidade, Ativo, Operador, Telefone) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            db.run(sql, [d.Nome, d.CPF, d.Aniversario, d.Endereço, d.Bairro, d.Cidade, d.Ativo, d.Operador, d.Telefone], function(err) {
                if (err) reject(err); else resolve({ success: true, id: this.lastID });
            });
        }
    });
});

// --- HANDLERS DE VENDAS ---
ipcMain.handle('get-vendas', async (event, dataFiltro) => {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT V.*, P1.Nome as NomeOperador, P2.Nome as NomeCliente,
            (SELECT GROUP_CONCAT(FormaPagamento || ' (R$ ' || printf("%.2f", ValorPago) || ')', ' + ') 
             FROM Venda_Pagamentos WHERE VendaID = V.ID) as ResumoPagamento
            FROM Vendas V
            LEFT JOIN Pessoas P1 ON V.OperadorID = P1.Id
            LEFT JOIN Pessoas P2 ON V.ClienteID = P2.Id
            WHERE V.DataHora LIKE ? ORDER BY V.ID DESC`;
        
        db.all(sql, [`${dataFiltro}%`], (err, rows) => {
            if (err) reject(err); else resolve(rows);
        });
    });
});

ipcMain.handle('cancelar-venda', async (event, id) => {
    return new Promise((resolve, reject) => {
        db.run(`UPDATE Vendas SET Status = 'CANCELADA' WHERE ID = ?`, [id], function(err) {
            if (err) resolve({ success: false, error: err.message });
            else resolve({ success: true });
        });
    });
});

// --- EVENTOS DE IMPRESSÃO DETALHADA ---
ipcMain.on('imprimir-venda', (event, vendaId) => {
    const sqlVenda = `SELECT V.*, P1.Nome as Operador, P2.Nome as Cliente FROM Vendas V 
                      LEFT JOIN Pessoas P1 ON V.OperadorID = P1.Id 
                      LEFT JOIN Pessoas P2 ON V.ClienteID = P2.Id WHERE V.ID = ?`;
    
    db.get(sqlVenda, [vendaId], (err, v) => {
        if (err || !v) return;

        const sqlItens = `SELECT I.*, P.Descricao FROM Venda_Itens I 
                          JOIN Produtos P ON I.ProdutoID = P.ID WHERE I.VendaID = ?`;
        
        db.all(sqlItens, [vendaId], (err, itens) => {
            const sqlPagos = `SELECT * FROM Venda_Pagamentos WHERE VendaID = ?`;
            
            db.all(sqlPagos, [vendaId], (err, pagos) => {
                const itensHtml = itens.map(i => `
                    <div class="flex">
                        <span>${i.Quantidade}x ${i.Descricao}</span>
                        <span>R$ ${i.Subtotal.toFixed(2)}</span>
                    </div>
                `).join('');

                const pagosHtml = pagos.map(p => `
                    <div class="flex">
                        <span>${p.FormaPagamento}</span>
                        <span>R$ ${p.ValorPago.toFixed(2)}</span>
                    </div>
                    ${p.Troco > 0 ? `<div class="flex small"><span> - (Troco)</span> <span>R$ ${p.Troco.toFixed(2)}</span></div>` : ''}
                `).join('');

                const html = `
                    <div class="text-center"><strong style="font-size: 16px;">BERP SISTEMAS</strong><br>CUPOM: #${v.ID}<br>${new Date(v.DataHora).toLocaleString('pt-BR')}</div>
                    <div class="dashed"></div>
                    <div>CLIENTE: ${v.Cliente || 'CONSUMIDOR FINAL'}</div>
                    <div>OPERADOR: ${v.Operador || 'S/N'}</div>
                    <div class="dashed"></div>
                    <div class="bold">ITENS:</div>
                    ${itensHtml}
                    <div class="dashed"></div>
                    <div class="flex bold" style="font-size: 13px;"><span>TOTAL:</span> <span>R$ ${v.Total.toFixed(2)}</span></div>
                    <div class="dashed"></div>
                    <div class="bold">PAGAMENTO:</div>
                    ${pagosHtml}
                    <div class="dashed"></div>
                    <div class="text-center">Obrigado pela preferência!</div>`;
                
                abrirJanelaImpressao(html);
            });
        });
    });

// Handler compatível para chamada do renderer: print-cupom
ipcMain.handle('print-cupom', async (event, vendaId) => {
    return new Promise((resolve, reject) => {
        const sqlVenda = `SELECT V.*, P1.Nome as Operador, P2.Nome as Cliente FROM Vendas V 
                          LEFT JOIN Pessoas P1 ON V.OperadorID = P1.Id 
                          LEFT JOIN Pessoas P2 ON V.ClienteID = P2.Id WHERE V.ID = ?`;
        db.get(sqlVenda, [vendaId], (err, v) => {
            if (err || !v) return resolve({ success: false, error: 'Venda não encontrada' });

            const sqlItens = `SELECT I.*, P.Descricao FROM Venda_Itens I 
                              JOIN Produtos P ON I.ProdutoID = P.ID WHERE I.VendaID = ?`;
            db.all(sqlItens, [vendaId], (err, itens) => {
                const sqlPagos = `SELECT * FROM Venda_Pagamentos WHERE VendaID = ?`;
                db.all(sqlPagos, [vendaId], (err, pagos) => {
                    const itensHtml = itens.map(i => `
                        <div class="flex">
                            <span>${i.Quantidade}x ${i.Descricao}</span>
                            <span>R$ ${i.Subtotal.toFixed(2)}</span>
                        </div>
                    `).join('');

                    const pagosHtml = pagos.map(p => `
                        <div class="flex">
                            <span>${p.FormaPagamento}</span>
                            <span>R$ ${p.ValorPago.toFixed(2)}</span>
                        </div>
                        ${p.Troco > 0 ? `<div class="flex small"><span> - (Troco)</span> <span>R$ ${p.Troco.toFixed(2)}</span></div>` : ''}
                    `).join('');

                    const html = `
                        <div class="text-center"><strong style="font-size: 16px;">BERP SISTEMAS</strong><br>CUPOM: #${v.ID}<br>${new Date(v.DataHora).toLocaleString('pt-BR')}</div>
                        <div class="dashed"></div>
                        <div>CLIENTE: ${v.Cliente || 'CONSUMIDOR FINAL'}</div>
                        <div>OPERADOR: ${v.Operador || 'S/N'}</div>
                        <div class="dashed"></div>
                        <div class="bold">ITENS:</div>
                        ${itensHtml}
                        <div class="dashed"></div>
                        <div class="flex bold" style="font-size: 13px;"><span>TOTAL:</span> <span>R$ ${v.Total.toFixed(2)}</span></div>
                        <div class="dashed"></div>
                        <div class="bold">PAGAMENTO:</div>
                        ${pagosHtml}
                        <div class="dashed"></div>
                        <div class="text-center">Obrigado pela preferência!</div>`;

                    abrirJanelaImpressao(html);
                    resolve({ success: true });
                });
            });
        });
    });
});
});

ipcMain.on('gerar-relatorio-vendas', (event, data) => {
    const sql = `SELECT * FROM Vendas WHERE DataHora LIKE ? AND Status != 'CANCELADA'`;
    db.all(sql, [`${data}%`], (err, rows) => {
        if (err || !rows) return;
        let totalGeral = 0;
        let lista = rows.map(r => {
            totalGeral += r.Total;
            return `<div class="flex"><span>#${r.ID}</span> <span>R$ ${r.Total.toFixed(2)}</span></div>`;
        }).join('');
        const html = `<div class="text-center"><strong style="font-size: 14px;">FECHAMENTO DO DIA</strong><br>DATA: ${data.split('-').reverse().join('/')}</div>
            <div class="dashed"></div>${lista}<div class="dashed"></div>
            <div class="flex bold" style="font-size: 14px;"><span>TOTAL LÍQUIDO:</span> <span>R$ ${totalGeral.toFixed(2)}</span></div>
            <div class="text-center" style="margin-top: 20px;">--- FIM ---</div>`;
        abrirJanelaImpressao(html);
    });
});


ipcMain.handle('get-estatisticas-dashboard', async () => {
    return new Promise((resolve, reject) => {
        const hoje = new Date().toISOString().split('T')[0];
        const stats = {
                vendasHoje: 0,
                qtdVendas: 0,
                totalItens: 0,
                totalAbaixoMinimo: 0,
                itensCriticos: [],
                graficoLabels: [],
                graficoValores: []
            };

        // Exemplo de queries simultâneas (Simplificado)
        db.serialize(() => {
            // Vendas de hoje
            db.get(`SELECT SUM(Total) as total, COUNT(ID) as qtd FROM Vendas WHERE DataHora LIKE ? AND Status != 'CANCELADA'`, [`${hoje}%`], (err, row) => {
                if (row) {
                    stats.vendasHoje = row.total || 0;
                    stats.qtdVendas = row.qtd || 0;
                }
            });

            // Gráfico: últimos 7 dias (somatório por dia)
            const dias = [];
            const valores = [];
            for(let i=6;i>=0;i--){
                const d = new Date(); d.setDate(d.getDate()-i);
                const chave = d.toISOString().split('T')[0];
                dias.push(chave.split('-').slice(2).concat(chave.split('-').slice(1,2)).join('/'));
            }
            // Buscamos vendas por dia
            const placeholders = []; // we'll run queries sequentially
            const diasISO = [];
            for(let i=6;i>=0;i--){ const d=new Date(); d.setDate(d.getDate()-i); diasISO.push(d.toISOString().split('T')[0]); }
            // executar consultas para cada dia (serial)
            (async function calcGrafico(){
                for(const dia of diasISO){
                    // note: use callback-based db.get dentro de promise
                    const totalDia = await new Promise(res => db.get(`SELECT IFNULL(SUM(Total),0) as total FROM Vendas WHERE DataHora LIKE ? AND Status != 'CANCELADA'`, [`${dia}%`], (e,r)=> res((r&&r.total)||0)));
                    valores.push(totalDia);
                }
                stats.graficoLabels = diasISO.map(d=>{ const parts=d.split('-'); return `${parts[2]}/${parts[1]}` });
                stats.graficoValores = valores;
            })();

            // Estoque - mínimo = 24 (usa apenas EstoqueAtual)
            const LIMITE = 24;
            db.get(`SELECT SUM(EstoqueAtual) as total, COUNT(ID) as abaixo FROM Produtos WHERE EstoqueAtual <= ?`, [LIMITE], (err, row) => {
                if (err) {
                    console.error('Erro ao consultar EstoqueAtual no dashboard:', err);
                    stats.itensCriticos = [];
                    resolve(stats);
                    return;
                }
                stats.totalAbaixoMinimo = row?.abaixo || 0;
                db.all(`SELECT Descricao, EstoqueAtual FROM Produtos WHERE EstoqueAtual <= ? LIMIT 5`, [LIMITE], (err2, rows) => {
                    stats.itensCriticos = rows || [];
                    // Também calculamos totalItens
                    db.get(`SELECT SUM(IFNULL(EstoqueAtual,0)) as total FROM Produtos`, (err3, r3) => {
                        stats.totalItens = (r3 && r3.total) || 0;
                        resolve(stats);
                    });
                });
            });
        });
    });
});

// --- CONFIG JANELA ---
function createWindow() {
    const win = new BrowserWindow({ 
        width: 1200, 
        height: 800, 
        webPreferences: { nodeIntegration: true, contextIsolation: false } 
    });
    win.loadFile('src/index.html');
}

app.whenReady().then(createWindow);

// Fechamento seguro do banco ao sair
app.on('window-all-closed', () => {
    if (db) db.close();
    if (process.platform !== 'darwin') app.quit();
});

// Recebe sinal do renderer para encerrar a aplicação
ipcMain.on('app-quit', () => {
    try {
        if (db) db.close();
    } catch(e){}
    app.quit();
});

// --- CAIXA (PDV) ---
ipcMain.handle('get-caixa-open', async () => {
    return new Promise((resolve, reject) => {
        db.get(`SELECT * FROM Caixa WHERE Status = 'ABERTO' ORDER BY ID DESC LIMIT 1`, (err, row) => {
            if (err) return reject(err);
            resolve(row || null);
        });
    });
});

ipcMain.handle('abrir-caixa', async (event, valorInicial = 0) => {
    return new Promise((resolve, reject) => {
        const sql = `INSERT INTO Caixa (DataAbertura, ValorInicial, Status) VALUES (datetime('now'), ?, 'ABERTO')`;
        db.run(sql, [valorInicial], function(err) {
            if (err) return reject(err);
            resolve({ success: true, id: this.lastID });
        });
    });
});

// Salvar venda completa: Vendas, Venda_Itens, Venda_Pagamentos e atualizar EstoqueAtual
ipcMain.handle('save-venda', async (event, venda) => {
    return new Promise((resolve, reject) => {
        try{
            db.serialize(() => {
                // Inserir venda
                const sqlVenda = `INSERT INTO Vendas (DataHora, OperadorID, ClienteID, Total, Status) VALUES (datetime('now'), ?, ?, ?, ?)`;
                db.run(sqlVenda, [venda.OperadorID || 1, venda.ClienteID || null, venda.Total || 0, venda.Status || 'CONCLUIDA'], function(err) {
                    if (err) return reject(err);
                    const vendaId = this.lastID;

                    // Inserir itens sequencialmente
                    const insertItem = db.prepare(`INSERT INTO Venda_Itens (VendaID, ProdutoID, Quantidade, PrecoUnitario, Subtotal) VALUES (?, ?, ?, ?, ?)`);
                    const updateProduto = db.prepare(`UPDATE Produtos SET EstoqueAtual = IFNULL(EstoqueAtual,0) - ? WHERE ID = ?`);
                    (venda.Itens || []).forEach(it => {
                        insertItem.run([vendaId, it.ProdutoID, it.Quantidade, it.PrecoUnitario, it.Subtotal]);
                        // atualiza estoque
                        updateProduto.run([it.Quantidade, it.ProdutoID]);
                    });
                    insertItem.finalize();
                    updateProduto.finalize();

                    // Inserir pagamentos
                    const insertPag = db.prepare(`INSERT INTO Venda_Pagamentos (VendaID, FormaPagamento, ValorPago, ValorRecebido, Troco) VALUES (?, ?, ?, ?, ?)`);
                    (venda.Pagamentos || []).forEach(p => insertPag.run([vendaId, p.FormaPagamento, p.ValorPago, p.ValorRecebido || p.ValorPago, p.Troco || 0]));
                    insertPag.finalize();

                    resolve({ success: true, id: vendaId });
                });
            });
        }catch(e){ reject(e); }
    });
});

// --- HANDLERS DE ESTOQUE ---
// Garante que a tabela de movimentos de estoque exista (chamado pelos handlers)
function ensureEstoqueTable() {
    db.run(`CREATE TABLE IF NOT EXISTS Estoque_Movimentos (
        ID INTEGER PRIMARY KEY AUTOINCREMENT,
        ProdutoID INTEGER,
        Tipo TEXT,
        Quantidade REAL,
        Preco REAL,
        Descricao TEXT,
        DataHora TEXT DEFAULT (datetime('now')),
        Cancelado INTEGER DEFAULT 0,
        CancelObs TEXT,
        CancelData TEXT
    )`);
}

ipcMain.handle('save-estoque-movimento', async (event, m) => {
    return new Promise((resolve, reject) => {
        try{
            ensureEstoqueTable();
            db.serialize(() => {
                const sql = `INSERT INTO Estoque_Movimentos (ProdutoID, Tipo, Quantidade, Preco, Descricao) VALUES (?, ?, ?, ?, ?)`;
                db.run(sql, [m.ProdutoID, m.Tipo, m.Quantidade, m.Preco, m.Descricao], function(err) {
                    if (err) return reject(err);
                    const movimentoId = this.lastID;
                    // Atualiza estoque no produto
                    const delta = (m.Tipo === 'ENTRADA') ? Number(m.Quantidade) : -Number(m.Quantidade);
                    db.run(`UPDATE Produtos SET EstoqueAtual = IFNULL(EstoqueAtual,0) + ? WHERE ID = ?`, [delta, m.ProdutoID], function(err2) {
                        if (err2) return reject(err2);
                        resolve({ success: true, id: movimentoId });
                    });
                });
            });
        }catch(e){ reject(e); }
    });
});

ipcMain.handle('get-estoque-movimentos', async (event, filtroOrOpts = '') => {
    return new Promise((resolve, reject) => {
        try{
            ensureEstoqueTable();
            let filtro = '';
            let hoje = false;
            if (typeof filtroOrOpts === 'object' && filtroOrOpts !== null) {
                filtro = filtroOrOpts.filtro || '';
                hoje = !!filtroOrOpts.hoje;
            } else {
                filtro = String(filtroOrOpts || '');
            }

            let sql = `SELECT M.*, P.Descricao as ProdutoDescricao, P."C.Barra" as CBarra FROM Estoque_Movimentos M LEFT JOIN Produtos P ON M.ProdutoID = P.ID 
                         WHERE (P.Descricao LIKE ? OR P."C.Barra" LIKE ? OR M.Descricao LIKE ?)`;
            const params = [`%${filtro}%`, `%${filtro}%`, `%${filtro}%`];
            if (hoje) {
                const hojeStr = new Date().toISOString().split('T')[0] + '%';
                sql += ' AND M.DataHora LIKE ?';
                params.push(hojeStr);
            }
            sql += ' ORDER BY M.DataHora DESC LIMIT 200';

            db.all(sql, params, (err, rows) => {
                if (err) reject(err); else resolve(rows);
            });
        }catch(e){ reject(e); }
    });
});

ipcMain.handle('cancel-estoque-movimento', async (event, movimentoId, motivo = '') => {
    return new Promise((resolve, reject) => {
        try{
            ensureEstoqueTable();
            db.get(`SELECT * FROM Estoque_Movimentos WHERE ID = ?`, [movimentoId], (err, m) => {
                if (err) return reject(err);
                if (!m) return resolve({ success: false, error: 'Movimento não encontrado' });
                if (m.Cancelado) return resolve({ success: false, error: 'Movimento já cancelado' });

                // Reverter alteração no estoque
                const reverseDelta = (m.Tipo === 'ENTRADA') ? -Number(m.Quantidade) : Number(m.Quantidade);
                db.serialize(() => {
                    db.run(`UPDATE Produtos SET EstoqueAtual = IFNULL(EstoqueAtual,0) + ? WHERE ID = ?`, [reverseDelta, m.ProdutoID], function(err2) {
                        if (err2) return reject(err2);
                        db.run(`UPDATE Estoque_Movimentos SET Cancelado = 1, CancelObs = ?, CancelData = datetime('now') WHERE ID = ?`, [motivo, movimentoId], function(err3) {
                            if (err3) return reject(err3);
                            resolve({ success: true });
                        });
                    });
                });
            });
        }catch(e){ reject(e); }
    });
});