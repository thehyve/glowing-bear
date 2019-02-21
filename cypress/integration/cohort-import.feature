Feature: import cohort
  you should be able to import a cohort with either subject Ids or a json definition

  Scenario: import cohort with a valid json
    Given I am on the cohort-selection tab
    When I import a cohort with 'cohort-parents-or-ehr.json'
    Then Current cohort should contain 'Parent'
    And Current cohort should contain 'EHR'

  Scenario: import cohort with an invalid json
    Given I am on the cohort-selection tab
    When I import a cohort with 'cohort-invalid.json'
    Then I should see the message containing 'Invalid json format'

  Scenario: import cohort with a file of invalid subject ids
    Given I am on the cohort-selection tab
    When I import a cohort with 'cohort-subject-ids-invalid.txt'
    Then Current cohort should contain '2 external subject IDs'
    And Summary should contain '0 subjects match your selection'
