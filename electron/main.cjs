const { app, BrowserWindow, shell, Menu } = require('electron');
const path = require('path');
const fs = require('fs');
const http = require('http');
const { fork } = require('child_process');

// Completely disable and remove default menu bar (File, Edit, View, Window, Help)
Menu.setApplicationMenu(null);

let mainWindow = null;
let serverProcess = null;
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

function startBackendServer() {
  try {
    const candidatePaths = [
      path.join(__dirname, '..', 'dist', 'server.cjs'),
      path.join(__dirname, 'dist', 'server.cjs'),
      path.join(process.resourcesPath, 'app.asar', 'dist', 'server.cjs'),
      path.join(process.resourcesPath, 'app.asar.unpacked', 'dist', 'server.cjs'),
    ];

    let serverScript = null;
    for (const p of candidatePaths) {
      if (fs.existsSync(p)) {
        serverScript = p;
        break;
      }
    }

    if (!serverScript) {
      serverScript = path.join(__dirname, '..', 'dist', 'server.cjs');
    }

    console.log('[CHATOX AI] Spawning backend server from:', serverScript);

    serverProcess = fork(serverScript, [], {
      env: { ...process.env, PORT: '3000', NODE_ENV: 'production' },
      stdio: ['inherit', 'inherit', 'inherit', 'ipc']
    });

    serverProcess.on('error', (err) => {
      console.error('[CHATOX AI] Server process error:', err);
    });

    serverProcess.on('exit', (code) => {
      console.log('[CHATOX AI] Server process exited with code:', code);
    });
  } catch (err) {
    console.error('[CHATOX AI] Server initialization exception:', err);
  }
}

function loadApp(win) {
  const targetUrl = 'http://localhost:3000';
  let attempts = 0;
  const maxAttempts = 80;

  const tryConnect = () => {
    http
      .get(targetUrl + '/api/health', (res) => {
        if (res.statusCode >= 200 && res.statusCode < 500) {
          win.loadURL(targetUrl);
        } else {
          retry();
        }
      })
      .on('error', () => {
        retry();
      });
  };

  const retry = () => {
    attempts++;
    if (attempts < maxAttempts) {
      setTimeout(tryConnect, 200);
    } else {
      // Fallback: load static file directly if server didn't respond in time
      const fallbackFiles = [
        path.join(__dirname, '..', 'dist', 'index.html'),
        path.join(process.resourcesPath, 'app.asar', 'dist', 'index.html'),
        path.join(process.resourcesPath, 'app.asar.unpacked', 'dist', 'index.html'),
      ];
      for (const htmlFile of fallbackFiles) {
        if (fs.existsSync(htmlFile)) {
          win.loadFile(htmlFile);
          return;
        }
      }
      win.loadURL(targetUrl);
    }
  };

  tryConnect();
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 800,
    minHeight: 600,
    backgroundColor: '#0a0a0c',
    title: 'CHATOX AI - Universal AI Client',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true,
    },
    show: false,
  });

  mainWindow.setMenuBarVisibility(false);
  mainWindow.removeMenu();

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:') || url.startsWith('http:')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  loadApp(mainWindow);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  startBackendServer();

  setTimeout(() => {
    createWindow();
  }, 200);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (serverProcess) {
    try {
      serverProcess.kill();
    } catch (e) {}
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
