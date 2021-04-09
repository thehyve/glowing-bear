given('I unselect all variables', () => {
  cy.get('.loading-container').should('not.be.visible');
  cy.get('.checkAllText').find(".ui-chkbox").click();
})

when('I import variables with {string}', (fileName) => {
  const fileType = 'application/json';
  const fileInputSelector = 'gb-variables input[type=file]';

  cy.get('gb-variables').find('.import-btn').click();
  cy.get(fileInputSelector).attachFile(fileName);
});

then('The number of selected variables should be {string}', (numberString) => {
  cy.get('gb-variables').find('.checkAllText').contains(numberString);
});
