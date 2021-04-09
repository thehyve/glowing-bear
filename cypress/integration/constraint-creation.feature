Feature: create constraints by selecting nodes from the tree
  create constraints by selecting nodes from the tree

  Scenario: create a study constraint
    Given I am on the cohort-selection tab
    When I use public study 'CATEGORICAL_VALUES ' as a constraint
    Then there are '3' subjects

  Scenario: create a constraint with concept negation
    Given I am on the cohort-selection tab
    When I select study Oracle_1000_Patient but exclude from categorical_10, Stomach, Lung, Head, Liver
    Then there are '654' subjects

  Scenario: create a constraint with study negation
    Given I am on the cohort-selection tab
    When  I use public study 'EHR' and negation of study 'CATEGORICAL_VALUES' as a constraint
    Then there are '3' subjects
    And constraint panel containing 'CATEGORICAL_VALUES' is negated

  Scenario: create a constraint with double negation
    Given I am on the cohort-selection tab
    When I use negated pedigree constraint 'Parent of' with concept 'Is a Twin' and negated concept 'Number of children that are multiplet'
    Then there are '1,357' subjects
    And constraint panel containing 'Parent of ' is negated
    And the root dimension and box descriptions for pedigree constraint are correct

  Scenario: create a study restricted categorical constraint
    Given I am on the cohort-selection tab
    When I select all female patients from CATEGORICAL_VALUES
    Then there are '1' subjects

  Scenario: create a constraint with or
    Given I am on the cohort-selection tab
    When I select patients that are part of study CATEGORICAL_VALUES or CLINICAL_TRIAL or EHR
    Then there are '9' subjects

  Scenario: create a constraint with and
    Given I am on the cohort-selection tab
    When I select patients that are part of study Oracle_1000_Patient with age between 50 - 55  and numerical_1 between 0 - 10
    Then there are '495' subjects

  Scenario: create a constraint with a diagnosis dimension
    Given I am on the cohort-selection tab
    When I select root dimension 'Diagnosis ID'
    And I use public study 'CSR' as a constraint
    Then there are '8' subjects
    And there is an observation level box message with 'Diagnosis ID' dimension

  Scenario: create a dimension-restricted concept constraint
    Given I am on the cohort-selection tab
    When I select root dimension 'Diagnosis ID'
    And I select gender concept from CSR study
    Then concept constraint is wrapped into combination box

