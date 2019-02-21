given("Cohort {string} is saved", (cohortName) => {
  cy.server();
  cy.fixture('admin').as("user");
  cy.get('@user').then((userData) => {
    cy.getToken(userData.username, userData.password)
      .then((token) => {
        // get cohort list
        cy.request({
          'url': Cypress.env('gb-backend-url') + '/queries',
          'method': 'GET',
          'auth': {'bearer': token}
        }).then((queriesResponce) => {
          queriesResponce.body["queries"].map(x => x["id"]).forEach(id => {
            cy.request({
              'url': Cypress.env('gb-backend-url') + '/queries/' + id,
              'method': 'DELETE',
              'auth': {'bearer': token}
            })
          })
        });

        // save
        cy.request(
          {
            'url': Cypress.env('gb-backend-url') + '/queries',
            'method': 'POST',
            'auth': {'bearer': token},
            'body': {
              "subjectDimension": "patient",
              "name": cohortName,
              "queryConstraint": {
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
              "queryBlob": {
                "queryConstraintFull":
                  {
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
                  }
              },
              "bookmarked": false
            }
          });
      })
  });
});

given("there are no cohorts saved", () => {
  cy.server();
  cy.fixture('admin').as("user");
  cy.get('@user').then((userData) => {
    cy.getToken(userData.username, userData.password)
      .then((token) => {
        // get cohort list
        cy.request({
          'url': Cypress.env('gb-backend-url') + '/queries',
          'method': 'GET',
          'auth': {'bearer': token}
        }).then((queriesResponce) => {
          queriesResponce.body["queries"].map(x => x["id"]).forEach(x => {
            cy.request({
              'url': Cypress.env('gb-backend-url') + '/queries/' + x,
              'method': 'DELETE',
              'auth': {'bearer': token}
            });
          });
        });
      })
  });
});

when("I restore the cohort {string}", (cohortName) => {
  cy.contains(cohortName).parent().parent().parent().parent().find('.fa-arrow-right').click();
});

when("I delete the cohort {string}", (cohortName) => {
  cy.contains(cohortName).parent().parent().parent().parent().find('.fa-times').click();
  cy.contains('Yes').click();
});

when('I save the Cohort with name {string}', (cohortName) => {
  cy.get('#cohortName').type(cohortName);
  cy.contains('Save cohort').click();
});

then('the cohort {string} is saved', (cohortName) => {
  cy.get('.ng-trigger-tabContent').eq(1).contains(cohortName);
});

then('the cohort {string} is deleted', (cohortName) => {
  cy.get('.ng-trigger-tabContent').eq(1).contains(cohortName).should('not.be.visible');
});
