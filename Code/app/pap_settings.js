const settings = {
    uiHost: '127.0.0.1',
    uiPort: 1204,
    httpAdminRoot: '/red',
    httpNodeRoot: '/',
    adminAuth: {
        type: "credentials",
        users: [
            {
                username: "quangnh22",
                password: "$2b$08$ll/HFehqEPV/Da1rGmgTA.J/s7bdNgTakNEZS9uxwiPPZt2LqVONy",
                permissions: "*"
            }
        ]
    },
    userDir: __dirname,
    editorTheme: { projects: { enabled: false } },
    flowFile: 'flows.json',
    functionGlobalContext: {
        __dirname: __dirname,
        config: { "MARKET_SERVER": "http://ap.vtgo.vn:8008/" }
    },
    logging: {
        // Console logging
        console: {
            level: 'info',
            metrics: false,
            audit: false
        },
        // Custom logger
        // myCustomLogger: {
        //     level: 'debug',
        //     metrics: false,
        //     handler: function (settings) {
        //         var net = require('net');
        //         var logHost = '127.0.0.1', logPort = 2903;
        //         var conn = new net.Socket();
        //         // Called when the logger is initialised
        //         conn.connect(logPort, logHost)
        //             .on('connect', function () {
        //                 console.log("Logger connected")
        //             })
        //             .on('error', function (err) {
        //                 // Should attempt to reconnect in a real env
        //                 // This example just exits...
        //                 process.exit(1);
        //             });
        //         // Return the logging function
        //         return function (msg) {
        //             //console.log(msg.timestamp, msg);
        //             var message = {
        //                 '@tags': ['node-red', 'test'],
        //                 '@fields': msg,
        //                 '@timestamp': (new Date(msg.timestamp)).toISOString()
        //             }
        //             try {
        //                 conn.write(JSON.stringify(msg) + "\n");
        //             } catch (err) { console.log(err); }
        //         }
        //     }
        // }
    }
}

module.exports = settings