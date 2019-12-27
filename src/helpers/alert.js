'use strict'

var alert = function(){

    this.getAlert = function(){

        return browser.switchTo().alert();
    }

    this.acceptAlert = function(){
        this.getAlert().accept();
    }

    this.dismissAlert = function(){
        this.getAlert().dismiss();
    }

    this.getAlertText = function(){

        var text = this.getAlert().getText();
        return text;
    }
};