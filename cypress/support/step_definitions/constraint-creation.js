when("I use study {string} as a constraint", (studyName) => {
  cy.contains(studyName).trigger('dragstart');
  cy.get('input[placeholder="add criterion"]').eq(0).trigger('drop');
  cy.get('.gb-data-selection-update-btn').eq(0).click();
});

then("there are {string} patients and {string} observations", (patients, observations) => {
  cy.get('.gb-data-selection-emphasis-text').eq(0).should('contain', patients);
  cy.get('.gb-data-selection-emphasis-text').eq(2).should('contain', observations);
});

when("I select all female patients from survey1", () => {
  cy.get('.ui-tree-toggler').eq(2).click();
  cy.get('.ui-tree-toggler').eq(3).click();
  cy.get('.ui-tree-toggler').eq(4).click();
  cy.contains('Gender').trigger('dragstart');
  cy.get('input[placeholder="add criterion"]').eq(0).trigger('drop');
  cy.contains('Male').should('be.visible');
  cy.get('.fa-close').eq(4).click();
  cy.get('.fa-close').eq(4).click();
  cy.get('.gb-data-selection-update-btn').eq(0).click();
});

when("I select study Oracle_1000_Patient but exclude from categorical_10, Stomach, Lung, Head, Liver", () => {
  cy.get('.ui-tree-toggler').eq(1).click();
  cy.contains('Oracle_1000_Patient ').trigger('dragstart');
  cy.get('input[placeholder="add criterion"]').eq(0).trigger('drop');
  cy.get('.ui-tree-toggler').eq(8).click();
  cy.get('.ui-tree-toggler').eq(9).click();

  cy.contains('categorical_10 ').trigger('dragstart');
  cy.get('input[placeholder="add criterion"]').eq(1).trigger('drop');
  cy.contains('Stomach').should('be.visible');
  cy.get('.fa-close').eq(8).click();
  cy.get('.fa-close').eq(8).click();
  cy.get('.fa-close').eq(8).click();
  cy.get('.fa-close').eq(8).click();
  cy.get('.fa-close').eq(8).click();
  cy.get('.gb-data-selection-update-btn').eq(0).click();
});

when("I select patients that are part of study CATEGORICAL_VALUES or CLINICAL_TRIAL or EHR", () => {
  cy.get('.ui-tree-toggler').eq(1).click();
  cy.contains('CATEGORICAL_VALUES ').trigger('dragstart');
  cy.get('input[placeholder="add criterion"]').eq(0).trigger('drop');
  cy.contains('CLINICAL_TRIAL ').trigger('dragstart');
  cy.get('input[placeholder="add criterion"]').eq(0).trigger('drop');
  cy.contains('and').click();
  cy.contains('or').should('be.visible');
  cy.contains('EHR ').trigger('dragstart');
  cy.get('input[placeholder="add criterion"]').eq(0).trigger('drop');
  cy.get('.gb-data-selection-update-btn').eq(0).click();
});

when("I select patients that are part of study Oracle_1000_Patient with age between 50 - 55  and numerical_1 between 0 - 10", () => {
  cy.get('.ui-tree-toggler').eq(1).click();
  cy.get('.ui-tree-toggler').eq(8).click();
  cy.get('.ui-tree-toggler').eq(11).click();
  cy.get('.ui-tree-toggler').eq(10).click();
  cy.contains('Age ').trigger('dragstart');
  cy.get('input[placeholder="add criterion"]').eq(0).trigger('drop');
  cy.get('input[placeholder="min:50"]').type('50');
  cy.get('input[placeholder="max:65"]').type('55');
  cy.contains('numerical_1 ').trigger('dragstart');
  cy.get('input[placeholder="add criterion"]').eq(1).trigger('drop');
  cy.get('input[placeholder="min:-5.76679"]').type('0');
  cy.get('input[placeholder="max:29.79301"]').type('10');
  cy.get('.gb-data-selection-update-btn').eq(0).click();
});
