'use strict'

var wait = require('../helpers/waits');

var HomePage = function(){

    this.welcomeTitle = element(by.id("TODO"));
    
        this.get = function(payload) {
            browser.get(payload)
    }

    this.verifyTitle = async function() {
            wait.waitForElementVisibility(this.welcomeTitle);
            return await this.welcomeTitle.getText()
    }
};
    
 module.exports = new HomePage();