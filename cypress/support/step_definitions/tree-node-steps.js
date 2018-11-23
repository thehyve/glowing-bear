when("I reveal a numeric node", () => {
  cy.toggleNode('Vital Signs ');
});

then("the node has the numeric icon", () => {
  cy.contains('Heart Rate ').parent().parent().children('.ui-treenode-icon').should('have.class', 'icon-123');
});

when("I reveal a categorical node", () => {
  cy.toggleNode('Public Studies ')
    .toggleNode('CATEGORICAL_VALUES ')
    .toggleNode('Demography ');
});

then("the node has the categorical icon", () => {
  cy.contains('Race ').parent().parent().children('.ui-treenode-icon').should('have.class', 'icon-abc');
});

when("I reveal a date node", () => {
  cy.toggleNode('Demographics ');
});

then("the node has the date icon", () => {
  cy.contains('Birth Date ').parent().parent().children('.ui-treenode-icon').should('have.class', 'fa-calendar-o');
});

when("I reveal a text node", () => {
  cy.toggleNode('Demographics ');
});

then("the node has the text icon", () => {
  cy.contains('Place of birth ').parent().parent().children('.ui-treenode-icon').should('have.class', 'fa-newspaper-o');
});
