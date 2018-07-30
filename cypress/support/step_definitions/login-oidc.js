when("I login with user {string} using oidc", (user) => {
  cy.fixture(user).as("user");
    cy.get('@user').then((userData) => {
      cy.keycloakLogin(userData.username, userData.password);
  });
});

then("I am logged in using oidc", () => {
  cy.url().should('eq', Cypress.config('baseUrl') + '/data-selection');
  cy.contains("Step 1").should('be.visible');
});

then("I am not logged in using oidc", () => {
    cy.get('div').should('have.class', 'alert alert-error');
    cy.get('span').should('have.text', 'Invalid username or password.');
});

when("I log out", () => {
    cy.get('.gb-top-panel').find('button[id=logout]').click();
});

then("I am redirected to the login page", () => {
    cy.url().should('eq', Cypress.env('oidc-server-url') + '/auth?response_type=code&client_id='
    + Cypress.env('oidc-client-id') + '&client_secret=&redirect_uri=' + Cypress.config('baseUrl'));
});


