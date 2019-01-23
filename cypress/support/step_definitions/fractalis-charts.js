when('I select a box plot', () => {
  cy.get('.fractalis-control-container').contains('boxplot').click();
});

then('I drag numerical_11 variable from the Category View to variable drop zone', () => {
  cy.get('gb-variables .ui-button').contains('Category view').click();
  cy.drag('numerical_11', 'gb-variables').drop(0, '.fractalis-control-container .drop-zone');
});

then('I click the Add button', () => {
  cy.get('gb-fractalis-control button').contains('Add').click();
});

then('There should be a box plot created', () => {
  cy.get('gb-fractalis-visual gb-fractalis-chart .fjs-chart').contains('Boxplot');
});

then('I select two cohorts', () => {
  cy.get('span.ui-button-text.ui-unselectable-text').then(cohortsElms => {
    if(cohortsElms && cohortsElms.length > 1) {
      // if there is already more than one cohort, select the 2nd one
      cohortsElms.eq(1).click();
    } else {
      // else creat and save a new cohort, then select it
      const cohortName = 'temp_oracle_numerical';
      cy.toggleNode('Public Studies');
      cy.toggleNode('Oracle_1000_Patient');
      cy.toggleNode('Numerical Variables');
      cy.drag('numerical_11').drop(0);
      cy.contains('Update cohort').click();
      cy.get('#cohortName').type(cohortName);
      cy.contains('Save cohort').click();
      cy.get('gb-cohorts').contains(cohortName).eq(0).click();
    }
    cy.get('gb-nav-bar').contains('Analysis').click();
  });
});

then('There should be two box plots in one chart', () => {
  cy.get('gb-fractalis-visual gb-fractalis-chart .fjs-chart')
    .find('.fjs-box').should('have.length', 2);
});
