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
  cy.get('.ui-treenode :visible').contains(nodeName)
    .parent().parent().children('.ui-tree-toggler').click();
});

Cypress.Commands.add('drag', (nodeName, dragZoneSelector, options = {}) => {
  const dataTransfer = new DataTransfer();
  if (dragZoneSelector) {
    cy.get(dragZoneSelector).contains(nodeName).trigger('dragstart', { dataTransfer });
  } else {
    cy.contains(nodeName).trigger('dragstart', { dataTransfer });
  }
});

Cypress.Commands.add('drop', (inputNum, dropZoneSelector, options = {}) => {
  const dataTransfer = new DataTransfer();
  if (dropZoneSelector) {
    cy.get(dropZoneSelector).eq(inputNum).trigger('drop', { dataTransfer });
  } else {
    // default drop zone
    cy.get('input[placeholder="add criterion"]').eq(inputNum).trigger('drop', { dataTransfer });
  }
});

Cypress.Commands.add('removeChip', (chipName, options = {}) => {
  cy.get('li.ui-multiselect-item').contains(chipName).click();
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
  const authUrl =
    Cypress.env('oidc-server-url') +
    '/auth?response_type=code&client_id=' +
    Cypress.env('oidc-client-id') +
    '&client_secret=&redirect_uri=' +
    Cypress.config('baseUrl');
  cy.url().should('equal', authUrl);

  cy.get('#username').type(username);
  cy.get('#password').type(password);
  cy.get('#kc-login').click();

});

Cypress.Commands.add('getToken', (username, password) => {
  if (Cypress.env('authentication-service-type') == 'oidc') {
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

Cypress.Commands.add('logout', () => {
  let target = '';
  if (Cypress.env('authentication-service-type') == 'oidc') {
    target = Cypress.env('oidc-server-url') + '/logout';
  } else {
    target = Cypress.env('apiUrl') + '/logout';
  }
  cy.request(target);
});

Cypress.Commands.add('login', () => {
  cy.logout();
  cy.get('@user').then((userData) => {
    if(Cypress.env('authentication-service-type') == 'oidc'){
      cy.keycloakLogin(userData.username, userData.password);
    } else {
      cy.transmartLogin(userData.username, userData.password, userData.valid);
    }
  });
});

// tip: https://github.com/cypress-io/cypress/issues/170#issuecomment-381111656
Cypress.Commands.add('uploadFile', (fileName, selector) => {
  cy.get(selector).then(subject => {
    cy.fixture(fileName).then((content) => {
      const extension = fileName.split('.').pop();
      const el = subject[0];
      const fileContent = extension === 'json' ? JSON.stringify(content) : content;
      const testFile = new File([fileContent], fileName);
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(testFile);
      el.files = dataTransfer.files;
    });
  });
});
