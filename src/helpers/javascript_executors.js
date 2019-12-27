'use strict'

var JavascriptExecutors = function(){

    this.scrollToView = function(elem){
        browser
        .executeScript(
            "arguments[0].scrollIntoView(true);", 
            elem);
    }
    
    this.scrollByPixel = function(width, height){
        browser
        .executeScript(
            "window.scrollBy("+width+","+height+");");
    }

    this.scrollTillBottom = function(){
        browser
        .executeScript("window.scrollBy(0, document.body.scrollHeight)");
    }

    this.enterValue = function(id_name, value){
        browser
        .executeScript(
            "document.getElementById('"+ id_name +"').value = '"+ value +"'");
    }

    this.refreshPage = function(){
        browser
        .executeScript("history.go(0)");
    }

    this.getTitle = async function(){
        return await browser
        .executeScript("return document.title");
    }

    this.navigateBack = function(){
        browser
        .executeScript("window.history.back()");
    }

    this.navigateForward = function(){
        browser
        .executeScript("window.history.forward()");
    }
};

module.exports = new JavascriptExecutors();