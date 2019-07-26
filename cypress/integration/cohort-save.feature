Feature: save cohort
  you should be able to save, restore, delete, export and import cohorts

  Scenario: save cohort
    Given there are no cohorts saved
    Given I am on the cohort-selection tab
    When I use public study 'CATEGORICAL_VALUES ' as a constraint
    When I save the Cohort with name 'CatVal'
    Then the cohort 'CatVal' is saved
    And the cohort 'CatVal' has type 'patient'

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

  Scenario: save and restore simple biomaterial dimension cohort
    Given I am on the cohort-selection tab
    When I create a cohort with 'Biomaterial ID' dimension constraint
    And I save the Cohort with name 'Biomaterials'
    And I restore the cohort 'Biomaterials'
    Then the current cohort has biomaterial selected
    And the cohort 'Biomaterials' has type 'Biomaterial ID'
    And the dimension selection is NOT disabled

  Scenario: save and restore complex multi-dimension cohort
    Given I am on the cohort-selection tab
    When I create a cohort with multiple dimensions constraint
    And I save the Cohort with name 'Multi dim'
    And I restore the cohort 'Multi dim'
    Then the current cohort has multiple dimensions selected
    And the cohort 'Multi dim' has type 'Biosource ID'
    And the dimension selection is disabled
