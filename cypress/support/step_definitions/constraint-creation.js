when("I use public study {string} as a constraint", (studyName) => {
  // cy.contains('Public Studies ').parent().parent().children('.ui-tree-toggler').click();

  cy.toggleNode('Public Studies ');
  cy.drag(studyName).drop(0);

  cy.get('.update-btn').eq(0).click();
});

then("there are {string} subjects", (subjects) => {
  cy.get('.subject-count-box').eq(0).should('contain', subjects);
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

  cy.drag('categorical_10 ').drop(0);

  cy.contains('Stomach').should('not.be.visible');
  cy.get('.ui-multiselect-label').contains('9 items selected').should('be.visible');

  cy.get('.ui-multiselect-label').contains('9 items selected').click();
  cy.removeChip('Mouth');
  cy.removeChip('Leg');
  cy.removeChip('Breast');
  cy.removeChip('Heart');
  cy.removeChip('Arm');

  cy.get('.ui-multiselect-label').contains('4 items selected').should('be.visible');
  cy.get('.ui-multiselect-label').contains('4 items selected').click();

  cy.get('.ui-inputswitch-slider').eq(1).click();

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
    .toggleVisibleNode('Demographics ')
    .toggleNode('Numerical Variables ');

  cy.contains('Age ').trigger('dragstart');
  cy.get('input[placeholder="add criterion"]').eq(0).trigger('drop');
  cy.get('input[placeholder="min:50"]').type('50');
  cy.get('input[placeholder="max:65"]').type('55');
  cy.contains('numerical_1 ').trigger('dragstart');
  cy.get('input[placeholder="add criterion"]').eq(0).trigger('drop');
  cy.get('input[placeholder="min:-5.766787251"]').type('0');
  cy.get('input[placeholder="max:29.7930135202"]').type('10');
  cy.get('.update-btn').eq(0).click();
});

when("I use public study {string} and negation of study {string} as a constraint", (study1, study2) => {
  cy.toggleNode('Public Studies ');
  cy.drag(study1).drop(0);
  cy.drag(study2).drop(0);

  cy.get('.ui-inputswitch-slider').eq(1).click();
  cy.get('.update-btn').eq(0).click();
});

then("constraint panel containing {string} is negated", (constraintName) => {
  cy.get('.gb-constraint-container').contains(constraintName).parents('.gb-negated-constraint');
  cy.get('span').contains('excluding').should('be.visible');
  cy.get('label').contains('for the patient there is NO observation:');
});

when("I use negated pedigree constraint {string} with concept {string} and negated concept {string}",
    (pedigreeConstraint, concept1, concept2) => {
  cy.get('input[placeholder="add criterion"]').eq(0).type(pedigreeConstraint).get('.ui-autocomplete-panel').eq(0).click();
  cy.toggleNode('Pedigree ');
  cy.drag(concept1).drop(0);
  cy.drag(concept2).drop(0);

  cy.get('.ui-inputswitch-slider').eq(0).click();
  cy.get('.ui-inputswitch-slider').eq(2).click();
  cy.get('.update-btn').eq(0).click();
});

then("there is an observation level box message with {string} dimension", (dimensionName) => {
  cy.get('label').contains(`for the ${dimensionName} there is an observation:`);
});

when("I select root dimension {string}", (dimensionName) => {
  cy.get('.gb-constraint-dimension-dropdown').get('.ui-dropdown').click();
  cy.get('.ui-dropdown').contains(dimensionName).click();
});

when("I select gender concept from CSR study", () => {
  cy.get('input[placeholder="add criterion"]').eq(0).type('gender (\\Public Studies\\CSR')
    .get('.ui-autocomplete-panel').eq(0).click();
});

then("concept constraint is wrapped into combination box", () => {
  cy.get('label').contains('the Diagnosis ID is linked to a');
  cy.get('label').contains('for the patient there is an observation:');
  cy.get('.gb-concept-constraint-input ').eq(0);
  cy.get('.gb-constraint-dimension-dropdown').eq(0).contains('Diagnosis ID');
  cy.get('.gb-constraint-dimension-dropdown').eq(1).contains('patient');
  cy.get('.gb-constraint-dimension-dropdown')
    .get('.ui-dropdown').eq(1).should('have.class', 'ui-state-disabled');
});

when("the root dimension and box descriptions for pedigree constraint are correct", () => {
  cy.get('.gb-constraint-dimension-dropdown').eq(0).contains('patient');
  cy.get('.gb-constraint-container').eq(0).should('not.have.class', 'gb-constraint-dimension-dropdown');
  cy.get('.gb-constraint-container').eq(0).children('gb-combination-constraint')
    .should('not.have.class', 'gb-constraint-dimension-dropdown');
});



