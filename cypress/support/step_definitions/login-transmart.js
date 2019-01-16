when("I login with user {string} using transmart", (user) => {
  cy.fixture(user).as("user");
  cy.get('@user').then((userData) => {
    if (Cypress.env('authentication-service-type') == "oidc") {
      cy.keycloakLogin(userData.username, userData.password);
    } else {
      cy.transmartLogin(userData.username, userData.password.userData.valid);
    }
  });
});

then("I am logged in using transmart", () => {
  cy.url().should('eq', Cypress.config('baseUrl') + '/cohort-selection');
  cy.contains("Inclusion criteria").should('be.visible');
  cy.contains("Exclusion criteria").should('be.visible');
});

then("I am not logged in using transmart", () => {
  cy.url().should('eq', Cypress.env('apiUrl') + '/login/authPage?login_error=1');
});

