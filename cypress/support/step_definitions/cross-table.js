when('I add a cross table', () => {
  cy.get('.ui-selectbutton .ui-button-text-only').contains('crosstable').click();
  cy.get('.btn-container .btn.btn-primary').contains('Add').click();
});

then('A cross table should show up', () => {
  cy.get('.table-container .description').contains('Cross Table').should('exist');
  cy.get('.row').first().contains('Column');
  cy.get('.row').last().contains('Row');
});

/**
 * Note that for PrimeNg drag n drop, the drop action is only recognizable by Cypress
 * if the drop zone is a descendant element of its droppable-scoped ancestor,
 * i.e. the parent has the primeNg directive [pDroppable]=...
 * also, the descendant element should be a div
 */
then('Drag CATEGORICAL_VALUES:Demography:Race from tree view to row zone', () => {
  // collapse cohorts panel
  cy.get('.ui-accordion-header').contains('Cohorts').click();
  cy.get('.loading-container').should('not.be.visible');
  cy.toggleNode('Public Studies ');
  cy.toggleNode('CATEGORICAL_VALUES ');
  cy.toggleNode('Demography');
  cy.drag('Race', '.gb-variables-tree-container').drop(1, 'div.gb-droppable-zone-info-container');
});

then('Cross table has Latino and Caucasian labels', () => {
  cy.get('.ui-table-tbody').contains('Latino');
  cy.get('.ui-table-tbody').contains('Caucasian');
});

then('Drag Oracle_1000_Patient:Categorical_locations:categorical_12 from tree view to column zone', () => {
  // collapse cohorts panel
  cy.get('.ui-accordion-header').contains('Cohorts').click();
  cy.get('.loading-container').should('not.be.visible');
  cy.toggleNode('Public Studies ');
  cy.toggleNode('Oracle_1000_Patient ');
  cy.toggleNode('Categorical_locations');
  cy.drag('categorical_12', '.gb-variables-tree-container').drop(0, 'div.gb-droppable-zone-info-container');
});

then('Cross table has headers such as Heart, Mouth and Liver', () => {
  cy.get('td.ui-resizable-column.header').contains('Heart');
  cy.get('td.ui-resizable-column.header').contains('Stomach');
  cy.get('td.ui-resizable-column.header').contains('Head');
  cy.get('td.ui-resizable-column.header').contains('Mouth');
  cy.get('td.ui-resizable-column.header').contains('Liver');
  cy.get('td.ui-resizable-column.header').contains('Lung');
  cy.get('td.ui-resizable-column.header').contains('Breast');
  cy.get('td.ui-resizable-column.header').contains('Arm');
  cy.get('td.ui-resizable-column.header').contains('Leg');
});
