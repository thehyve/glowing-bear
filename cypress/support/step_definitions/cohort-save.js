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
  cy.get('gb-cohorts').contains(cohortName).parent().parent().parent().parent().find('.fa-arrow-right').click();
});

when("I delete the cohort {string}", (cohortName) => {
  cy.contains(cohortName).parent().parent().parent().parent().find('.fa-times').click();
  cy.contains('Yes').click();
});

when('I save the Cohort with name {string}', (cohortName) => {
  cy.get('#cohortName').type(cohortName);
  cy.contains('Save cohort').click();
});

when('I create a cohort with {string} dimension constraint', (dimension) => {
  cy.toggleNode('Public Studies ');
  cy.drag('CSR').drop(0);
  cy.drag('EHR').drop(0);
  cy.contains('i', 'and').click();
  cy.contains('i', 'or').should('be.visible');

  cy.get('.gb-constraint-cohort-type-dropdown').get('.ui-dropdown').click();
  cy.get('.ui-dropdown').contains(dimension).click();
  cy.get('.update-btn').eq(0).click();
});

then('the cohort {string} is saved', (cohortName) => {
  cy.get('.ng-trigger-tabContent').eq(1).contains(cohortName);
});

then('the cohort {string} is deleted', (cohortName) => {
  cy.get('.ng-trigger-tabContent').eq(1).contains(cohortName).should('not.be.visible');
});

then('the current cohort has biomaterial selected', () => {
  cy.get('.gb-constraint-cohort-type-dropdown').eq(0).contains('Biomaterial ID');
  cy.contains('CSR');
  cy.contains('EHR');
  cy.get('.gb-constraint-cohort-type-dropdown').should('have.length', 1);
});

when('I create a cohort with multiple dimensions constraint', () => {
  cy.toggleNode('Public Studies ');
  cy.toggleNode('CSR');
  cy.toggleNode('01. Patient information');
  cy.drag('02. Gender').drop(0);

  cy.get('label').contains('f (5), m (4)').click();
  cy.removeChip('m (4)');

  cy.get('.gb-constraint-cohort-type-dropdown').get('.ui-dropdown').eq(0).click();
  cy.get('.gb-constraint-cohort-type-dropdown').eq(0).contains('Biosource ID').click();

  cy.drag('CLINICAL_TRIAL ').drop(1);
  cy.get('.update-btn').eq(0).click();

})

then('the current cohort has multiple dimensions selected', () => {
  cy.get('.gb-constraint-cohort-type-dropdown').eq(0).contains('Biosource ID');
  cy.get('.gb-constraint-cohort-type-dropdown').eq(1).contains('patient');
  cy.get('.gb-constraint-cohort-type-dropdown').should('have.length', 2);
  cy.get('gb-combination-constraint').should('have.length', 2);
})
