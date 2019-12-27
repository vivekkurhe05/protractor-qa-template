'use strict'

var Browser = function(){

    this.goBack = function(){
        browser.navigate().back();
    }

    this.goForward = function(){
        browser.driver.navigate().forward();
    }

    this.refresh = function(){
        browser.navigate().refresh();
    }
    
    this.closeBrowser = function(){
        browser.driver.close();
    }

    this.switchNewTab = function(){
        browser.getAllWindowHandles().then(function(handles){
            browser.switchTo().window(handles[1]).then(function(){
                return handles[1];
            });
        });
    }

    this.IsFieldFocused = function(attr){
        return browser.driver
        .switchTo().activeElement()
        .getAttribute(attr).then(function(prop){
            return prop;
        });
    }
};

module.exports = new Browser();