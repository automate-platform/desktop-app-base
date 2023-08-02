"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const contextMenu = require('electron-context-menu');
const regedit = require('regedit').promisified
const electron = require("electron");

const settings = require('./pap_settings.js');
const CryptoJS = require("crypto-js");
const path = require("path");
const fs = require("fs");

//nodered
var RED = require('node-red');
var http = require('http');
var expressApp = require('express')();
var server = http.createServer(expressApp);
var os = require('os');

const key_decrypt = "MGT@2023MGT@2023";
let startscreen = path.join(__dirname, 'index.html');
let marketscreen = path.join(__dirname, 'extension/market/index.html');

if (!fs.existsSync(path.join(__dirname, 'extensions.json'))) {
    fs.writeFileSync(path.join(__dirname, 'extensions.json'), JSON.stringify([]))
}

if (!fs.existsSync(path.join(__dirname, 'menu.json'))) {
    fs.writeFileSync(path.join(__dirname, 'menu.json'), JSON.stringify([]))
}

let mainWindow = null;
let subWindow = null;

//decrypt
function decryptRegistry(encryptedHex, key_decrypt) {
    const inputHex = encryptedHex;
    const inputBytes_decrypt = CryptoJS.enc.Hex.parse(inputHex);
    const key = CryptoJS.enc.Utf8.parse(key_decrypt);
    const cipher_decrypt = CryptoJS.AES.decrypt(
        { ciphertext: inputBytes_decrypt },
        key,
        {
            mode: CryptoJS.mode.ECB,
        }
    );
    const decryptedBytes = CryptoJS.enc.Utf8.stringify(cipher_decrypt);
    const decryptedBase64 = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(decryptedBytes));
    const decodedText = atob(decryptedBase64);
    return decodedText;
}

function dateInPast(date) {
    var now = new Date()
    if (date.setHours(0, 0, 0, 0) <= now.setHours(0, 0, 0, 0)) {
        return true;
    }
    return false;
};

//user infor
function sendInf() {

    var header = new Headers();
    header.append("Content-Type", "application/json");

    var options = {
        method: 'POST',
        headers: header,
        body: JSON.stringify({
            user_infor: os.userInfo()['username'],
            version: electron.app.getVersion()
        })
    };

    setTimeout(() => {
        fetch('http://' + settings.uiHost + ':' + settings.uiPort + '/user-infor', options).then(res => res.json()).then(result => {
            console.log(result);
        })
    }, 500)

}

//Reload Extention
function extentionWatcher() {
    fs.watch(path.join(__dirname, './extensions.json'), { recursive: true }, (eventType, filename) => {
        if (filename && eventType === "change") {
            console.log(`${filename} ${eventType}`);
            setTimeout(() => {
                reloadExtension();
                mainWindow.reload();
            }, 8000);
        }
    });
    fs.unwatchFile(path.join(__dirname, './extensions.json'));
}

function createNewExtention() {
    var list_extensions = [];
    var menu_extensions = JSON.parse(fs.readFileSync(path.join(__dirname, './extensions.json')));

    if (menu_extensions.length) {
        for (let i = 0; i < menu_extensions.length; i++) {
            list_extensions.push(path.join(settings.functionGlobalContext.__dirname, menu_extensions[i].extension_dir))
        }
    }
    return list_extensions;
}

function reloadExtension() {
    const extensions = createNewExtention();
    extensions.forEach(extensionPath => {
        electron.session.defaultSession.loadExtension(extensionPath);
    });
}


//Reload Menu
function menuWatcher() {
    fs.watch(path.join(__dirname, './menu.json'), { recursive: true }, (eventType, filename) => {
        if (filename && eventType === "change") {
            console.log(`${filename} ${eventType}`);
            setTimeout(() => {
                reloadMenu();
                mainWindow.reload();
            }, 7500);
        }
    });
    fs.unwatchFile(path.join(__dirname, './menu.json'));
}

