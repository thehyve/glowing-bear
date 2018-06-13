given("there are no export jobs pending", () => {
  cy.server();

  //login
  cy.fixture('admin').as("user");
  cy.get('@user').then((userData) => {
    cy.request('POST', Cypress.config('redirectUrl') + 'oauth/token?grant_type=password&client_id=glowingbear-js&client_secret=&username=' + userData.username + '&password=' + userData.password)
      .then((authResponce) => {

        // get job list
        cy.request({
          'url': Cypress.config('redirectUrl') + 'v2/export/jobs',
          'method': 'GET',
          'auth': {'bearer': authResponce.body['access_token']}
        }).then((queriesResponce) => {
          queriesResponce.body["exportJobs"].map(x => x["id"]).forEach(x => {
            cy.request({
              'url': Cypress.config('redirectUrl') + 'v2/export/' + x,
              'method': 'DELETE',
              'auth': {'bearer': authResponce.body['access_token']}
            })
          })
        });

      })
  });
});

when('I select all data', () => {
  cy.get('.gb-data-selection-accordion-sub-header-2').eq(1).click();
  cy.contains('Check All').click();
  cy.get('.gb-data-selection-accordion-sub-header-2').eq(1).contains('Update').click();
})

when('I export this data with the name {string}', (jobName) => {
  cy.get('.ui-tabmenuitem').contains('Export').click();
  cy.get('#exportJobNameInput').type(jobName);
  cy.contains('Create Export').click();
});

then('then the job {string} has status {string}', (jobName, status) => {
  cy.get('.ui-datatable-even').contains(jobName, {timeout: 1000000}).parent().parent().get('td').eq(1).contains(status);
});
