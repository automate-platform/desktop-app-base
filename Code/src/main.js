"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const electron_2 = require("electron");
const regedit = require('regedit').promisified

const CryptoJS = require("crypto-js");
const path = require("path");
const fs = require("fs");
const settings = require('./pap_settings.js');

//nodered
var os = require('os');
var child_process = require('child_process');
var http = require('http');
var expressApp = require('express')();
var server = http.createServer(expressApp);
var RED = require('node-red');

const key_decrypt = "MGT@2023MGT@2023";
var url = 'http://' + settings.uiHost + ':' + settings.uiPort + settings.httpAdminRoot;
var list_extensions = [];
var list_apps = [];
let startscreen = path.join(__dirname, 'index.html');
let marketscreen = path.join(__dirname, 'extension/market/index.html');

if (!fs.existsSync(path.join(__dirname, 'extensions.json'))) {
    fs.writeFileSync(path.join(__dirname, 'extensions.json'), JSON.stringify([]))
}

if (!fs.existsSync(path.join(__dirname, 'menu.json'))) {
    fs.writeFileSync(path.join(__dirname, 'menu.json'), JSON.stringify([]))
}

var menu_extensions = require('./extensions.json');
var menu_apps = require('./menu.json');

if (menu_apps.length) {
    for (let i = 0; i < menu_apps.length; i++) {
        list_apps.push({
            label: menu_apps[i].app_name,
            enabled: true,
            click() {
                mainWindow.loadURL(path.join(settings.functionGlobalContext.__dirname, menu_apps[i].app_dir, 'index.html'));
            }
        });
    }
}

if (menu_extensions.length) {
    for (let i = 0; i < menu_extensions.length; i++) {
        list_extensions.push(path.join(settings.functionGlobalContext.__dirname, menu_extensions[i].extension_dir))
    }
}
const extensions = list_extensions;

const template = [
    {
        label: 'Tools',
        submenu: list_apps
    },
    {
        label: 'Market Extention',
        enabled: true,
        click() {
            mainWindow.loadURL(marketscreen);
        }
    },
    {
        label: 'Web Page',
        submenu: [
            {
                label: 'Insight Jira',
                enabled: true,
                click() {
                    winEditor.loadURL("https://insight.fsoft.com.vn/jira9/secure/Dashboard.jspa")
                    winEditor.maximize()
                }
            },
            {
                label: 'Market',
                enabled: true,
                click() {
                    winEditor.loadURL("https://flows.vtgo.vn")
                    winEditor.maximize()
                }
            }
        ]
    }
]

const menu = electron_1.Menu.buildFromTemplate(template)
let mainWindow = null;
let winEditor = null;

const args = process.argv.slice(1), serve = args.some(val => val === '--serve');

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

function startNodered() {
    RED.init(server, settings);
    expressApp.use(settings.httpAdminRoot, RED.httpAdmin);
    expressApp.use(settings.httpNodeRoot, RED.httpNode);
    server.on('error', function (error) {
        electron_1.dialog.showErrorBox('ErrorRED1', error.toString());
    });
    server.listen(settings.uiPort, settings.uiHost, function () {
        RED.start().then(function () {
            winEditor = createWindow();
            mainWindow = createMainWindow();
            mainWindow.maximize();
        }).catch(function (error) {
            electron_1.dialog.showErrorBox('ErrorRED2', error.toString(), settings.userDir);
            electron_1.app.exit(1);
        });
    });
}

function createDialogWindow() {
    const app = electron_2.app;
    electron_2.dialog.showMessageBox({
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
    extensions.forEach(extensionPath => {
        electron_1.session.defaultSession.loadExtension(extensionPath);
    });

    // Create the browser window.
    const window = new electron_1.BrowserWindow({
        title: 'Web Page',
        center: true,
        autoHideMenuBar: true,
        show: false,
        parent: mainWindow,
        icon: __dirname + '/icon.ico',
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: true,
            // allowRunningInsecureContent: (serve)
        },
    });
    window.on('close', () => {
        winEditor = createWindow();
    });
    return window;
}

function createMainWindow() {
    electron_1.Menu.setApplicationMenu(menu)
    extensions.forEach(extensionPath => {
        electron_1.session.defaultSession.loadExtension(extensionPath);
    });

    // Create the browser window.
    const window = new electron_1.BrowserWindow({
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
        electron_1.app.exit();
    });
    electron_1.app.setAsDefaultProtocolClient('mgt-eco-app')
    return window;
}

electron_1.app.on('ready', () => {
    regedit.list(['HKCU\\mgt_eco_app']).then(data => {
        let exist = data["HKCU\\mgt_eco_app"].exists
        if (!exist) {
            createDialogWindow();
        } else if (dateInPast(new Date(decryptRegistry(data["HKCU\\mgt_eco_app"].values.Expiry.value, key_decrypt)))) {
            createDialogWindow();
        } else {
            startNodered()
        }

        // child_process.exec(`reg query HKCU\\mgt_eco_app`, (error, stdout) => {
        //     if (error) {
        //         createDialogWindow();
        //     } else {
        //         let registry = {};
        //         registry['values'] = {};
        //         stdout.trim().split('\r\n').forEach((reg, idx) => {
        //             if (idx > 0) {
        //                 let regestry_els = reg.trim().replace(new RegExp("[ ]+", "g"), "_").split("_");
        //                 registry['values'][regestry_els[0]] = {
        //                     value: regestry_els[regestry_els.length - 1]
        //                 }
        //             }
        //         });
        //         if (dateInPast(new Date(decryptRegistry(registry['values']['Expiry']['value'], key_decrypt)))) {
        //             createDialogWindow();
        //         } else {
        //             startNodered()
        //         }
        //     }
        // });
    })
})
// Quit when all windows are closed.
electron_1.app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        electron_1.app.exit();
    }
});

electron_1.app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        startNodered()
    } else {
        mainWindow.show();
    }
});