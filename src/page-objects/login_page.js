'use strict'

require('./home_page')
let genericClass = require('../helpers/generic');
let wait = require('../helpers/waits');

var LoginPage = function(){

    this.loginPageTitle = element(by.model("TODO"));
    this.emailTextBox = element(by.model("TODO"));
    this.passwordTextBox = element(by.model("TODO"));
    this.loginBtn = element(by.model("TODO"));
    this.errorText = element(by.binding("TODO"));

    this.get = function(payload) {
        browser.get(payload)
    }

    this.getTitle = async function(elem) {
        wait.waitForElementVisibility(elem);
        return await elem.getText();
    }

    this.enterEmail = function(email){

        this.emailTextBox.clear();
        this.emailTextBox.sendKeys(email);
    }

    this.enterPassword = function(password){
        this.passwordTextBox.clear();
        this.passwordTextBox.sendKeys(password);
    }

    this.actualText = async function(elem){
        wait.waitForElementVisibility(elem);
        return await this.errorText.getText();
    }

    this.login = function(emailId, password){
        this.enterEmail(emailId);
        this.enterPassword(password);
        genericClass.click(this.loginBtn);
        return require('./home_page');
    }

};

module.exports = new LoginPage();