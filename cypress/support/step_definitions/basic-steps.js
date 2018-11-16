given("I am on the login page", () => {
  cy.visit('');
});

given("I am logged in as {string}", (user) => {
  cy.visit('');
  cy.fixture(user).as("user");
  cy.get('@user').then((userData) => {
    if(Cypress.env('authentication-service-type') == 'oidc'){
      cy.keycloakLogin(userData.username, userData.password);
    } else {
      cy.transmartLogin(userData.username, userData.password, userData.valid);
    }
  });
  cy.url().should('eq', Cypress.config('baseUrl') + '/cohort-selection');
  cy.contains("Inclusion criteria").should('be.visible');
  cy.contains("Exclusion criteria").should('be.visible');
});

given("I am on the cohort-selection tab", () => {
  cy.server();
  cy.route('POST', '**/v2/observations/counts_per_study').as('getCounts');
  cy.visit('/cohort-selection');
  cy.fixture('admin').as("user");
  cy.get('@user').then((userData) => {
      if(Cypress.env('authentication-service-type') == 'oidc'){
        cy.keycloakLogin(userData.username, userData.password);
      } else {
        cy.transmartLogin(userData.username, userData.password, userData.valid);
      }
  });
  cy.url().should('eq', Cypress.config('baseUrl') + '/cohort-selection');
  cy.get('input[placeholder="add criterion"]').eq(0).should('be.visible');

  cy.wait('@getCounts', {timeout: 10000});
});

