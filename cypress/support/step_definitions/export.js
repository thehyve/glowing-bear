given("there are no export jobs pending", () => {
  cy.server();

  //login
  cy.fixture('admin').as("user");
  cy.get('@user').then((userData) => {
    cy.getToken(userData.username, userData.password)
      .then((token) => {
        // get job list
        cy.request({
          'url': Cypress.env('apiUrl') + '/v2/export/jobs',
          'method': 'GET',
          'auth': {'bearer': token}
        }).then((queriesResponce) => {
          queriesResponce.body["exportJobs"].map(x => x["id"]).forEach(id => {
            cy.request({
              'url': Cypress.env('apiUrl') + '/v2/export/' + id,
              'method': 'DELETE',
              'auth': {'bearer': token}
            });
          });
        });
      });
  });
});

when('I select all data in Tree View', () => {
  cy.get('.gb-nav').contains('Export').click();
// all the variables should be selected by by default in Tree View
});

when('I select all data in Category View', () => {
  cy.get('.gb-nav').contains('Export').click();
  cy.get('.ui-button.ui-widget.ui-state-default.ui-button-text-only').last().click();
  // all the variables should be selected by by default in Category View
});

when('I select no data in Category View', () => {
  cy.get('.gb-nav').contains('Export').click();
  cy.get('.ui-button.ui-widget.ui-state-default.ui-button-text-only').last().click();
  cy.get('.checkAllText').find(".ui-chkbox-box").click()
});

when('I export this data with the name {string}', (jobName) => {
  cy.get('#exportJobNameInput').type(jobName);
  cy.contains('Create export').click();
});

then('the job {string} has status {string}', (jobName, status) => {
  cy.get('tr.ui-datatable-even').should('contain', jobName).and('contain', status);
});

then('issue warning when no data is selected', () => {
  cy.get('.alert.alert-warning').contains('No data selected').should('exist');
});
