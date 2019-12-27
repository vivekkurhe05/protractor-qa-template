'use strict'

let loginPage = require('../page-objects/login_page.js');
let genericClass = require('../helpers/generic');
let using = require('jasmine-data-provider');
let eyes_login = require('../helpers/applitools_eyes');

describe('Login sanity tests', () => {

    let params;
    
    beforeEach( () => {
        loginPage.get('/login');
        params = browser.params;
        eyes_login.initiateEyes();
    });

    let spec1 = it('Verify the elements on login page', () => {
        expect(loginPage.getTitle(loginPage.loginPageTitle)).toEqual('TODO');
        expect(genericClass.verifyThePresenceOfComponents(loginPage.emailTextBox)).toBeTruthy();
        expect(genericClass.verifyThePresenceOfComponents(loginPage.passwordTextBox)).toBeTruthy();
        expect(genericClass.verifyThePresenceOfComponents(loginPage.loginBtn)).toBeTruthy();
        eyes_login.validateWindow(spec1.description);
    });

    function arrayOfData(){

        return [
            {
                "email":"invalid emailid",
                "password":"invalid password"
            },
            {
                "email": "valid emailid",
                "password": "invalid password"
            },
            {
                "email": "invalid emailid",
                "password": "valid password"
            }
            
        ]
    }

    using(arrayOfData, function(testData){
        it('invalid login attempts', () => {
            loginPage.login(testData.email, testData.password);
            expect(loginPage.actualText(loginPage.errorText)).toEqual('TODO');
            genericClass.click(loginPage.okButton);
        });
    });

    let spec2 = it('user should be able to login', () => {

        let homePage = loginPage.login(params.login.email, params.login.password);
        expect(homePage.verifyTitle()).toContain('TODO');
        eyes_login.validateWindow(spec2.description);
    });

    afterEach( () => {
        eyes_login.eyesClose();
    });
  
});