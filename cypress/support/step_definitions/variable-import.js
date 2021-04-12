given('I unselect all variables', () => {
  cy.get('.loading-container').should('not.exist');
  cy.get('.gb-variables-tree-container').contains('Public Studies ');
  cy.get('gb-variables').find('.checkAllText').contains('180 variables selected').should('be.visible');
  cy.wait(500);
  cy.get('.checkAllText').find('.ui-chkbox').click({scrollBehavior: false});
  cy.wait(500);
  cy.get('gb-variables').find('.checkAllText').contains('0 variables selected').should('be.visible');
  cy.get('.gb-export-section-banner').contains('No data selected');
});

when('I import variables with {string}', (fileName) => {
  const fileInputSelector = 'gb-variables input[type=file]';
  cy.get('gb-variables').find('.import-btn').click({scrollBehavior: false});
  cy.get(fileInputSelector).attachFile(fileName);
});

then('The number of selected variables should be {string}', (numberString) => {
  cy.get('gb-variables').find('.checkAllText').contains(numberString).should('be.visible');
});
