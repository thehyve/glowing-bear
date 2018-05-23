Feature: create constraints by selecting nodes from the tree
  create constraints by selecting nodes from the tree

  Scenario: create a study constraint
    Given I am on the data-selection tab
    When I use public study 'CATEGORICAL_VALUES ' as a constraint
    Then there are '3' patients and '9' observations

  Scenario: create a study restricted categorical constraint
    Given I am on the data-selection tab
    When I select all female patients from CATEGORICAL_VALUES
    Then there are '1' patients and '3' observations

  Scenario: create a constraint with exclusion
    Given I am on the data-selection tab
    When I select study Oracle_1000_Patient but exclude from categorical_10, Stomach, Lung, Head, Liver
    Then there are '654' patients and '65,400' observations

  Scenario: create a constraint with or
    Given I am on the data-selection tab
    When I select patients that are part of study CATEGORICAL_VALUES or CLINICAL_TRIAL or EHR
    Then there are '9' patients and '33' observations

  Scenario: create a constraint with and
    Given I am on the data-selection tab
    When I select patients that are part of study Oracle_1000_Patient with age between 50 - 55  and numerical_1 between 0 - 10
    Then there are '495' patients and '49,500' observations
