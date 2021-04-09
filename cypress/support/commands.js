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

import 'cypress-file-upload';

Cypress.Commands.add('toggleNode', (nodeName, options = {}) => {
  const node = cy.get('.ui-treenode').contains(nodeName).parent().parent();
  node.scrollIntoView().should('be.visible');
  node.children('.ui-tree-toggler').click('right');
});

Cypress.Commands.add('toggleVariableNode', (nodeName, options = {}) => {
  const node = cy.get('.gb-variables-tree-container').contains(nodeName).parent().parent();
  node.scrollIntoView().should('be.visible');
  node.children('.ui-tree-toggler').click('right');
});

Cypress.Commands.add('toggleVisibleNode', (nodeName, options = {}) => {
  cy.get('.ui-treenode :visible').contains(nodeName)
    .parent().parent().children('.ui-tree-toggler').click();
});

Cypress.Commands.add('drag', (nodeName, dragZoneSelector, options = {}) => {
  const dataTransfer = new DataTransfer();
  if (dragZoneSelector) {
    cy.get(dragZoneSelector).contains(nodeName)
      .trigger('dragstart', { dataTransfer, force: true });
  } else {
    cy.contains(nodeName)
      .trigger('dragstart', { dataTransfer, force: true });
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

Cypress.Commands.add('keycloakLogin', (username, password) => {
  cy.logout();
  cy.reload();

  cy.get('#username').type(username);
  cy.get('#password').type(password);
  cy.get('#kc-login').click();
});

Cypress.Commands.add('getToken', (username, password) => {
  return cy.request({
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
});

Cypress.Commands.add('logout', () => {
  const target = Cypress.env('oidc-server-url') + '/logout';
  cy.request(target);
});

Cypress.Commands.add('login', () => {
  cy.logout();
  cy.get('@user').then((userData) => {
    cy.keycloakLogin(userData.username, userData.password);
  });
});

Cypress.Commands.add('uploadFile', (fileName, selector) => {
  cy.fixture(fileName, 'binary')
    .then(content => {
      const extension = fileName.split('.').pop();
      const fileContent = extension === 'json' ? JSON.stringify(content) : content;
      cy.get(selector).upload({
        fileContent,
        fileName: fileName,
        mimeType: extension === 'json' ? 'application/json' : (extension === 'txt' ? 'text/plain' : 'example')
      });
    });
});
