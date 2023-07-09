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
const CryptoJS = require("crypto-js");


var list_app = [];
var url = 'http://' + settings.uiHost + ':' + settings.uiPort + settings.httpAdminRoot;
var gen_url = path.join('file:', __dirname, 'extension/HTML/index.html')
let startscreen = path.join(__dirname, 'extension/startscreen/index.html');
let marketscreen = path.join(__dirname, 'extension/market/index.html');
const key_decrypt = "MGT@2023MGT@2023";

// fs.watch(menuTemplatePath, (eventType, filename) => {
//     if (eventType === 'change') {
//         console.log('Menu template file changed. Reloading menu...');
//         setTimeout(() => {
//             // require('electron-reloader')(__dirname);
//             RED.stop().then(() => {
//                 electron_1.app.relaunch()
//                 electron_1.app.exit();
//             });
//         }, 4500);
//     }
// });



// const inputText = "11111111111111111111111111111";
// console.log('Text input:' + inputText);
// const inputBytes_encrypt = CryptoJS.enc.Utf8.parse(inputText);
// const key = CryptoJS.enc.Utf8.parse("MGT@2023MGT@2023");
// const cipher_encrypt = CryptoJS.AES.encrypt(inputBytes_encrypt, key, {
//     mode: CryptoJS.mode.ECB,
// });
// const encryptedHex = cipher_encrypt.ciphertext.toString(CryptoJS.enc.Hex);
// console.log("Encrypted Text (Hex format):", encryptedHex);

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
    // console.log("Decrypted Text (Base64 format):", decryptedBase64);
    const decodedText = atob(decryptedBase64);
    // console.log("Decoded Text:", decodedText);
    return decodedText;
}

function dateInPast(date) {
    var now = new Date()
    if (date.setHours(0, 0, 0, 0) <= now.setHours(0, 0, 0, 0)) {
        return true;
    }
    return false;
};

if (menu_app.length) {
    for (let i = 0; i < menu_app.length; i++) {
        var gen_url = path.join(settings.functionGlobalContext.__dirname, menu_app[i].app_dir, 'index.html')
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
            win.loadURL(marketscreen);
        }
    }

]



const menu = electron_1.Menu.buildFromTemplate(template)

let win = null;
let winEditor = null;

const args = process.argv.slice(1), serve = args.some(val => val === '--serve');

function startNodered() {
    regedit.list(['HKCU\\mgt_eco_app']).then(data => {
        let exist = data["HKCU\\mgt_eco_app"].exists
        if (!exist) {
            createDialogWindow();
        } else if (dateInPast(new Date(decryptRegistry(data["HKCU\\mgt_eco_app"].values.Expiry.value, key_decrypt)))) {
            createDialogWindow();
        } else {
            RED.init(server, settings);
            expressApp.use(settings.httpAdminRoot, RED.httpAdmin);
            expressApp.use(settings.httpNodeRoot, RED.httpNode);
            server.on('error', function (error) {
                electron_1.dialog.showErrorBox('Error', error.toString());
            });
            server.listen(settings.uiPort, settings.uiHost, function () {
                RED.start().then(function () {
                    createWindow()
                }).catch(function (error) {
                    electron_1.dialog.showErrorBox('Error', error.toString());
                    app.exit(1);
                });
            });
        }
    }).catch(error => {
        console.log(error);
    })
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
        electron_1.dialog.showErrorBox('Welcome Back', `You arrived from: ${url}`)
    })
    const url = new URL(path.join('file:', startscreen));
    if (serve) {
        const debug = require('electron-debug');
        debug();
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
    // win.webContents.openDevTools()
    return win;
}
try {
    // This method will be called when Electron has finished
    // initialization and is ready to create browser windows.
    // Some APIs can only be used after this event occurs.
    // Added 400 ms to fix the black background issue while using transparent window. More detais at https://github.com/electron/electron/issues/15947
    electron_1.app.on('ready', () => {
        setTimeout(startNodered, 2000)
    });

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