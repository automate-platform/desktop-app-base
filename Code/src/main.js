"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const electron_2 = require("electron");
const regedit = require('regedit').promisified

const CryptoJS = require("crypto-js");
const path = require("path");
const fs = require("fs");
var settings = require('./pap_settings.js')
// import { settings } from "./pap_settings.js"
// var settings = {
//     uiHost: '127.0.0.1',
//     uiPort: 1204,
//     httpAdminRoot: '/red',
//     httpNodeRoot: '/',
//     // adminAuth: {
//     //     type: "credentials",
//     //     users: [
//     //         {
//     //             username: "quangnh22",
//     //             password: "$2b$08$ll/HFehqEPV/Da1rGmgTA.J/s7bdNgTakNEZS9uxwiPPZt2LqVONy",
//     //             permissions: "*"
//     //         }
//     //     ]
//     // },
//     userDir: __dirname,
//     editorTheme: { projects: { enabled: false } },
//     flowFile: 'flows.json',
//     functionGlobalContext: {
//         __dirname: __dirname,
//         config: { "MARKET_SERVER": "http://ap.vtgo.vn:8008/" }
//     },
//     logging: {
//         // Console logging
//         console: {
//             level: 'info',
//             metrics: false,
//             audit: false
//         },
//         // Custom logger
//         // myCustomLogger: {
//         //     level: 'debug',
//         //     metrics: false,
//         //     handler: function (settings) {
//         //         var net = require('net');
//         //         var logHost = '127.0.0.1', logPort = 2903;
//         //         var conn = new net.Socket();
//         //         // Called when the logger is initialised
//         //         conn.connect(logPort, logHost)
//         //             .on('connect', function () {
//         //                 console.log("Logger connected")
//         //             })
//         //             .on('error', function (err) {
//         //                 // Should attempt to reconnect in a real env
//         //                 // This example just exits...
//         //                 process.exit(1);
//         //             });
//         //         // Return the logging function
//         //         return function (msg) {
//         //             //console.log(msg.timestamp, msg);
//         //             var message = {
//         //                 '@tags': ['node-red', 'test'],
//         //                 '@fields': msg,
//         //                 '@timestamp': (new Date(msg.timestamp)).toISOString()
//         //             }
//         //             try {
//         //                 conn.write(JSON.stringify(msg) + "\n");
//         //             } catch (err) { console.log(err); }
//         //         }
//         //     }
//         // }
//     }
// } 

//nodered

var os = require('os');
var child_process = require('child_process');
var http = require('http');
var expressApp = require('express')();
var server = http.createServer(expressApp);
var RED = require('node-red');

const key_decrypt = "MGT@2023MGT@2023";
var menu_apps = require('./menu.json');
var menu_extensions = require('./extensions.json');
var list_extensions = [];
var list_apps = [];
var url = 'http://' + settings.uiHost + ':' + settings.uiPort + settings.httpAdminRoot;
var gen_url = path.join('file:', __dirname, 'extension/HTML/index.html')
let startscreen = path.join(__dirname, 'extension/startscreen/index.html');
let marketscreen = path.join(__dirname, 'extension/market/index.html');

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

if (menu_apps.length) {
    for (let i = 0; i < menu_apps.length; i++) {
        list_apps.push({
            label: menu_apps[i].app_name,
            enabled: true,
            click() {
                win.loadURL(path.join(settings.functionGlobalContext.__dirname, menu_apps[i].app_dir, 'index.html'));
            }
        });
    }
}

if(menu_extensions.length){
    for (let i = 0; i < menu_extensions.length; i++) {
        list_extensions.push(path.join(settings.functionGlobalContext.__dirname,menu_extensions[i].extension_dir))
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
            win.loadURL(marketscreen);
        }
    },
    {
        label: 'Insight Jira',
        enabled: true,
        click() {
            win.loadURL("https://insight.fsoft.com.vn/jira9/secure/Dashboard.jspa");
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
    extensions.forEach(extensionPath => {
        electron_1.session.defaultSession.loadExtension(extensionPath);
    });

    // Create the browser window.
    win = new electron_1.BrowserWindow({
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
    app.setAsDefaultProtocolClient('foobar')

    app.on('open-url', (event, url) => {
        electron_1.dialog.showErrorBox('Welcome Back', `You arrived from: ${url}`)
    })
    const url = new URL(path.join('file:', startscreen));
    if (serve) {
        const debug = require('electron-debug');
        debug();
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
    win.webContents.openDevTools()
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
        }
    });
}
catch (e) {
    // Catch Error
    // throw e;
}
