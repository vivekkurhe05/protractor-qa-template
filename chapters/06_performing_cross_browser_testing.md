# Cross browser tests

Cross-browser testing is basically running the same set of test cases multiple times on different browsers. This type of repeated task is best suited for automation.

Cross-Browser Testing goal is to provide quality assurance for web application across multiple browsers. Here in, we will be looking into details about how it helps to do cross-browser test automation with different browsers.

![Cross browser test](img/cross_browser.png)

# Why Cross-Browser Testing:

As we know web-based applications are totally different from windows based applications. If we have a web application, so we need to make sure that it works consistently with the same behavior across all browsers. To make sure that our app or web works fine in all browsers, we can use automated cross-browser testing.

For example, some people prefer to open any application in chrome browser, while some users open in Firefox, IE and Edge. So we need to check that the web application will work as expected in all browsers.

# Reason For Cross-Browser Testing:

* Font size can appear differently from browser to browser.
* JavaScript behavior can be different on different web browsers.
* CSS, HTML may behave in a different manner.
* Some browser does not support HTML5 tags
* Page alignment and div size is different
* Image orientation is not proper.
* Browser incompatibility with OS.

In order to run protractor tests on multiple browsers, Protractor offers multi-capabilities configuration option. These options must be defined as an array of objects.

We can run protractor specs on different browsers by setting the browser name property of the capabilities in the conf.js file. We can execute on chrome browser by specifying “browserName” as ‘chrome’ or ‘firefox’ to execute on the Firefox browser or whichever browser we need as given below:-

# Capabilities in Protractor:

In Protractor conf file, all browser setup is written within the capabilities object. This object is pass directly to the Webdriver builder.

``` bash
capabilities:[
{
‘browserName’ :  ‘ chrome’ ,
}
],
```

# Handling multiple browsers:

Protractor has a new capability called “multiCapabilities”: which let our existing test run in parallel without needing to do any code change.

``` bash
multiCapabilities: [
{
‘browserName’: ‘ chrome’,
},
{
‘browserName’: ‘ firefox’,
},
],
```
We can also specify browser-specific options in the chrome Options/Firefox Options object.

**For example,** while invoking the chrome browser, there is info bar appears under address bar, with information “Chrome is being controlled by automated test software”. If you want to disable this bar, we can pass an argument to disable this information bar.

**This is how, we can do using ‘capabilities’:**

``` bash
capabilities:[
{
‘browserName’ :  ‘ chrome’ ,
chromeOptions : {
‘args’ : [‘disable-infobars’]
}
}
],
```

**This is how, we can do using multi-capabilities:**

``` bash
multiCapabilities: [
{
‘browserName’: ‘ chrome’,
chromeOptions : {
‘args’ : [‘disable-infobars’]
}
},
{
‘browserName’: ‘ firefox’,
‘moz: firefoxOptions’ : {
‘args’ : [‘–safe-mode’]
}
},
], 
```