function createMenuTemplate() {
    var list_apps = [];
    var menu_apps = JSON.parse(fs.readFileSync(path.join(__dirname, './menu.json')));

    if (menu_apps.length) {
        for (let i = 0; i < menu_apps.length; i++) {
            list_apps.push({
                label: menu_apps[i].app_name,
                enabled: true,
                click() {
                    mainWindow.loadURL(path.join(settings.functionGlobalContext.__dirname, menu_apps[i].app_dir, 'index.html'));
                }
            });
        };
    };

    const template = [
        {
            label: 'Tools',
            submenu: list_apps
        },
        {
            label: 'System',
            submenu: [{
                label: 'App Market',
                enabled: true,
                click() {
                    mainWindow.loadURL(marketscreen);
                }
            }]

        },
        {
            label: 'Web Page',
            submenu: [
                {
                    label: 'Insight Jira',
                    enabled: true,
                    click() {
                        if (subWindow) {
                            subWindow.loadURL("https://insight.fsoft.com.vn/jira9/secure/Dashboard.jspa")
                            subWindow.maximize()
                        } else {
                            subWindow = createWindow();
                            subWindow.loadURL("https://insight.fsoft.com.vn/jira9/secure/Dashboard.jspa")
                            subWindow.maximize()
                        }
                    }
                },
                {
                    label: 'Market',
                    enabled: true,
                    click() {
                        if (subWindow) {
                            subWindow.loadURL("https://flows.vtgo.vn")
                            subWindow.maximize()
                        } else {
                            subWindow = createWindow();
                            subWindow.loadURL("https://flows.vtgo.vn")
                            subWindow.maximize()
                        }
                    }
                }
            ]
        }
    ];

    return template;
}

function reloadMenu() {
    const newMenuTemplate = createMenuTemplate();
    const newMenu = electron.Menu.buildFromTemplate(newMenuTemplate);
    electron.Menu.setApplicationMenu(newMenu);
}

//start app
function startApp() {
    const menuTemplate = createMenuTemplate();
    const extensions = createNewExtention();
    const menu = electron.Menu.buildFromTemplate(menuTemplate);

    electron.Menu.setApplicationMenu(menu);
    extensions.forEach(extensionPath => {
        electron.session.defaultSession.loadExtension(extensionPath);
    });

    mainWindow = createMainWindow();
    mainWindow.maximize();
    menuWatcher();
    extentionWatcher();
    sendInf();
}

function startNodered() {
    RED.init(server, settings);
    expressApp.use(settings.httpAdminRoot, RED.httpAdmin);
    expressApp.use(settings.httpNodeRoot, RED.httpNode);
    server.on('error', function (error) {
        electron.dialog.showErrorBox('ErrorRED1', error.toString());
        electron.app.exit(1);
    });
    server.listen(settings.uiPort, settings.uiHost, function () {
        RED.start().then(function () {
            startApp();
        }).catch(function (error) {
            electron.dialog.showErrorBox('ErrorRED2', error.toString(), settings.userDir);
            electron.app.exit(1);
        });
    });
}

//create window
function createDialogWindow() {
    const app = electron.app;
    electron.dialog.showMessageBox({
        type: 'warning',
        buttons: ['Ok', 'Exit'],
        defaultId: 0,
        cancelId: 1,
        title: 'Warning',
        detail: 'Your license is expired!'
    }).then(({ response }) => {
        console.log(`response: ${response}`)
        if (response) {
            app.exit()
        } else {
            app.exit()
        }
    })
}

function createWindow() {
    // Create the browser window.
    const window = new electron.BrowserWindow({
        title: 'Web Page',
        center: true,
        autoHideMenuBar: true,
        parent: mainWindow,
        icon: __dirname + '/icon.ico',
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: true,
            // allowRunningInsecureContent: (serve)
        },
    });
    window.on('close', () => {
        subWindow = null;
    });
    return window;
}

contextMenu({
    showSaveImageAs: true
});

function createMainWindow() {
    // Create the browser window.
    const window = new electron.BrowserWindow({
        center: true,
        icon: __dirname + '/icon.ico',
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            // allowRunningInsecureContent: (serve)
        },
    });
    window.loadURL('file://' + startscreen);
    window.on('close', () => {
        electron.app.exit();
    });
    electron.app.setAsDefaultProtocolClient('mgt-eco-app')
    return window;
}

//electron ready
try {
    electron.app.on('ready', () => {
        electron.nativeTheme.themeSource = 'dark';
        regedit.list(['HKCU\\mgt_eco_app']).then(data => {
            let exist = data["HKCU\\mgt_eco_app"].exists
            if (!exist) {
                createDialogWindow();
            } else if (dateInPast(new Date(decryptRegistry(data["HKCU\\mgt_eco_app"].values.Expiry.value, key_decrypt)))) {
                createDialogWindow();
            } else {
                startNodered()
            }
        })
    })
    // Quit when all windows are closed.
    electron.app.on('window-all-closed', () => {
        // On OS X it is common for applications and their menu bar
        // to stay active until the user quits explicitly with Cmd + Q
        if (process.platform !== 'darwin') {
            electron.app.exit();
        }
    });

    electron.app.on('activate', () => {
        // On OS X it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (mainWindow === null) {
            startNodered()
        } else {
            mainWindow.show();
        }
    });
} catch (error) {
    electron.dialog.showErrorBox('App Error:', error.toString());
    electron.app.exit();
}
