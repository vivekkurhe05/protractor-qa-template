# Executing Protractor tests on headless chrome browser:

Headless browser is similar to normal browser and the only difference is that it does not have a GUI (Graphical User Interface) that means, you cannot see browser on the screen on which the automation script is running as it runs the script in the background. Other than that, the headless browser behaves the same as the traditional browsers like (Chrome, Firefox, MS-edge etc)

# Why we need a headless browser?

In the headless browser, running the automation script is very useful in terms of saving time during regression testing, mainly when the automation script is running in a cloud/server environment. and there is no need for UI(user interface). It also helps us when we are busy with the browser for debugging the script. We can run the script in the background along with other modules of our Project.

Also, running the script is faster in the headless browser as compare to regular browsers.

# Using headless Chrome:

If we want to start Chrome in Headless mode then we can use –headless flag.

As in Chrome version 58, you need to set –disable-gpu, though this may change in future versions. Also, changing the window size during a test will not work in headless mode, but you can set it on the command line like this –window-size=800,600.

``` bash
capabilities: [
{
‘browserName’: ‘ chrome’,
chromeOptions : {
‘args’ : [“–headless”,‘–disable-gpu’, ‘–window-size=1400,1400’]
}
}
],
```

# Using headless Firefox:

If we want to start Firefox in headless mode then we have to start Firefox with the –headless flag.

``` bash
multiCapabilities: [
{
‘browserName’: ‘ chrome’,
chromeOptions : {
‘args’ : [“–headless”,‘–disable-gpu’, ‘–window-size=1400,1400’]
}
},
{
‘browserName’: ‘ firefox’,
‘args’ : [‘–headless’]
},
],
```


