given("Query {string} is saved", (queryName) => {
  cy.server();
  cy.fixture('admin').as("user");
  cy.get('@user').then((userData) => {
    cy.request('POST', Cypress.env('apiUrl') + '/oauth/token?grant_type=password&client_id=glowingbear-js&client_secret=&username=' + userData.username + '&password=' + userData.password)
      .then((authResponce) => {

        // get query list
        cy.request({
          'url': Cypress.env('apiUrl') + '/v2/queries',
          'method': 'GET',
          'auth': {'bearer': authResponce.body['access_token']}
        }).then((queriesResponce) => {
          queriesResponce.body["queries"].map(x => x["id"]).forEach(x => {
            cy.request({
              'url': Cypress.env('apiUrl') + '/v2/queries/' + x,
              'method': 'DELETE',
              'auth': {'bearer': authResponce.body['access_token']}
            })
          })
        });

        // save
        cy.request(
          {
            'url': Cypress.env('apiUrl') + '/v2/queries',
            'method': 'POST',
            'auth': {'bearer': authResponce.body['access_token']},
            'body': {
              "name": queryName,
              "patientsQuery": {
                "type": "subselection",
                "dimension": "patient",
                "constraint": {
                  "type": "concept",
                  "conceptCode": "VSIGN:HR",
                  "name": "Heart Rate",
                  "fullName": "\\Vital Signs\\Heart Rate\\",
                  "conceptPath": "\\Vital Signs\\Heart Rate\\",
                  "valueType": "NUMERIC"
                }
              },
              "observationsQuery": {
                "data": []
              },
              "bookmarked": false
            }
          })
      })
  });
});

given("there are no queries saved", () => {
  cy.server();
  cy.fixture('admin').as("user");
  cy.get('@user').then((userData) => {
    cy.request('POST', Cypress.env('apiUrl') + '/oauth/token?grant_type=password&client_id=glowingbear-js&client_secret=&username=' + userData.username + '&password=' + userData.password)
      .then((authResponce) => {

        // get query list
        cy.request({
          'url': Cypress.env('apiUrl') + '/v2/queries',
          'method': 'GET',
          'auth': {'bearer': authResponce.body['access_token']}
        }).then((queriesResponce) => {
          queriesResponce.body["queries"].map(x => x["id"]).forEach(x => {
            cy.request({
              'url': Cypress.env('apiUrl') + '/v2/queries/' + x,
              'method': 'DELETE',
              'auth': {'bearer': authResponce.body['access_token']}
            })
          })
        });
      })
  });
});

when("I restore the query {string}", (queryName) => {
  cy.contains(queryName).parent().find('button[icon=fa-arrow-right]').click();
});

when("I delete the query {string}", (queryName) => {
  cy.contains(queryName).parent().find('button[icon=fa-times]').click();
  cy.contains('Yes').click();
});

when('I save the Query with name {string}', (queryName) => {
  cy.get('#queryName').type(queryName);
  cy.contains('Save query').click();
});

then('the query {string} is saved', (queryName) => {
  cy.get('.ng-trigger-tabContent').eq(2).contains(queryName);
});

then('the query {string} is deleted', (queryName) => {
  cy.get('.ng-trigger-tabContent').eq(2).contains(queryName).should('not.be.visible');
});
