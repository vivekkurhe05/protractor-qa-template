'use strict'

var Waits = function(){

    const EC = protractor.ExpectedConditions;

    this.waitForUrl = function(subUrl){
    browser.wait(EC.urlContains(subUrl), 30000, 'Url taking too long to load');
    }

    this.waitForElementVisibility = function(elem){
        browser.wait(EC.visibilityOf(elem), 30000, 
        'Element taking too long to appear in the DOM');
    }

    this.waitForAllElements = function(elem){
        browser.wait(function(){
            return elem
            .count().then(function(count){
               return count != 0;
            });
         },30000);
    }

    this.waitForElementToChangeValue = function(elem){
        browser.wait(EC.not(
            EC.textToBePresentInElement(elem, '-0'), 
            5000));
    }

    this.waitForPresenceOfElement = function(elem){
        browser.wait(EC.presenceOf(elem), 30000, 
        'Element taking too long to appear in the DOM');
    }

    this.waitForElementDisappear = function(elem){
        browser.wait(EC.stalenessOf(elem), 30000,
        'Element taking too long to disappear from the DOM');
    }
};

module.exports = new Waits();