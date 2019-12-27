# How to speed up your tests in protractor?

When you want to run protractor scripts by opening a browser instance for each test, you should add two capabilities shardTestFiles and maxInstances in the Capabilities block of the conf.js file. This will help to execute your scripts on same browser with multiple instances. If you want to execute on multiple browser, we have to use multipleCapabilities which we discussed in detail.

<b>shardTestFiles</b> - To enable sharing of tests at the spec level, we must configure shardTestFiles flag as true within the capabilities.

<b>maxInstances</b> - The maxInstances number represents the maximum number of browser windows that Protractor should create in parallel. For example, If we set maxInstances to 2, a test suite of 20 tests would result in Protractor creating 2 Chrome instances with each instance running 10 tests.

NOTE : - This is only needed if shardTestFiles is set to true. And by default maxInstances value is set to 1.