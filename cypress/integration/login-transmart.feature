Feature: Login with transmart
  To look at any data a user must be logged in.

  Scenario: transmart login with correct credentials
    Given I am on the login page
    When I login with user 'admin' using transmart
    Then I am logged in using transmart

  Scenario: transmart login with incorrect credentials
    Given I am on the login page
    When I login with user 'nonuser' using transmart
    Then I am not logged in using transmart

  Scenario: single transmart login step
    Given I am logged in as 'admin'
