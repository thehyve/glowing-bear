when('I login with user {string}', (user) => {
  cy.fixture(user).as('user');
  cy.get('@user').then((userData) => {
    if (Cypress.env('authentication-service-type') == "oidc") {
      cy.keycloakLogin(userData.username, userData.password);
    } else {
      cy.transmartLogin(userData.username, userData.password, userData.valid);
    }
  });
});

then('I am logged in', () => {
  cy.url().should('eq', Cypress.config('baseUrl') + '/cohort-selection');
  cy.contains('Summary:').should('be.visible');
});

then('I am not logged in', () => {
  if (Cypress.env('authentication-service-type') == "oidc") {
    cy.get('div').should('have.class', 'alert alert-error');
    cy.get('span').should('contain', 'Invalid username or password.');
  } else {
    cy.url().should('eq', Cypress.env('apiUrl') + '/login/authPage?login_error=1');
  }
});

when('I log out', () => {
  cy.get('.fa-sign-out').click();
});

then('I am redirected to the login page', () => {
  if (Cypress.env('authentication-service-type') == "oidc") {
    cy.url().should('eq', Cypress.env('oidc-server-url') + '/auth?response_type=code&client_id='
      + Cypress.env('oidc-client-id') + '&client_secret=&redirect_uri=' + Cypress.config('baseUrl'));
  } else {
    cy.url().should('eq', Cypress.env('apiUrl') + '/login/authPage?login_error=1');
  }
});
