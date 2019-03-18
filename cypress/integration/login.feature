Feature: Log in
  To look at any data a user must be logged in.

  Scenario: log in with correct credentials
    Given I am on the login page
    When I login with user 'admin'
    Then I am logged in

  Scenario: log in with incorrect credentials
    Given I am on the login page
    When I login with user 'nonuser'
    Then I am not logged in

  Scenario: single login step
    Given I am logged in as 'admin'

  Scenario: log out
    Given I am logged in as 'admin'
    When I log out
    Then I am redirected to the login page
