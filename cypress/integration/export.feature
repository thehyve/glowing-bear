Feature: export data
  you should be able to export data

  Scenario: export query
    Given there are no export jobs pending
    Given I am on the data-selection tab
    When I use public study 'CATEGORICAL_VALUES ' as a constraint
    When I select all data
    When I export this data with the name 'testJob'
    Then then the job 'testJob' has status 'Completed'
