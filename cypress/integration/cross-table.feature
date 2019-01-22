Feature: Create cross table based on categorical values

  Scenario: drop one categorical variable on row zone from variable tree view
    Given I am on the Analysis tab
    When I add a cross table
    And Drag CATEGORICAL_VALUES:Demography:Race from tree view to row zone
    Then Cross table has Latino and Caucasian labels

  Scenario: drop one categorical variable on column zone from variable tree view
    Given I am on the Analysis tab
    When I add a cross table
    And Drag Oracle_1000_Patient:Categorical_locations:categorical_12 from tree view to column zone
    Then Cross table has headers such as Heart, Mouth and Liver

  #TODO: drop categorical variables from the category view
