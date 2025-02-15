// File structure:
// - main.js (Electron main process)
// - preload.js (Preload script for secure IPC)
// - renderer.js (Front-end JavaScript)
// - index.html (Main UI)
// - db.js (Database operations)
// - package.json (Project configuration)

// main.js
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { initDatabase, getAllAccounts, addAccount, deleteAccount } = require('./db');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadFile('index.html');
  // Uncomment for development tools
  mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
  initDatabase();
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// Set up IPC handlers for database operations
ipcMain.handle('get-accounts', async () => {
  try {
    const accounts = await getAllAccounts();
    return accounts;
  } catch (error) {
    console.error('Error fetching accounts:', error);
    return { error: error.message };
  }
});

ipcMain.handle('add-account', async (_, accountData) => {
  try {
    const newAccount = await addAccount(accountData);
    return newAccount;
  } catch (error) {
    console.error('Error adding account:', error);
    return { error: error.message };
  }
});

ipcMain.handle('delete-account', async (_, id) => {
  try {
    const result = await deleteAccount(id);
    return result;
  } catch (error) {
    console.error('Error deleting account:', error);
    return { error: error.message };
  }
});

