let parameters = {

    'local': {
        baseUrl: 'TODO'
    },
    'stage': {
        stageUrl: 'TODO'
    },
    'uat': {
        uatUrl: 'TODO',
    }
}


let capabilities = {
    'chrome': {
        browserName: 'chrome',
        unexpectedAlertBehaviour: 'accept',
        chromeOptions: {
            args: ['disable-infobars']
        }
    },
    'chrome-headless': {
        browserName: 'chrome',
        chromeOptions: {
            args: ['--headless', '--disable-gpu', '-window-size=1400,1400']
        }
    },
    'chrome-parallel-exec': {
        browserName: 'chrome',
        shardTestFiles: true,
        maxInstances: 2
    },
    'cross-browser': [{
        browserName: 'chrome',
        unexpectedAlertBehaviour: 'accept',
        chromeOptions: {
            args: ['disable-infobars']
        }
    }, {
        browserName: 'firefox',
    }]
}

module.exports = {
    parameters,
    capabilities
}