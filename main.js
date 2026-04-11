const { app, BrowserWindow } = require('electron');

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
	//fullscreen: true,
    webPreferences: {
      nodeIntegration: true, 
      contextIsolation: false, 
      // Opcional: permite usar o require no script preload se tiver um
      nodeIntegrationInWorker: true
    }
  });

  win.loadFile('src/index.html');
}

// Quando o Electron estiver pronto, cria a janela
app.whenReady().then(createWindow);

// Fecha o app quando todas as janelas forem fechadas (exceto no macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});