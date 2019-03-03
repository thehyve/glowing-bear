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
    Then 'CATEGORICAL_VALUES' study constraint panel is negated

  Scenario: create a constraint with double negation
    Given I am on the cohort-selection tab
    When I use negated pedigree constraint 'Parent of' with concept 'Is a Twin' and negated concept 'Number of children that are multiplet'
    Then there are '1,355' subjects

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

  Scenario: create a simple sample based subselection constraint
    Given I am on the cohort-selection tab
    When I select diagnosis that are part of study 'CSR'
    Then there are '8' subjects

