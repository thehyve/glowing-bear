when('I login with user {string}', (user) => {
  cy.fixture(user).as('user');
  cy.get('@user').then((userData) => {
    cy.keycloakLogin(userData.username, userData.password);
  });
});

then('I am logged in', () => {
  cy.url().should('eq', Cypress.config('baseUrl') + '/cohort-selection');
  cy.contains('Summary:').should('be.visible');
});

then('I am not logged in', () => {
  cy.get('.kc-feedback-text').should('contain', 'Invalid username or password.');
});

when('I log out', () => {
  cy.get('.fa-sign-out').click();
});

then('I am redirected to the login page', () => {
  cy.url().should('eq', Cypress.env('oidc-server-url') + '/auth?response_type=code&client_id='
    + Cypress.env('oidc-client-id') + '&client_secret=&redirect_uri=' + Cypress.config('baseUrl'));
});
