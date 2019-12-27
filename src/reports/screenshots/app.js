var app = angular.module('reportingApp', []);

//<editor-fold desc="global helpers">

var isValueAnArray = function (val) {
    return Array.isArray(val);
};

var getSpec = function (str) {
    var describes = str.split('|');
    return describes[describes.length - 1];
};
var checkIfShouldDisplaySpecName = function (prevItem, item) {
    if (!prevItem) {
        item.displaySpecName = true;
    } else if (getSpec(item.description) !== getSpec(prevItem.description)) {
        item.displaySpecName = true;
    }
};

var getParent = function (str) {
    var arr = str.split('|');
    str = "";
    for (var i = arr.length - 2; i > 0; i--) {
        str += arr[i] + " > ";
    }
    return str.slice(0, -3);
};

var getShortDescription = function (str) {
    return str.split('|')[0];
};

var countLogMessages = function (item) {
    if ((!item.logWarnings || !item.logErrors) && item.browserLogs && item.browserLogs.length > 0) {
        item.logWarnings = 0;
        item.logErrors = 0;
        for (var logNumber = 0; logNumber < item.browserLogs.length; logNumber++) {
            var logEntry = item.browserLogs[logNumber];
            if (logEntry.level === 'SEVERE') {
                item.logErrors++;
            }
            if (logEntry.level === 'WARNING') {
                item.logWarnings++;
            }
        }
    }
};

var defaultSortFunction = function sortFunction(a, b) {
    if (a.sessionId < b.sessionId) {
        return -1;
    }
    else if (a.sessionId > b.sessionId) {
        return 1;
    }

    if (a.timestamp < b.timestamp) {
        return -1;
    }
    else if (a.timestamp > b.timestamp) {
        return 1;
    }

    return 0;
};


//</editor-fold>

