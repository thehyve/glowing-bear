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
          queriesResponce.body["exportJobs"].map(x => x["id"]).forEach(x => {
            cy.request({
              'url': Cypress.env('apiUrl') + '/v2/export/' + x,
              'method': 'DELETE',
              'auth': {'bearer': token}
            });
          })
        });

      })
  });
});

when('I select all data', () => {
  cy.get('.gb-data-selection-accordion-sub-header-2').eq(1).click();
  cy.contains('Check all').click();
  cy.get('.gb-data-selection-accordion-sub-header-2').eq(1).contains('Update').click();
})

when('I export this data with the name {string}', (jobName) => {
  cy.get('.gb-nav').contains('Export').click();
  cy.get('#exportJobNameInput').type(jobName);
  cy.contains('Create export').click();
});

then('then the job {string} has status {string}', (jobName, status) => {
  cy.get('.ui-datatable-even').contains(jobName, {timeout: 2000000}).parent().parent().get('td').eq(1).contains(status);
});
