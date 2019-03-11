Feature: save cohort
  you should be able to save, restore, delete, export and import cohorts

  Scenario: save cohort
    Given there are no cohorts saved
    Given I am on the cohort-selection tab
    When I use public study 'CATEGORICAL_VALUES ' as a constraint
    When I save the Cohort with name 'CatVal'
    Then the cohort 'CatVal' is saved

  Scenario: load cohort
    Given Cohort 'Query Vital Signs' is saved
    Given I am on the cohort-selection tab
    When I restore the cohort 'Query Vital Signs'
    Then there are '6' subjects

  Scenario: delete cohort
    Given Cohort 'Query Vital Signs' is saved
    Given I am on the cohort-selection tab
    When I delete the cohort 'Query Vital Signs'
    Then the cohort 'Query Vital Signs' is deleted

  Scenario: save and delete simple biomaterial dimension cohort
    Given I am on the cohort-selection tab
    When I create a cohort with 'Biomaterial ID' dimension constraint
    And I save the Cohort with name 'Biomaterial ID'
    And I restore the cohort 'Biomaterial ID'
    Then the current cohort has biomaterial selected

  Scenario: save and delete complex multi-dimension cohort
    Given I am on the cohort-selection tab
    When I create a cohort with multiple dimensions constraint
    And I save the Cohort with name 'Multi dim'
    And I restore the cohort 'Multi dim'
    Then the current cohort has multiple dimensions selected
