# Visual Regression Testing in Design Systems

We spend a lot of time internally and externally, with our clients talking about the value of having fast and frequent feedback loops during our development process. Typically, our projects use continuous integration tools coupled with code quality and code testing suites.

For teams working on or maintaining design systems, testing should be at the core of their development workflow. Along with code testing, design system teams may also find a lot of value in visual regression testing user interfaces to be sure that the system is maintaining its consistency and integrity.

# What is Visual Regression Testing?

In software engineering, regression testing is the act of repeatedly testing an already tested program for defects—or regressions—due to modifications.

Visual regression testing expands on this idea by testing for and discovering visual defects due to modifications to the software. These changes can be obvious or subtle.

In practice, visual regression testing can be as simple as capturing a collection of screenshots from a user interface and comparing that collection against a baseline of original or reference images that serve as the “source of truth.” Detected differences are highlighted and can serve as an alert that a potential regression may have occurred, or an unintended change may have crept into an interface. We often use a testing pyramid to explain the various types of tests and their expected roles and outcomes. We can use the testing pyramid visual for design system testing as well!

![This Design System Testing Pyramid was introduced in Adam’s article on automated testing in design systems.](img/pyramid.png)

The top level of our pyramid encompasses visual regression tests, which have high value for a design system. Visual regression tests complement your unit and integration tests to validate that not only are your components functioning correctly, but they’re also free of visual defects or regressions.

# Applitools integration with Protractor

The Applitools Eyes Selenium JavaScript SDK allows you to easily add visual checkpoints to your JavaScript Selenium tests. It takes care of getting screenshots of your application from the underlying WebDriver, sending them to the Eyes server for validation and failing the test in case differences are found.

# Install the SDK

``` bash
npm install eyes.selenium --save-dev
```

# Run your first test

Applitools Eyes reports differences by comparing screenshots of your application with baseline images that define the expected appearance of the application at each step of the test. By default, the Eyes SDK detects the environment in which the application is running (namely, the operating system, the type of browser and its viewport size) and compares the screenshots against baseline images that are specific to that environment. The first time you run a test in a given environment, its screenshots will be automatically saved as its baseline. Starting from the second run onward, you always have a baseline to compare against.

The test below is a simple program that visually validates the Hello World web-page at https://applitools.com/helloworld. It consists of two visual checkpoints, each validating the entire application window. The first time you run this test a new baseline will be created, and subsequent test runs will be compared to this baseline. If any screenshot mismatch its baseline image in a perceptible way, $eyes.close() will throw a DiffsFoundException which includes a URL that points to a detailed report where you can see the detected differences and take appropriate actions such as reporting bugs, updating the baseline and more.

Before running the test, make sure to set the API key that identifies your account in the environment variable APPLITOOLS_API_KEY or directly assign it to the eyes.setApiKey() method. You can find your API key under the user menu located at the right hand side of the test manager toolbar. If you don't yet have an account create it now https://applitools.com/users/register to obtain your key.

``` bash
// Initialize the eyes SDK and set your private API key.
var Eyes = require("eyes.protractor").Eyes;
var eyes = new Eyes();
eyes.setApiKey("YOUR_API_KEY");

describe("Hello World test!", function() {
    it("Run the test", function() {

        // Open a chrome browser.
        eyes.open(browser, "Hello World!", "My first Protractor Test!");

        // Navigate the browser to the "hello world!" web-site.
        browser.ignoreSynchronization = true
        browser.get("http://applitools.com/helloworld");

        // Visual checkpoint #1.
        eyes.checkWindow("Hello!");

        // Click the "Click me!" button.
        element(by.tagName("button")).click();

        // Visual checkpoint #2.
        eyes.checkWindow("Click!");

        // End the test.
        eyes.close();
    });
});
```

**Note:** This template has a visual_test.spec.js file, go to conf and specify this file name in specs in order to learn how visula testing takes place.