app.controller('ScreenshotReportController', function ($scope, $http) {
    var that = this;
    var clientDefaults = {};

    $scope.searchSettings = Object.assign({
        description: '',
        allselected: true,
        passed: true,
        failed: true,
        pending: true,
        withLog: true
    }, clientDefaults.searchSettings || {}); // enable customisation of search settings on first page hit

    var initialColumnSettings = clientDefaults.columnSettings; // enable customisation of visible columns on first page hit
    if (initialColumnSettings) {
        if (initialColumnSettings.displayTime !== undefined) {
            // initial settings have be inverted because the html bindings are inverted (e.g. !ctrl.displayTime)
            this.displayTime = !initialColumnSettings.displayTime;
        }
        if (initialColumnSettings.displayBrowser !== undefined) {
            this.displayBrowser = !initialColumnSettings.displayBrowser; // same as above
        }
        if (initialColumnSettings.displaySessionId !== undefined) {
            this.displaySessionId = !initialColumnSettings.displaySessionId; // same as above
        }
        if (initialColumnSettings.displayOS !== undefined) {
            this.displayOS = !initialColumnSettings.displayOS; // same as above
        }
        if (initialColumnSettings.inlineScreenshots !== undefined) {
            this.inlineScreenshots = initialColumnSettings.inlineScreenshots; // this setting does not have to be inverted
        } else {
            this.inlineScreenshots = false;
        }
    }

    this.showSmartStackTraceHighlight = true;

    this.chooseAllTypes = function () {
        var value = true;
        $scope.searchSettings.allselected = !$scope.searchSettings.allselected;
        if (!$scope.searchSettings.allselected) {
            value = false;
        }

        $scope.searchSettings.passed = value;
        $scope.searchSettings.failed = value;
        $scope.searchSettings.pending = value;
        $scope.searchSettings.withLog = value;
    };

    this.isValueAnArray = function (val) {
        return isValueAnArray(val);
    };

    this.getParent = function (str) {
        return getParent(str);
    };

    this.getSpec = function (str) {
        return getSpec(str);
    };

    this.getShortDescription = function (str) {
        return getShortDescription(str);
    };

    this.convertTimestamp = function (timestamp) {
        var d = new Date(timestamp),
            yyyy = d.getFullYear(),
            mm = ('0' + (d.getMonth() + 1)).slice(-2),
            dd = ('0' + d.getDate()).slice(-2),
            hh = d.getHours(),
            h = hh,
            min = ('0' + d.getMinutes()).slice(-2),
            ampm = 'AM',
            time;

        if (hh > 12) {
            h = hh - 12;
            ampm = 'PM';
        } else if (hh === 12) {
            h = 12;
            ampm = 'PM';
        } else if (hh === 0) {
            h = 12;
        }

        // ie: 2013-02-18, 8:35 AM
        time = yyyy + '-' + mm + '-' + dd + ', ' + h + ':' + min + ' ' + ampm;

        return time;
    };


    this.round = function (number, roundVal) {
        return (parseFloat(number) / 1000).toFixed(roundVal);
    };


    this.passCount = function () {
        var passCount = 0;
        for (var i in this.results) {
            var result = this.results[i];
            if (result.passed) {
                passCount++;
            }
        }
        return passCount;
    };


    this.pendingCount = function () {
        var pendingCount = 0;
        for (var i in this.results) {
            var result = this.results[i];
            if (result.pending) {
                pendingCount++;
            }
        }
        return pendingCount;
    };


    this.failCount = function () {
        var failCount = 0;
        for (var i in this.results) {
            var result = this.results[i];
            if (!result.passed && !result.pending) {
                failCount++;
            }
        }
        return failCount;
    };

    this.passPerc = function () {
        return (this.passCount() / this.totalCount()) * 100;
    };
    this.pendingPerc = function () {
        return (this.pendingCount() / this.totalCount()) * 100;
    };
    this.failPerc = function () {
        return (this.failCount() / this.totalCount()) * 100;
    };
    this.totalCount = function () {
        return this.passCount() + this.failCount() + this.pendingCount();
    };

    this.applySmartHighlight = function (line) {
        if (this.showSmartStackTraceHighlight) {
            if (line.indexOf('node_modules') > -1) {
                return 'greyout';
            }
            if (line.indexOf('  at ') === -1) {
                return '';
            }

            return 'highlight';
        }
        return true;
    };

    var results = [
    {
        "description": "Verify the elements on login page|Login sanity tests",
        "passed": false,
        "pending": false,
        "os": "Linux",
        "instanceId": 26045,
        "browser": {
            "name": "chrome",
            "version": "72.0.3626.96"
        },
        "message": [
            "Failed: unknown error: unhandled inspector error: {\"code\":-32000,\"message\":\"Cannot navigate to invalid URL\"}\n  (Session info: chrome=72.0.3626.96)\n  (Driver info: chromedriver=2.46.628388 (4a34a70827ac54148e092aafb70504c4ea7ae926),platform=Linux 4.15.0-65-generic x86_64)",
            "Failed: javascript error: angular is not defined\n  (Session info: chrome=72.0.3626.96)\n  (Driver info: chromedriver=2.46.628388 (4a34a70827ac54148e092aafb70504c4ea7ae926),platform=Linux 4.15.0-65-generic x86_64)"
        ],
        "trace": [
            "WebDriverError: unknown error: unhandled inspector error: {\"code\":-32000,\"message\":\"Cannot navigate to invalid URL\"}\n  (Session info: chrome=72.0.3626.96)\n  (Driver info: chromedriver=2.46.628388 (4a34a70827ac54148e092aafb70504c4ea7ae926),platform=Linux 4.15.0-65-generic x86_64)\n    at Object.checkLegacyResponse (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/error.js:546:15)\n    at parseHttpResponse (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/http.js:509:13)\n    at doSend.then.response (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/http.js:441:30)\n    at <anonymous>\n    at process._tickCallback (internal/process/next_tick.js:188:7)\nFrom: Task: WebDriver.navigate().to(/login)\n    at Driver.schedule (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/webdriver.js:807:17)\n    at Navigation.to (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/webdriver.js:1133:25)\n    at Driver.get (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/webdriver.js:988:28)\n    at ProtractorBrowser.get (/usr/local/lib/node_modules/protractor/built/browser.js:655:32)\n    at LoginPage.get (/home/vivek/protractor-qa-template/src/page-objects/login_page.js:16:17)\n    at UserContext.beforeEach (/home/vivek/protractor-qa-template/src/specs/login.spec.js:10:19)\n    at /usr/local/lib/node_modules/protractor/node_modules/jasminewd2/index.js:112:25\n    at new ManagedPromise (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:1077:7)\n    at ControlFlow.promise (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:2505:12)\n    at schedulerExecute (/usr/local/lib/node_modules/protractor/node_modules/jasminewd2/index.js:95:18)\nFrom: Task: Run beforeEach in control flow\n    at UserContext.<anonymous> (/usr/local/lib/node_modules/protractor/node_modules/jasminewd2/index.js:94:19)\n    at attempt (/usr/local/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4297:26)\n    at QueueRunner.run (/usr/local/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4217:20)\n    at runNext (/usr/local/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4257:20)\n    at /usr/local/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4264:13\n    at /usr/local/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4172:9\n    at /usr/local/lib/node_modules/protractor/node_modules/jasminewd2/index.js:64:48\n    at ControlFlow.emit (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/events.js:62:21)\n    at ControlFlow.shutdown_ (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:2674:10)\n    at shutdownTask_.MicroTask (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:2599:53)\nFrom asynchronous test: \nError\n    at Suite.describe (/home/vivek/protractor-qa-template/src/specs/login.spec.js:9:5)\n    at addSpecsToSuite (/usr/local/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:1107:25)\n    at Env.describe (/usr/local/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:1074:7)\n    at describe (/usr/local/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4399:18)\n    at Object.<anonymous> (/home/vivek/protractor-qa-template/src/specs/login.spec.js:7:1)\n    at Module._compile (module.js:652:30)\n    at Object.Module._extensions..js (module.js:663:10)\n    at Module.load (module.js:565:32)\n    at tryModuleLoad (module.js:505:12)",
            "JavascriptError: javascript error: angular is not defined\n  (Session info: chrome=72.0.3626.96)\n  (Driver info: chromedriver=2.46.628388 (4a34a70827ac54148e092aafb70504c4ea7ae926),platform=Linux 4.15.0-65-generic x86_64)\n    at Object.checkLegacyResponse (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/error.js:546:15)\n    at parseHttpResponse (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/http.js:509:13)\n    at doSend.then.response (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/http.js:441:30)\n    at <anonymous>\n    at process._tickCallback (internal/process/next_tick.js:188:7)\nFrom: Task: WebDriver.executeScript()\n    at Driver.schedule (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/webdriver.js:807:17)\n    at Driver.executeScript (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/webdriver.js:878:16)\n    at /usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/by.js:191:35\n    at call (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/webdriver.js:1068:28)\n    at /usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/webdriver.js:907:19\n    at ManagedPromise.invokeCallback_ (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:1376:14)\n    at TaskQueue.execute_ (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:3084:14)\n    at TaskQueue.executeNext_ (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:3067:27)\n    at asyncRun (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:2974:25)\n    at /usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:668:7\nFrom: Task: WebDriver.call(function)\n    at Driver.call (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/webdriver.js:901:23)\n    at Driver.findElementsInternal_ (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/webdriver.js:1068:17)\n    at Driver.findElements (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/webdriver.js:1043:19)\n    at Object.findElementsOverride (/usr/local/lib/node_modules/protractor/built/locators.js:177:31)\n    at ptor.waitForAngular.then (/usr/local/lib/node_modules/protractor/built/element.js:156:40)\n    at ManagedPromise.invokeCallback_ (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:1376:14)\n    at TaskQueue.execute_ (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:3084:14)\n    at TaskQueue.executeNext_ (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:3067:27)\n    at asyncRun (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:2927:27)\n    at /usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:668:7\nFrom: Task: <anonymous>\n    at pollCondition (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:2195:19)\n    at /usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:2191:7\n    at new ManagedPromise (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:1077:7)\n    at ControlFlow.promise (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:2505:12)\n    at /usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:2190:22\n    at TaskQueue.execute_ (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:3084:14)\n    at TaskQueue.executeNext_ (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:3067:27)\n    at asyncRun (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:2974:25)\n    at /usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:668:7\n    at <anonymous>\nFrom: Task: Element taking too long to appear in the DOM\n    at scheduleWait (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:2188:20)\n    at ControlFlow.wait (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:2517:12)\n    at Driver.wait (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/webdriver.js:934:29)\n    at run (/usr/local/lib/node_modules/protractor/built/browser.js:59:33)\n    at ProtractorBrowser.to.(anonymous function) [as wait] (/usr/local/lib/node_modules/protractor/built/browser.js:67:16)\n    at Waits.waitForElementVisibility (/home/vivek/protractor-qa-template/src/helpers/waits.js:12:17)\n    at LoginPage.getTitle (/home/vivek/protractor-qa-template/src/page-objects/login_page.js:20:14)\n    at UserContext.it (/home/vivek/protractor-qa-template/src/specs/login.spec.js:14:26)\n    at /usr/local/lib/node_modules/protractor/node_modules/jasminewd2/index.js:112:25\n    at new ManagedPromise (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:1077:7)\nFrom: Task: Run it(\"Verify the elements on login page\") in control flow\n    at UserContext.<anonymous> (/usr/local/lib/node_modules/protractor/node_modules/jasminewd2/index.js:94:19)\n    at attempt (/usr/local/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4297:26)\n    at QueueRunner.run (/usr/local/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4217:20)\n    at runNext (/usr/local/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4257:20)\n    at /usr/local/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4264:13\n    at /usr/local/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4172:9\n    at Function.next.fail (/usr/local/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4274:9)\n    at /usr/local/lib/node_modules/protractor/node_modules/jasminewd2/index.js:64:48\n    at ControlFlow.emit (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/events.js:62:21)\n    at ControlFlow.shutdown_ (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:2674:10)\nFrom asynchronous test: \nError\n    at Suite.describe (/home/vivek/protractor-qa-template/src/specs/login.spec.js:13:5)\n    at addSpecsToSuite (/usr/local/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:1107:25)\n    at Env.describe (/usr/local/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:1074:7)\n    at describe (/usr/local/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4399:18)\n    at Object.<anonymous> (/home/vivek/protractor-qa-template/src/specs/login.spec.js:7:1)\n    at Module._compile (module.js:652:30)\n    at Object.Module._extensions..js (module.js:663:10)\n    at Module.load (module.js:565:32)\n    at tryModuleLoad (module.js:505:12)"
        ],
        "browserLogs": [],
        "screenShotFile": "images/0025000a-008f-0091-0024-000b00810058.png",
        "timestamp": 1575254981512,
        "duration": 196
    },
    {
        "description": "invalid login attempts|Login sanity tests",
        "passed": false,
        "pending": false,
        "os": "Linux",
        "instanceId": 26045,
        "browser": {
            "name": "chrome",
            "version": "72.0.3626.96"
        },
        "message": [
            "Failed: unknown error: unhandled inspector error: {\"code\":-32000,\"message\":\"Cannot navigate to invalid URL\"}\n  (Session info: chrome=72.0.3626.96)\n  (Driver info: chromedriver=2.46.628388 (4a34a70827ac54148e092aafb70504c4ea7ae926),platform=Linux 4.15.0-65-generic x86_64)",
            "Failed: Cannot read property 'click' of undefined"
        ],
        "trace": [
            "WebDriverError: unknown error: unhandled inspector error: {\"code\":-32000,\"message\":\"Cannot navigate to invalid URL\"}\n  (Session info: chrome=72.0.3626.96)\n  (Driver info: chromedriver=2.46.628388 (4a34a70827ac54148e092aafb70504c4ea7ae926),platform=Linux 4.15.0-65-generic x86_64)\n    at Object.checkLegacyResponse (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/error.js:546:15)\n    at parseHttpResponse (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/http.js:509:13)\n    at doSend.then.response (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/http.js:441:30)\n    at <anonymous>\n    at process._tickCallback (internal/process/next_tick.js:188:7)\nFrom: Task: WebDriver.navigate().to(/login)\n    at Driver.schedule (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/webdriver.js:807:17)\n    at Navigation.to (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/webdriver.js:1133:25)\n    at Driver.get (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/webdriver.js:988:28)\n    at ProtractorBrowser.get (/usr/local/lib/node_modules/protractor/built/browser.js:655:32)\n    at LoginPage.get (/home/vivek/protractor-qa-template/src/page-objects/login_page.js:16:17)\n    at UserContext.beforeEach (/home/vivek/protractor-qa-template/src/specs/login.spec.js:10:19)\n    at /usr/local/lib/node_modules/protractor/node_modules/jasminewd2/index.js:112:25\n    at new ManagedPromise (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:1077:7)\n    at ControlFlow.promise (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:2505:12)\n    at schedulerExecute (/usr/local/lib/node_modules/protractor/node_modules/jasminewd2/index.js:95:18)\nFrom: Task: Run beforeEach in control flow\n    at UserContext.<anonymous> (/usr/local/lib/node_modules/protractor/node_modules/jasminewd2/index.js:94:19)\n    at attempt (/usr/local/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4297:26)\n    at QueueRunner.run (/usr/local/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4217:20)\n    at runNext (/usr/local/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4257:20)\n    at /usr/local/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4264:13\n    at /usr/local/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4172:9\n    at /usr/local/lib/node_modules/protractor/node_modules/jasminewd2/index.js:64:48\n    at ControlFlow.emit (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/events.js:62:21)\n    at ControlFlow.shutdown_ (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:2674:10)\n    at shutdownTask_.MicroTask (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:2599:53)\nFrom asynchronous test: \nError\n    at Suite.describe (/home/vivek/protractor-qa-template/src/specs/login.spec.js:9:5)\n    at addSpecsToSuite (/usr/local/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:1107:25)\n    at Env.describe (/usr/local/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:1074:7)\n    at describe (/usr/local/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4399:18)\n    at Object.<anonymous> (/home/vivek/protractor-qa-template/src/specs/login.spec.js:7:1)\n    at Module._compile (module.js:652:30)\n    at Object.Module._extensions..js (module.js:663:10)\n    at Module.load (module.js:565:32)\n    at tryModuleLoad (module.js:505:12)",
            "TypeError: Cannot read property 'click' of undefined\n    at GenericClass.click (/home/vivek/protractor-qa-template/src/helpers/generic.js:14:14)\n    at UserContext.it (/home/vivek/protractor-qa-template/src/specs/login.spec.js:43:26)\n    at /usr/local/lib/node_modules/protractor/node_modules/jasminewd2/index.js:112:25\n    at new ManagedPromise (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:1077:7)\n    at ControlFlow.promise (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:2505:12)\n    at schedulerExecute (/usr/local/lib/node_modules/protractor/node_modules/jasminewd2/index.js:95:18)\n    at TaskQueue.execute_ (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:3084:14)\n    at TaskQueue.executeNext_ (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:3067:27)\n    at asyncRun (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:2974:25)\n    at /usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:668:7\nFrom: Task: Run it(\"invalid login attempts\") in control flow\n    at UserContext.<anonymous> (/usr/local/lib/node_modules/protractor/node_modules/jasminewd2/index.js:94:19)\n    at attempt (/usr/local/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4297:26)\n    at QueueRunner.run (/usr/local/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4217:20)\n    at runNext (/usr/local/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4257:20)\n    at /usr/local/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4264:13\n    at /usr/local/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4172:9\n    at Function.next.fail (/usr/local/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4274:9)\n    at /usr/local/lib/node_modules/protractor/node_modules/jasminewd2/index.js:64:48\n    at ControlFlow.emit (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/events.js:62:21)\n    at ControlFlow.shutdown_ (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:2674:10)\nFrom asynchronous test: \nError\n    at /home/vivek/protractor-qa-template/src/specs/login.spec.js:40:9\n    at /home/vivek/protractor-qa-template/node_modules/jasmine-data-provider/src/index.js:25:22\n    at Array.forEach (<anonymous>)\n    at /home/vivek/protractor-qa-template/node_modules/jasmine-data-provider/src/index.js:20:20\n    at Suite.describe (/home/vivek/protractor-qa-template/src/specs/login.spec.js:39:5)\n    at addSpecsToSuite (/usr/local/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:1107:25)\n    at Env.describe (/usr/local/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:1074:7)\n    at describe (/usr/local/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4399:18)\n    at Object.<anonymous> (/home/vivek/protractor-qa-template/src/specs/login.spec.js:7:1)"
        ],
        "browserLogs": [],
        "screenShotFile": "images/00cc0050-003e-0016-00da-003800eb00ca.png",
        "timestamp": 1575254981893,
        "duration": 17
    },
    {
        "description": "invalid login attempts|Login sanity tests",
        "passed": false,
        "pending": false,
        "os": "Linux",
        "instanceId": 26045,
        "browser": {
            "name": "chrome",
            "version": "72.0.3626.96"
        },
        "message": [
            "Failed: unknown error: unhandled inspector error: {\"code\":-32000,\"message\":\"Cannot navigate to invalid URL\"}\n  (Session info: chrome=72.0.3626.96)\n  (Driver info: chromedriver=2.46.628388 (4a34a70827ac54148e092aafb70504c4ea7ae926),platform=Linux 4.15.0-65-generic x86_64)",
            "Failed: Cannot read property 'click' of undefined"
        ],
        "trace": [
            "WebDriverError: unknown error: unhandled inspector error: {\"code\":-32000,\"message\":\"Cannot navigate to invalid URL\"}\n  (Session info: chrome=72.0.3626.96)\n  (Driver info: chromedriver=2.46.628388 (4a34a70827ac54148e092aafb70504c4ea7ae926),platform=Linux 4.15.0-65-generic x86_64)\n    at Object.checkLegacyResponse (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/error.js:546:15)\n    at parseHttpResponse (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/http.js:509:13)\n    at doSend.then.response (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/http.js:441:30)\n    at <anonymous>\n    at process._tickCallback (internal/process/next_tick.js:188:7)\nFrom: Task: WebDriver.navigate().to(/login)\n    at Driver.schedule (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/webdriver.js:807:17)\n    at Navigation.to (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/webdriver.js:1133:25)\n    at Driver.get (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/webdriver.js:988:28)\n    at ProtractorBrowser.get (/usr/local/lib/node_modules/protractor/built/browser.js:655:32)\n    at LoginPage.get (/home/vivek/protractor-qa-template/src/page-objects/login_page.js:16:17)\n    at UserContext.beforeEach (/home/vivek/protractor-qa-template/src/specs/login.spec.js:10:19)\n    at /usr/local/lib/node_modules/protractor/node_modules/jasminewd2/index.js:112:25\n    at new ManagedPromise (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:1077:7)\n    at ControlFlow.promise (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:2505:12)\n    at schedulerExecute (/usr/local/lib/node_modules/protractor/node_modules/jasminewd2/index.js:95:18)\nFrom: Task: Run beforeEach in control flow\n    at UserContext.<anonymous> (/usr/local/lib/node_modules/protractor/node_modules/jasminewd2/index.js:94:19)\n    at attempt (/usr/local/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4297:26)\n    at QueueRunner.run (/usr/local/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4217:20)\n    at runNext (/usr/local/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4257:20)\n    at /usr/local/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4264:13\n    at /usr/local/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4172:9\n    at /usr/local/lib/node_modules/protractor/node_modules/jasminewd2/index.js:64:48\n    at ControlFlow.emit (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/events.js:62:21)\n    at ControlFlow.shutdown_ (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:2674:10)\n    at shutdownTask_.MicroTask (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:2599:53)\nFrom asynchronous test: \nError\n    at Suite.describe (/home/vivek/protractor-qa-template/src/specs/login.spec.js:9:5)\n    at addSpecsToSuite (/usr/local/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:1107:25)\n    at Env.describe (/usr/local/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:1074:7)\n    at describe (/usr/local/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4399:18)\n    at Object.<anonymous> (/home/vivek/protractor-qa-template/src/specs/login.spec.js:7:1)\n    at Module._compile (module.js:652:30)\n    at Object.Module._extensions..js (module.js:663:10)\n    at Module.load (module.js:565:32)\n    at tryModuleLoad (module.js:505:12)",
            "TypeError: Cannot read property 'click' of undefined\n    at GenericClass.click (/home/vivek/protractor-qa-template/src/helpers/generic.js:14:14)\n    at UserContext.it (/home/vivek/protractor-qa-template/src/specs/login.spec.js:43:26)\n    at /usr/local/lib/node_modules/protractor/node_modules/jasminewd2/index.js:112:25\n    at new ManagedPromise (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:1077:7)\n    at ControlFlow.promise (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:2505:12)\n    at schedulerExecute (/usr/local/lib/node_modules/protractor/node_modules/jasminewd2/index.js:95:18)\n    at TaskQueue.execute_ (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:3084:14)\n    at TaskQueue.executeNext_ (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:3067:27)\n    at asyncRun (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:2974:25)\n    at /usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:668:7\nFrom: Task: Run it(\"invalid login attempts\") in control flow\n    at UserContext.<anonymous> (/usr/local/lib/node_modules/protractor/node_modules/jasminewd2/index.js:94:19)\n    at attempt (/usr/local/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4297:26)\n    at QueueRunner.run (/usr/local/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4217:20)\n    at runNext (/usr/local/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4257:20)\n    at /usr/local/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4264:13\n    at /usr/local/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4172:9\n    at Function.next.fail (/usr/local/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4274:9)\n    at /usr/local/lib/node_modules/protractor/node_modules/jasminewd2/index.js:64:48\n    at ControlFlow.emit (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/events.js:62:21)\n    at ControlFlow.shutdown_ (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:2674:10)\nFrom asynchronous test: \nError\n    at /home/vivek/protractor-qa-template/src/specs/login.spec.js:40:9\n    at /home/vivek/protractor-qa-template/node_modules/jasmine-data-provider/src/index.js:25:22\n    at Array.forEach (<anonymous>)\n    at /home/vivek/protractor-qa-template/node_modules/jasmine-data-provider/src/index.js:20:20\n    at Suite.describe (/home/vivek/protractor-qa-template/src/specs/login.spec.js:39:5)\n    at addSpecsToSuite (/usr/local/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:1107:25)\n    at Env.describe (/usr/local/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:1074:7)\n    at describe (/usr/local/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4399:18)\n    at Object.<anonymous> (/home/vivek/protractor-qa-template/src/specs/login.spec.js:7:1)"
        ],
        "browserLogs": [],
        "screenShotFile": "images/00e1004f-008c-0015-007a-00ee008c0046.png",
        "timestamp": 1575254982035,
        "duration": 14
    },
    {
        "description": "invalid login attempts|Login sanity tests",
        "passed": false,
        "pending": false,
        "os": "Linux",
        "instanceId": 26045,
        "browser": {
            "name": "chrome",
            "version": "72.0.3626.96"
        },
        "message": [
            "Failed: unknown error: unhandled inspector error: {\"code\":-32000,\"message\":\"Cannot navigate to invalid URL\"}\n  (Session info: chrome=72.0.3626.96)\n  (Driver info: chromedriver=2.46.628388 (4a34a70827ac54148e092aafb70504c4ea7ae926),platform=Linux 4.15.0-65-generic x86_64)",
            "Failed: Cannot read property 'click' of undefined"
        ],
        "trace": [
            "WebDriverError: unknown error: unhandled inspector error: {\"code\":-32000,\"message\":\"Cannot navigate to invalid URL\"}\n  (Session info: chrome=72.0.3626.96)\n  (Driver info: chromedriver=2.46.628388 (4a34a70827ac54148e092aafb70504c4ea7ae926),platform=Linux 4.15.0-65-generic x86_64)\n    at Object.checkLegacyResponse (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/error.js:546:15)\n    at parseHttpResponse (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/http.js:509:13)\n    at doSend.then.response (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/http.js:441:30)\n    at <anonymous>\n    at process._tickCallback (internal/process/next_tick.js:188:7)\nFrom: Task: WebDriver.navigate().to(/login)\n    at Driver.schedule (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/webdriver.js:807:17)\n    at Navigation.to (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/webdriver.js:1133:25)\n    at Driver.get (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/webdriver.js:988:28)\n    at ProtractorBrowser.get (/usr/local/lib/node_modules/protractor/built/browser.js:655:32)\n    at LoginPage.get (/home/vivek/protractor-qa-template/src/page-objects/login_page.js:16:17)\n    at UserContext.beforeEach (/home/vivek/protractor-qa-template/src/specs/login.spec.js:10:19)\n    at /usr/local/lib/node_modules/protractor/node_modules/jasminewd2/index.js:112:25\n    at new ManagedPromise (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:1077:7)\n    at ControlFlow.promise (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:2505:12)\n    at schedulerExecute (/usr/local/lib/node_modules/protractor/node_modules/jasminewd2/index.js:95:18)\nFrom: Task: Run beforeEach in control flow\n    at UserContext.<anonymous> (/usr/local/lib/node_modules/protractor/node_modules/jasminewd2/index.js:94:19)\n    at attempt (/usr/local/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4297:26)\n    at QueueRunner.run (/usr/local/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4217:20)\n    at runNext (/usr/local/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4257:20)\n    at /usr/local/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4264:13\n    at /usr/local/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4172:9\n    at /usr/local/lib/node_modules/protractor/node_modules/jasminewd2/index.js:64:48\n    at ControlFlow.emit (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/events.js:62:21)\n    at ControlFlow.shutdown_ (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:2674:10)\n    at shutdownTask_.MicroTask (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:2599:53)\nFrom asynchronous test: \nError\n    at Suite.describe (/home/vivek/protractor-qa-template/src/specs/login.spec.js:9:5)\n    at addSpecsToSuite (/usr/local/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:1107:25)\n    at Env.describe (/usr/local/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:1074:7)\n    at describe (/usr/local/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4399:18)\n    at Object.<anonymous> (/home/vivek/protractor-qa-template/src/specs/login.spec.js:7:1)\n    at Module._compile (module.js:652:30)\n    at Object.Module._extensions..js (module.js:663:10)\n    at Module.load (module.js:565:32)\n    at tryModuleLoad (module.js:505:12)",
            "TypeError: Cannot read property 'click' of undefined\n    at GenericClass.click (/home/vivek/protractor-qa-template/src/helpers/generic.js:14:14)\n    at UserContext.it (/home/vivek/protractor-qa-template/src/specs/login.spec.js:43:26)\n    at /usr/local/lib/node_modules/protractor/node_modules/jasminewd2/index.js:112:25\n    at new ManagedPromise (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:1077:7)\n    at ControlFlow.promise (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:2505:12)\n    at schedulerExecute (/usr/local/lib/node_modules/protractor/node_modules/jasminewd2/index.js:95:18)\n    at TaskQueue.execute_ (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:3084:14)\n    at TaskQueue.executeNext_ (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:3067:27)\n    at asyncRun (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:2974:25)\n    at /usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:668:7\nFrom: Task: Run it(\"invalid login attempts\") in control flow\n    at UserContext.<anonymous> (/usr/local/lib/node_modules/protractor/node_modules/jasminewd2/index.js:94:19)\n    at attempt (/usr/local/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4297:26)\n    at QueueRunner.run (/usr/local/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4217:20)\n    at runNext (/usr/local/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4257:20)\n    at /usr/local/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4264:13\n    at /usr/local/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4172:9\n    at Function.next.fail (/usr/local/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4274:9)\n    at /usr/local/lib/node_modules/protractor/node_modules/jasminewd2/index.js:64:48\n    at ControlFlow.emit (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/events.js:62:21)\n    at ControlFlow.shutdown_ (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:2674:10)\nFrom asynchronous test: \nError\n    at /home/vivek/protractor-qa-template/src/specs/login.spec.js:40:9\n    at /home/vivek/protractor-qa-template/node_modules/jasmine-data-provider/src/index.js:25:22\n    at Array.forEach (<anonymous>)\n    at /home/vivek/protractor-qa-template/node_modules/jasmine-data-provider/src/index.js:20:20\n    at Suite.describe (/home/vivek/protractor-qa-template/src/specs/login.spec.js:39:5)\n    at addSpecsToSuite (/usr/local/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:1107:25)\n    at Env.describe (/usr/local/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:1074:7)\n    at describe (/usr/local/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4399:18)\n    at Object.<anonymous> (/home/vivek/protractor-qa-template/src/specs/login.spec.js:7:1)"
        ],
        "browserLogs": [],
        "screenShotFile": "images/00d200bd-00a1-00bd-00f0-0038006f00ab.png",
        "timestamp": 1575254982150,
        "duration": 16
    },
    {
        "description": "user should be able to login|Login sanity tests",
        "passed": false,
        "pending": false,
        "os": "Linux",
        "instanceId": 26045,
        "browser": {
            "name": "chrome",
            "version": "72.0.3626.96"
        },
        "message": [
            "Failed: unknown error: unhandled inspector error: {\"code\":-32000,\"message\":\"Cannot navigate to invalid URL\"}\n  (Session info: chrome=72.0.3626.96)\n  (Driver info: chromedriver=2.46.628388 (4a34a70827ac54148e092aafb70504c4ea7ae926),platform=Linux 4.15.0-65-generic x86_64)",
            "Failed: javascript error: angular is not defined\n  (Session info: chrome=72.0.3626.96)\n  (Driver info: chromedriver=2.46.628388 (4a34a70827ac54148e092aafb70504c4ea7ae926),platform=Linux 4.15.0-65-generic x86_64)"
        ],
        "trace": [
            "WebDriverError: unknown error: unhandled inspector error: {\"code\":-32000,\"message\":\"Cannot navigate to invalid URL\"}\n  (Session info: chrome=72.0.3626.96)\n  (Driver info: chromedriver=2.46.628388 (4a34a70827ac54148e092aafb70504c4ea7ae926),platform=Linux 4.15.0-65-generic x86_64)\n    at Object.checkLegacyResponse (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/error.js:546:15)\n    at parseHttpResponse (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/http.js:509:13)\n    at doSend.then.response (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/http.js:441:30)\n    at <anonymous>\n    at process._tickCallback (internal/process/next_tick.js:188:7)\nFrom: Task: WebDriver.navigate().to(/login)\n    at Driver.schedule (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/webdriver.js:807:17)\n    at Navigation.to (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/webdriver.js:1133:25)\n    at Driver.get (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/webdriver.js:988:28)\n    at ProtractorBrowser.get (/usr/local/lib/node_modules/protractor/built/browser.js:655:32)\n    at LoginPage.get (/home/vivek/protractor-qa-template/src/page-objects/login_page.js:16:17)\n    at UserContext.beforeEach (/home/vivek/protractor-qa-template/src/specs/login.spec.js:10:19)\n    at /usr/local/lib/node_modules/protractor/node_modules/jasminewd2/index.js:112:25\n    at new ManagedPromise (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:1077:7)\n    at ControlFlow.promise (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:2505:12)\n    at schedulerExecute (/usr/local/lib/node_modules/protractor/node_modules/jasminewd2/index.js:95:18)\nFrom: Task: Run beforeEach in control flow\n    at UserContext.<anonymous> (/usr/local/lib/node_modules/protractor/node_modules/jasminewd2/index.js:94:19)\n    at attempt (/usr/local/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4297:26)\n    at QueueRunner.run (/usr/local/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4217:20)\n    at runNext (/usr/local/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4257:20)\n    at /usr/local/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4264:13\n    at /usr/local/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4172:9\n    at /usr/local/lib/node_modules/protractor/node_modules/jasminewd2/index.js:64:48\n    at ControlFlow.emit (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/events.js:62:21)\n    at ControlFlow.shutdown_ (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:2674:10)\n    at shutdownTask_.MicroTask (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:2599:53)\nFrom asynchronous test: \nError\n    at Suite.describe (/home/vivek/protractor-qa-template/src/specs/login.spec.js:9:5)\n    at addSpecsToSuite (/usr/local/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:1107:25)\n    at Env.describe (/usr/local/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:1074:7)\n    at describe (/usr/local/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4399:18)\n    at Object.<anonymous> (/home/vivek/protractor-qa-template/src/specs/login.spec.js:7:1)\n    at Module._compile (module.js:652:30)\n    at Object.Module._extensions..js (module.js:663:10)\n    at Module.load (module.js:565:32)\n    at tryModuleLoad (module.js:505:12)",
            "JavascriptError: javascript error: angular is not defined\n  (Session info: chrome=72.0.3626.96)\n  (Driver info: chromedriver=2.46.628388 (4a34a70827ac54148e092aafb70504c4ea7ae926),platform=Linux 4.15.0-65-generic x86_64)\n    at Object.checkLegacyResponse (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/error.js:546:15)\n    at parseHttpResponse (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/http.js:509:13)\n    at doSend.then.response (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/http.js:441:30)\n    at <anonymous>\n    at process._tickCallback (internal/process/next_tick.js:188:7)\nFrom: Task: WebDriver.executeScript()\n    at Driver.schedule (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/webdriver.js:807:17)\n    at Driver.executeScript (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/webdriver.js:878:16)\n    at /usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/by.js:191:35\n    at call (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/webdriver.js:1068:28)\n    at /usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/webdriver.js:907:19\n    at ManagedPromise.invokeCallback_ (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:1376:14)\n    at TaskQueue.execute_ (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:3084:14)\n    at TaskQueue.executeNext_ (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:3067:27)\n    at asyncRun (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:2974:25)\n    at /usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:668:7\nFrom: Task: WebDriver.call(function)\n    at Driver.call (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/webdriver.js:901:23)\n    at Driver.findElementsInternal_ (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/webdriver.js:1068:17)\n    at Driver.findElements (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/webdriver.js:1043:19)\n    at Object.findElementsOverride (/usr/local/lib/node_modules/protractor/built/locators.js:177:31)\n    at ptor.waitForAngular.then (/usr/local/lib/node_modules/protractor/built/element.js:156:40)\n    at ManagedPromise.invokeCallback_ (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:1376:14)\n    at TaskQueue.execute_ (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:3084:14)\n    at TaskQueue.executeNext_ (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:3067:27)\n    at asyncRun (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:2927:27)\n    at /usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:668:7Error\n    at ElementArrayFinder.applyAction_ (/usr/local/lib/node_modules/protractor/built/element.js:459:27)\n    at ElementArrayFinder.(anonymous function).args [as clear] (/usr/local/lib/node_modules/protractor/built/element.js:91:29)\n    at ElementFinder.(anonymous function).args [as clear] (/usr/local/lib/node_modules/protractor/built/element.js:831:22)\n    at LoginPage.enterEmail (/home/vivek/protractor-qa-template/src/page-objects/login_page.js:26:27)\n    at LoginPage.login (/home/vivek/protractor-qa-template/src/page-objects/login_page.js:41:14)\n    at UserContext.it (/home/vivek/protractor-qa-template/src/specs/login.spec.js:49:34)\n    at /usr/local/lib/node_modules/protractor/node_modules/jasminewd2/index.js:112:25\n    at new ManagedPromise (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:1077:7)\n    at ControlFlow.promise (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:2505:12)\n    at schedulerExecute (/usr/local/lib/node_modules/protractor/node_modules/jasminewd2/index.js:95:18)\nFrom: Task: Run it(\"user should be able to login\") in control flow\n    at UserContext.<anonymous> (/usr/local/lib/node_modules/protractor/node_modules/jasminewd2/index.js:94:19)\n    at attempt (/usr/local/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4297:26)\n    at QueueRunner.run (/usr/local/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4217:20)\n    at runNext (/usr/local/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4257:20)\n    at /usr/local/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4264:13\n    at /usr/local/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4172:9\n    at Function.next.fail (/usr/local/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4274:9)\n    at /usr/local/lib/node_modules/protractor/node_modules/jasminewd2/index.js:64:48\n    at ControlFlow.emit (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/events.js:62:21)\n    at ControlFlow.shutdown_ (/usr/local/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:2674:10)\nFrom asynchronous test: \nError\n    at Suite.describe (/home/vivek/protractor-qa-template/src/specs/login.spec.js:47:5)\n    at addSpecsToSuite (/usr/local/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:1107:25)\n    at Env.describe (/usr/local/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:1074:7)\n    at describe (/usr/local/lib/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4399:18)\n    at Object.<anonymous> (/home/vivek/protractor-qa-template/src/specs/login.spec.js:7:1)\n    at Module._compile (module.js:652:30)\n    at Object.Module._extensions..js (module.js:663:10)\n    at Module.load (module.js:565:32)\n    at tryModuleLoad (module.js:505:12)"
        ],
        "browserLogs": [],
        "screenShotFile": "images/00a400d2-0042-00c7-008e-00be00190047.png",
        "timestamp": 1575254982263,
        "duration": 21
    }
];

    this.sortSpecs = function () {
        this.results = results.sort(function sortFunction(a, b) {
    if (a.sessionId < b.sessionId) return -1;else if (a.sessionId > b.sessionId) return 1;

    if (a.timestamp < b.timestamp) return -1;else if (a.timestamp > b.timestamp) return 1;

    return 0;
});
    };

    this.loadResultsViaAjax = function () {

        $http({
            url: './combined.json',
            method: 'GET'
        }).then(function (response) {
                var data = null;
                if (response && response.data) {
                    if (typeof response.data === 'object') {
                        data = response.data;
                    } else if (response.data[0] === '"') { //detect super escaped file (from circular json)
                        data = CircularJSON.parse(response.data); //the file is escaped in a weird way (with circular json)
                    }
                    else
                    {
                        data = JSON.parse(response.data);
                    }
                }
                if (data) {
                    results = data;
                    that.sortSpecs();
                }
            },
            function (error) {
                console.error(error);
            });
    };


    if (clientDefaults.useAjax) {
        this.loadResultsViaAjax();
    } else {
        this.sortSpecs();
    }


});

app.filter('bySearchSettings', function () {
    return function (items, searchSettings) {
        var filtered = [];
        if (!items) {
            return filtered; // to avoid crashing in where results might be empty
        }
        var prevItem = null;

        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            item.displaySpecName = false;

            var isHit = false; //is set to true if any of the search criteria matched
            countLogMessages(item); // modifies item contents

            var hasLog = searchSettings.withLog && item.browserLogs && item.browserLogs.length > 0;
            if (searchSettings.description === '' ||
                (item.description && item.description.toLowerCase().indexOf(searchSettings.description.toLowerCase()) > -1)) {

                if (searchSettings.passed && item.passed || hasLog) {
                    isHit = true;
                } else if (searchSettings.failed && !item.passed && !item.pending || hasLog) {
                    isHit = true;
                } else if (searchSettings.pending && item.pending || hasLog) {
                    isHit = true;
                }
            }
            if (isHit) {
                checkIfShouldDisplaySpecName(prevItem, item);

                filtered.push(item);
                prevItem = item;
            }
        }

        return filtered;
    };
});

