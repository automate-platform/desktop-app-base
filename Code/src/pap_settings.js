var settings = {
        uiHost: '127.0.0.1',
        uiPort: 1204,
        httpAdminRoot: '/red',
        httpNodeRoot: '/',
        // adminAuth: {
        //     type: "credentials",
        //     users: [
        //         {
        //             username: "quangnh22",
        //             password: "$2b$08$ll/HFehqEPV/Da1rGmgTA.J/s7bdNgTakNEZS9uxwiPPZt2LqVONy",
        //             permissions: "*"
        //         }
        //     ]
        // },
        userDir: __dirname,
        editorTheme: { projects: { enabled: false } },
        flowFile: 'flows.json',
        functionGlobalContext: {
            __dirname: __dirname,
            config: { "MARKET_SERVER": "http://ap.vtgo.vn:8008/" }
        },
        logging: {
            console: {
                level: 'info',
                metrics: false,
                audit: false
            },
        }
    }
    module.exports = settings