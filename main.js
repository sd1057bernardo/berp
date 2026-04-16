const { app, BrowserWindow, ipcMain } = require('electron');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'berp.db');
const db = new sqlite3.Database(dbPath);


// --- HANDLERS DE PRODUTOS ---
ipcMain.handle('get-produtos', async (event, filtro = '') => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM Produtos WHERE Descricao LIKE ? OR "C.Barra" LIKE ? ORDER BY Descricao ASC`;
        const param = `%${filtro}%`;
        db.all(sql, [param, param], (err, rows) => {
            if (err) reject(err); else resolve(rows);
        });
    });
});

ipcMain.handle('save-produto', async (event, p) => {
    return new Promise((resolve, reject) => {
        if (p.ID) {
            const sql = `UPDATE Produtos SET Descricao=?, "P.Custo"=?, "P.Venda"=?, "C.Barra"=?, Grupo=?, "P.Atacado"=?, "Q.Atacado"=? WHERE ID=?`;
            db.run(sql, [p.Descricao, p.P_Custo, p.P_Venda, p.C_Barra, p.Grupo, p.P_Atacado, p.Q_Atacado, p.ID], err => {
                if (err) reject(err); else resolve({ success: true });
            });
        } else {
            const sql = `INSERT INTO Produtos (Descricao, "P.Custo", "P.Venda", "C.Barra", Grupo, "P.Atacado", "Q.Atacado") VALUES (?, ?, ?, ?, ?, ?, ?)`;
            db.run(sql, [p.Descricao, p.P_Custo, p.P_Venda, p.C_Barra, p.Grupo, p.P_Atacado, p.Q_Atacado], function(err) {
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