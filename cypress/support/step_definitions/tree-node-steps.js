when("I expand the first layer of nodes", () => {
  cy.get('.ui-tree-toggler').click({ multiple: true });
});

then("there are sub nodes", () => {
  cy.get('.ui-treenode-content').should(($p) => {
    expect($p).to.have.length(110)
  })
});

when("I reveal a numeric node", () => {
  cy.get('.ui-tree-toggler').eq(0).click();
});

then("the node has the numeric icon", () => {
  cy.get('.ui-treenode-icon').eq(1).should('have.class', 'icon-123');
  cy.get('.ui-treenode-label>span').eq(1).should('contain', 'Heart Rate ');
});

when("I reveal a categorical node", () => {
  cy.get('.ui-tree-toggler').eq(4).click()
});

then("the node has the categorical icon", () => {
  cy.get('.ui-treenode-icon').eq(5).should('have.class', 'icon-abc');
  cy.get('.ui-treenode-label>span').eq(5).should('contain', 'Is a Twin ');
});

when("I reveal a date node", () => {
  cy.get('.ui-tree-toggler').eq(7).click()
});

then("the node has the date icon", () => {
  cy.get('.ui-treenode-icon').eq(8).should('have.class', 'fa-calendar');
  cy.get('.ui-treenode-label>span').eq(8).should('contain', 'Birth Date ');
});

when("I reveal a text node", () => {
  cy.get('.ui-tree-toggler').eq(7).click()
});

then("the node has the text icon", () => {
  cy.get('.ui-treenode-icon').eq(11).should('have.class', 'fa-newspaper-o');
  cy.get('.ui-treenode-label>span').eq(11).should('contain', 'Place of birth ');
});
