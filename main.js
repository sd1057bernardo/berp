const { app, BrowserWindow, ipcMain } = require('electron');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Caminho para o banco de dados na raiz do projeto
const dbPath = path.join(__dirname, 'berp.db');
const db = new sqlite3.Database(dbPath);

// Buscar Pessoas (Filtro melhorado e Ordenação)
ipcMain.handle('get-pessoas', async (event, filtro = '') => {
    return new Promise((resolve, reject) => {
        const query = `SELECT * FROM Pessoas 
                       WHERE Nome LIKE ? OR CPF LIKE ? OR Endereço LIKE ? 
                       ORDER BY Nome ASC`; // Sempre traz em ordem alfabética
        const param = `%${filtro}%`;
        db.all(query, [param, param, param], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
});

// Salvar ou Atualizar Pessoa
ipcMain.handle('save-pessoa', async (event, dados) => {
    return new Promise((resolve, reject) => {
        if (dados.Id && dados.Id !== "") {
            // Update
            const sql = `UPDATE Pessoas SET Nome=?, CPF=?, Aniversario=?, Endereço=?, Bairro=?, Cidade=?, Ativo=? WHERE Id=?`;
            db.run(sql, [dados.Nome, dados.CPF, dados.Aniversario, dados.Endereço, dados.Bairro, dados.Cidade, dados.Ativo, dados.Id], function(err) {
                if (err) reject(err);
                else resolve({ success: true });
            });
        } else {
            // Insert (Criação de nova pessoa)
            const sql = `INSERT INTO Pessoas (Nome, CPF, Aniversario, Endereço, Bairro, Cidade, Ativo) VALUES (?, ?, ?, ?, ?, ?, ?)`;
            db.run(sql, [dados.Nome, dados.CPF, dados.Aniversario, dados.Endereço, dados.Bairro, dados.Cidade, dados.Ativo], function(err) {
                if (err) reject(err);
                else resolve({ success: true, id: this.lastID });
            });
        }
    });
});

// Buscar Produtos com suas colunas específicas
ipcMain.handle('get-produtos', async (event, filtro = '') => {
    return new Promise((resolve, reject) => {
        const query = `SELECT * FROM Produtos 
                       WHERE Descricao LIKE ? OR "C.Barra" LIKE ? 
                       ORDER BY Descricao ASC`;
        const param = `%${filtro}%`;
        db.all(query, [param, param], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
});

// Salvar/Atualizar Produto
ipcMain.handle('save-produto', async (event, p) => {
    return new Promise((resolve, reject) => {
        if (p.ID) {
            // UPDATE
            const sql = `UPDATE Produtos SET 
                Descricao=?, "P.Venda"=?, "P.Custo"=?, "P.Atacado"=?, 
                "P.Promocao"=?, "Q.Atacado"=?, "C.Barra"=?, Grupo=? 
                WHERE ID=?`;
            db.run(sql, [p.Descricao, p.PVenda, p.PCusto, p.PAtacado, p.PPromocao, p.QAtacado, p.CBarra, p.Grupo, p.ID], (err) => {
                if (err) reject(err);
                else resolve({ success: true });
            });
        } else {
            // INSERT
            const sql = `INSERT INTO Produtos 
                (Descricao, "P.Venda", "P.Custo", "P.Atacado", "P.Promocao", "Q.Atacado", "C.Barra", Grupo) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
            db.run(sql, [p.Descricao, p.PVenda, p.PCusto, p.PAtacado, p.PPromocao, p.QAtacado, p.CBarra, p.Grupo], function(err) {
                if (err) reject(err);
                else resolve({ success: true, id: this.lastID });
            });
        }
    });
});

// Handler para Atualização Rápida de Preços e Margens
ipcMain.handle('update-preco-rapido', async (event, p) => {
    return new Promise((resolve, reject) => {
        const sql = `UPDATE Produtos SET "P.Venda" = ?, "P.Custo" = ? WHERE ID = ?`;
        db.run(sql, [p.PVenda, p.PCusto, p.ID], (err) => {
            if (err) reject(err);
            else resolve({ success: true });
        });
    });
});

function createWindow() {
  const win = new BrowserWindow({
    width: 1200, // Aumentado para melhor visualização do ERP
    height: 800,
    webPreferences: {
      nodeIntegration: true, 
      contextIsolation: false
    }
  });

  win.loadFile('src/index.html');
}

app.whenReady().then(createWindow);

// Garantir que o banco de dados feche ao sair
app.on('window-all-closed', () => {
  db.close();
  if (process.platform !== 'darwin') app.quit();
});