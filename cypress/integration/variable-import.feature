Feature: variable import
  you should be able to import variables during data export

  Scenario: import variables by names
    Given I am on the export tab
    When I import variables with 'variable-names.json'
    Then The number of selected variables should be '1'

  Scenario: import variables by paths
    Given I am on the export tab
    When I import variables with 'variable-paths.json'
    Then The number of selected variables should be '3'

  Scenario: handle invalid variable import
    Given I am on the export tab
    When I import variables with 'variable-invalid.json'
    Then The number of selected variables should be '145'
    Then I should see the message containing 'Invalid'
