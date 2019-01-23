Feature: Create various Fractalis charts

  Scenario: Create a box-plot with a numerical variable from the Category View with one cohort
    Given I am on the Analysis tab
    When I select a box plot
    And I drag numerical_11 variable from the Category View to variable drop zone
    And I click the Add button
    Then There should be a box plot created

  Scenario: Create a box-plot with a numerical variable from the Category View with multiple cohorts
    Given I am on the cohort-selection tab
    When I select two cohorts
    And I select a box plot
    And I drag numerical_11 variable from the Category View to variable drop zone
    And I click the Add button
    Then There should be two box plots in one chart

  #TODO: compose charts with variables from the Tree View
