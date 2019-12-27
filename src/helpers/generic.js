'use strict'

var GenericClass = function(){
    
    this.verifyErrorOnBlankField = async function(elem, value){
        return await elem.getAttribute(value);
    }

    this.verifyThePresenceOfComponents = async function(elem){
        return await elem.isDisplayed();
    }

    this.click = function(elem){
        elem.click();
    }
}

module.exports = new GenericClass();