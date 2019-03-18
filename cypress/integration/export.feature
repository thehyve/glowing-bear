Feature: export data
  you should be able to export data

  Scenario: export data with variables selected in Tree View
    Given there are no export jobs pending
    And I am on the cohort-selection tab
    When I use public study 'CATEGORICAL_VALUES ' as a constraint
    And I select all data in Tree View
    And I export this data with the name 'testJobTree'
    Then the job 'testJobTree' has status 'Completed'

  Scenario: export data with variables selected in Category View
    Given there are no export jobs pending
    And I am on the cohort-selection tab
    When I use public study 'EHR ' as a constraint
    And I select all data in Category View
    And I export this data with the name 'testJobCat'
    Then the job 'testJobCat' has status 'Completed'

  Scenario: issue warning with no variables selected in Category View
    Given there are no export jobs pending
    And I am on the cohort-selection tab
    When I use public study 'EHR ' as a constraint
    And I select no data in Category View
    Then issue warning when no data is selected
