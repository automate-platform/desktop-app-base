"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const electron_2 = require("electron");
const regedit = require('regedit').promisified


const path = require("path");
const fs = require("fs");

//nodered
var os = require('os');
var child_process = require('child_process');
var http = require('http');
var expressApp = require('express')();
var server = http.createServer(expressApp);
var RED = require('node-red');
var settings = require('./pap_settings')
var menu_app = require('./menu.json');


var list_app = [];
var url = 'http://' + settings.uiHost + ':' + settings.uiPort + settings.httpAdminRoot;
var gen_url = path.join('file:', __dirname, 'extension/HTML/index.html')
let startscreen = path.join(__dirname, 'extension/market/index.html');
let menuTemplatePath = path.join(__dirname, './menu.json')
let reloadTimer = null;


fs.watch(menuTemplatePath, (eventType, filename) => {
    if (eventType === 'change') {
        console.log('Menu template file changed. Reloading menu...');
        triggerReload();
    }
});

function triggerReload() {
    clearTimeout(reloadTimer);
    reloadTimer = setTimeout(() => {
        win.reload()
    }, 4000);
}

if (menu_app.length) {
    for (let i = 0; i < menu_app.length; i++) {
        var gen_url = path.join(menu_app[i].app_dir, 'index.html')
        function openGenTool() {
            win.loadURL(gen_url);
        }
        list_app.push({
            label: menu_app[i].app_name,
            enabled: this.enabled,
            click() {
                openGenTool()
            },
            accelerator: menu_app[i].app_hotkey
        });
    }
}


const template = [
    {
        label: 'Tools',
        submenu: list_app
    }, {
        label: 'Market Extention',
        enabled: this.enabled,
        click() {
            win.loadURL(startscreen);
        }
    }

]

const menu = electron_1.Menu.buildFromTemplate(template)

let win = null;
let popUpWindow = null;
let winEditor = null;

const args = process.argv.slice(1), serve = args.some(val => val === '--serve');

function startNodered() {
    RED.init(server, settings);
    expressApp.use(settings.httpAdminRoot, RED.httpAdmin);
    expressApp.use(settings.httpNodeRoot, RED.httpNode);
    server.on('error', function (error) {
        dialog.showErrorBox('Error', error.toString());
    });
    server.listen(settings.uiPort, settings.uiHost, function () {
        RED.start().then(function () {
            createWindow();
            regedit.list(['HKCU\\App_Test']).then(data => {
                let exist = data["HKCU\\App_Test"].exists
                let appName = data["HKCU\\App_Test"].values.Name.value
                if (!exist) {
                    createPopUpWindow(appName);
                }
            }).catch(error => {
                console.log(error);
            })
        }).catch(function (error) {
            dialog.showErrorBox('Error', error.toString());
            app.exit(1);
        });
    });

}


function createPopUpWindow(appName) {
    popUpWindow = new electron_2.BrowserWindow({
        parent: win,
        width: 500,
        height: 200,
        modal: true,
        webPreferences: {
            nodeIntegration: true,
            devTools: false
        },
        title: 'Message',
        resizable: false
    });

    popUpWindow.setMenu(null);
    popUpWindow.loadURL(`data:text/html;charset=UTF-8,<!DOCTYPE html>
    <html>
      <head>
        <style>
          body {
            text-align: center;
          }
        </style>
      </head>
      <body>
        <p>This is a app name ${appName}</p>
      </body>
    </html>`);

    win.setEnabled(false);

    popUpWindow.on('closed', () => {
        win.close();
    });

}

function createWindow() {
    electron_1.Menu.setApplicationMenu(menu)
    const app = electron_1.app;
    const size = electron_1.screen.getPrimaryDisplay().workAreaSize;
    // Create the browser window.
    win = new electron_1.BrowserWindow({
        //frame: false,
        // titleBarStyle: 'hidden',
        // titleBarOverlay: {
        //   color: '#2f3241',
        //   symbolColor: '#74b1be'
        // },
        x: 0,
        y: 0,
        width: size.width,
        height: size.height,
        webPreferences: {
            nodeIntegration: true,
            // allowRunningInsecureContent: (serve),
            contextIsolation: false,
        },
    });
    //win.setBackgroundColor('blueviolet')
    app.setAsDefaultProtocolClient('foobar')

    app.on('open-url', (event, url) => {
        dialog.showErrorBox('Welcome Back', `You arrived from: ${url}`)
    })
    //let startscreen = path.join(__dirname, 'extension/startscreen/index.html');
    const url = new URL(path.join('file:', startscreen));
    if (serve) {
        const debug = require('electron-debug');
        debug();
        // setTimeout(require('electron-reloader')(module),4500)
        // require('electron-reloader')(module);
        if (fs.existsSync(startscreen)) {
            // Path when running electron in local folder
            win.loadURL(url.href);
        }

    }
    else {
        // Path when running electron executable
        if (fs.existsSync(startscreen)) {
            // Path when running electron in local folder
            win.loadURL(url.href);
        }

    }
    // Emitted when the window is closed.
    win.on('closed', () => {
        // Dereference the window object, usually you would store window
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        win = null;
    });
    // ipcMain.handle('dark-mode:system', () => {
    //     nativeTheme.themeSource = 'dark'
    // })
    return win;
}
try {
    // This method will be called when Electron has finished
    // initialization and is ready to create browser windows.
    // Some APIs can only be used after this event occurs.
    // Added 400 ms to fix the black background issue while using transparent window. More detais at https://github.com/electron/electron/issues/15947
    electron_1.app.on('ready', () => setTimeout(startNodered, 1000));

    // Quit when all windows are closed.
    electron_1.app.on('window-all-closed', () => {
        // On OS X it is common for applications and their menu bar
        // to stay active until the user quits explicitly with Cmd + Q
        if (process.platform !== 'darwin') {
            electron_1.app.quit();
        }
    });
    electron_1.app.on('activate', () => {
        // On OS X it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (win === null) {
            createWindow();
            //nativeTheme.themeSource = 'dark'
        }
    });
}
catch (e) {
    // Catch Error
    // throw e;
}
//# sourceMappingURL=main.js.map