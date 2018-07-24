// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This is will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

Cypress.Commands.add('toggleNode', (nodeName, options = {}) => {
  cy.contains(nodeName).parent().parent().children('.ui-tree-toggler').should('be.visible');
  cy.contains(nodeName).parent().parent().children('.ui-tree-toggler').click();
});

Cypress.Commands.add('drag', (nodeName, options = {}) => {
  cy.contains(nodeName).trigger('dragstart');
});

Cypress.Commands.add('drop', (inputNum, options = {}) => {
  cy.get('input[placeholder="add criterion"]').eq(inputNum).trigger('drop');
});

Cypress.Commands.add('removeChip', (chipName, options = {}) => {
  cy.get('li').contains(chipName).click();
});


Cypress.Commands.add('transmartLogin', (username, password, valid) => {
    cy.get('#j_username').type(username);
    cy.get('#j_password').type(password);
    cy.get('#loginButton').click();
    if (valid) {
        cy.get('input[name=authorize]').click();
    }
});

Cypress.Commands.add('keycloakLogin', (username, password) => {
    cy.url().should('eq', Cypress.env('oidc-server-url') + '/auth?response_type=code&client_id='
        + Cypress.env('oidc-client-id') + '&client_secret=&redirect_uri=' + Cypress.config('baseUrl'))
    submitLoginForm();

    function submitLoginForm() {
        cy.get('#username').type(username);
        cy.get('#password').type(password);
        cy.get('#kc-login').click();
    }
});

Cypress.Commands.add('getToken', (username, password) => {
    if(Cypress.env('authentication-service-type') == 'oidc') {
        return getTokenFromKeycloak();
    } else {
        return getTokenFromTransmart();
    }

    function getTokenFromKeycloak() {
        cy.request({
            method: 'POST',
            url: Cypress.env('oidc-server-url') + '/token',
            form: true, // indicates the body should be form urlencoded and sets Content-Type: application/x-www-form-urlencoded headers
            body: {
                client_id: Cypress.env('oidc-client-id'),
                grant_type: 'password',
                username: username,
                password: password
            }
        }).then((authResponce) => {
            return authResponce.body['access_token'];
        });
    }

    function getTokenFromTransmart() {
        cy.request('POST', Cypress.env('apiUrl') + '/oauth/token?grant_type=password&client_id=glowingbear-js'
            + '&client_secret=&username=' + username + '&password=' + password).then((authResponce) => {
            return authResponce.body['access_token'];
        });
    }
});

