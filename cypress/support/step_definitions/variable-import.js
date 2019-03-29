given('I unselect all variables', () => {
  cy.get('.loading-container').should('not.be.visible');
  cy.get('.checkAllText').find(".ui-chkbox-box").click();
})

when('I import variables with {string}', (fileName) => {
  const fileType = 'application/json';
  const fileInputSelector = 'gb-variables input[type=file]';

  cy.get('gb-variables .import-btn').click();
  cy.uploadFile(fileName, fileInputSelector);
});

then('The number of selected variables should be {string}', (numberString) => {
  cy.get('gb-variables .checkAllText').contains(numberString);
});
