when("I use public study {string} as a constraint", (studyName) => {
  // cy.contains('Public Studies ').parent().parent().children('.ui-tree-toggler').click();

  cy.toggleNode('Public Studies ');
  cy.drag(studyName).drop(0);

  cy.get('.update-btn').eq(0).click();
});

then("there are {string} subjects", (subjects) => {
  cy.get('.subject-count-box').eq(2).should('contain', subjects);
});

when("I select all female patients from CATEGORICAL_VALUES", () => {
  cy.toggleNode('Public Studies ')
    .toggleNode('CATEGORICAL_VALUES ')
    .toggleNode('Demography ')
    .toggleNode('Gender ');
  cy.drag('Female ').drop(0);
  cy.get('.update-btn').eq(0).click();
});

when("I select study Oracle_1000_Patient but exclude from categorical_10, Stomach, Lung, Head, Liver", () => {
  cy.toggleNode('Public Studies ');
  cy.drag('Oracle_1000_Patient ').drop(0);
  cy.toggleNode('Oracle_1000_Patient ')
    .toggleNode('Categorical_locations ');

  cy.drag('categorical_10 ').drop(1);

  cy.contains('Stomach').should('not.be.visible');
  cy.get('label').contains('9 items selected').should('be.visible');

  cy.get('label').contains('9 items selected').click();
  cy.removeChip('Mouth');
  cy.removeChip('Leg');
  cy.removeChip('Breast');
  cy.removeChip('Heart');
  cy.removeChip('Arm');

  cy.get('label').contains('4 items selected').should('be.visible');
  cy.get('label').contains('4 items selected').click();

  cy.get('.update-btn').eq(0).click();
});

when("I select patients that are part of study CATEGORICAL_VALUES or CLINICAL_TRIAL or EHR", () => {
  cy.toggleNode('Public Studies ');
  cy.drag('CATEGORICAL_VALUES ').drop(0);
  cy.drag('CLINICAL_TRIAL ').drop(0);
  cy.drag('EHR ').drop(0);

  cy.contains('i', 'and').click();
  cy.contains('i', 'or').should('be.visible');

  cy.get('.update-btn').eq(0).click();
});

when("I select patients that are part of study Oracle_1000_Patient with age between 50 - 55  and numerical_1 between 0 - 10", () => {
  cy.toggleNode('Public Studies ')
    .toggleNode('Oracle_1000_Patient ')
    .toggleNode('Demographics ')
    .toggleNode('Numerical Variables ');

  cy.contains('Age ').trigger('dragstart');
  cy.get('input[placeholder="add criterion"]').eq(0).trigger('drop');
  cy.get('input[placeholder="min:50"]').type('50');
  cy.get('input[placeholder="max:65"]').type('55');
  cy.contains('numerical_1 ').trigger('dragstart');
  cy.get('input[placeholder="add criterion"]').eq(1).trigger('drop');
  cy.get('input[placeholder="min:-5.76679"]').type('0');
  cy.get('input[placeholder="max:29.79301"]').type('10');
  cy.get('.update-btn').eq(0).click();
});
