# Protractor tests template

>>>> Tests written in protractor

<code>___1. Git clone git@gitlab.com:theredpandas/protractor-qa-template.git___</code><br>
<code>___2. cd `protractor-qa-template` folder___</code><br>
<code>___3. To install the dependencies, enter command 'sudo npm install___'</code><br>
<code>___4. To execute the tests on local, you should have application running on the local___</code><br>
<code>___5. Add application URL in getEnvConf.js file. To run tests on local, add baseUrl in local. To run tests on stage, add stageUrl in stage and for uat add uatUrl in uat___</code><br>

> **_Note:_** Following commands run the tests on chrome

``` bash
To run tests on local machine, enter command 
`npm run test:local:chrome`
```

``` bash
To run tests parallely on local, enter command
`npm run test:local:chrome-parallel-exec`
```

``` bash
To run tests cross browser on local, enter command
`npm run test:local:cross-browser`

Note: This will launch chrome and firefox to execute tests
```

``` bash
To run tests in a suite, enter command
`npm run test:local:chrome-suite suitename`

e.g. npm run test:local:chrome:chrome-suite smokeTests
This will run smoke tests only
```
