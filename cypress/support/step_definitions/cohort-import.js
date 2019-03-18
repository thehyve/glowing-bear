when('I import a cohort with {string}', (fileName) => {
  const fileType = 'application/json';
  const fileInputSelector = 'gb-cohorts input[type=file]';

  cy.get('gb-cohorts .import-btn').click();
  cy.uploadFile(fileName, fileInputSelector);
});

then('Current cohort should contain {string}', (text) => {
  cy.get('.gb-constraint-container-root').contains(text);
});

then('Summary should contain {string}', (text) => {
  cy.get('.criteria-box').eq(0).contains(text);
});
