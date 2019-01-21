Feature: see the subjects counts across intersections of categorical values

  Scenario: drop one categorical variable on row zone
    Given I am on the Analysis tab
    When I add a cross table
    And Drag CATEGORICAL_VALUES:Demography:Race from Tree View to row zone
    Then Cross table has Latino and Caucasian labels
