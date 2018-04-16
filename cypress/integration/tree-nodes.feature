Feature: tree node navigation
  Navigating the tree is vital to do anything in GB. Nodes must be able to expand to reveal sub-nodes. Nodes should have the right Icon type.

  Scenario: expand to show sub nodes
    Given I am logged in as 'admin'
    When I expand the first layer of nodes
    Then there are 35 sub nodes

  Scenario: numeric value node
    Given I am logged in as 'admin'
    When I reveal a numeric node
    Then the node has the numeric icon

  Scenario: categorical value node
    Given I am logged in as 'admin'
    When I reveal a categorical node
    Then the node has the categorical icon

  Scenario: date value node
    Given I am logged in as 'admin'
    When I reveal a date node
    Then the node has the date icon

  Scenario: text value node
    Given I am logged in as 'admin'
    When I reveal a text node
    Then the node has the text icon
