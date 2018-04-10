given("I am on the login page", () => {
  cy.visit('');
});

when("I login with user {string}", (user) => {

  cy.fixture(user).as("user");
  cy.get('@user').then((userData) => {
    cy.get('#j_username').type(userData.username);
    cy.get('#j_password').type(userData.password);
    cy.get('#loginButton').click();
    if (userData.valid) {
      cy.get('input[name=authorize]').click();
    }
  });
});

then("I am logged in", () => {
  cy.url().should('eq', Cypress.config('baseUrl') + '/');
  cy.get('p-treenode').should(($p) => {
    expect($p).to.have.length(8)
  })
});

then("I am not logged in", () => {
  cy.url().should('eq', Cypress.config('redirectUrl') + 'login/authPage?login_error=1');
});

given("I am logged in as {string}", (user) => {
  cy.visit('');
  cy.fixture(user).as("user");
  cy.get('@user').then((userData) => {
    cy.get('#j_username').type(userData.username);
    cy.get('#j_password').type(userData.password);
    cy.get('#loginButton').click();
    if (userData.valid) {
      cy.get('input[name=authorize]').click();
    }
  });
  cy.url().should('eq', Cypress.config('baseUrl') + '/');
  cy.get('p-treenode').should(($p) => {
    expect($p).to.have.length(8)
  })
});
