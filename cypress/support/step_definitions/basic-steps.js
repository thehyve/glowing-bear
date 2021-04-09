given("I am on the login page", () => {
  cy.visit('');
});

given("I am logged in as {string}", (user) => {
  cy.visit('');
  cy.fixture(user).as("user");
  cy.login();
  cy.url().should('eq', Cypress.config('baseUrl') + '/cohort-selection');
  cy.contains("Summary:").should('be.visible');
});

given("I am on the cohort-selection tab", () => {
  cy.server();
  cy.route('POST', '**/v2/observations/counts_per_study').as('getCounts');
  cy.visit('/cohort-selection');
  cy.fixture('admin').as("user");
  cy.login();
  cy.url().should('eq', Cypress.config('baseUrl') + '/cohort-selection');
  cy.get('input[placeholder="add criterion"]').eq(0).should('be.visible');
  cy.wait('@getCounts');
});

given("I am on the Analysis tab", () => {
  cy.server();
  cy.visit('/analysis');
  cy.fixture('admin').as("user");
  cy.login();
  cy.url().should('eq', Cypress.config('baseUrl') + '/analysis');
  cy.get('.section-banner').first().contains('New chart');
  cy.get('.section-banner').last().contains('Charts');
  cy.get('.fractalis-control-container').contains('crosstable');
});

given("I am on the export tab", () => {
  cy.server();
  cy.visit('/export');
  cy.fixture('admin').as("user");
  cy.login();
  cy.url().should('eq', Cypress.config('baseUrl') + '/export');
  cy.get('.section-banner').first().contains('New export');
  cy.get('.section-banner').last().contains('Recent exports');
});

then('I should see the message containing {string}', (msg) => {
  cy.get('.ui-toast.ui-widget').contains(msg);
});
