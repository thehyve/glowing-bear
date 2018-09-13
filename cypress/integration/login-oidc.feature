Feature: Login with external oidc provider
  To look at any data a user must be logged in.

  Scenario: oidc login with correct credentials
    Given I am on the login page
    When I login with user 'admin' using oidc
    Then I am logged in using oidc

  Scenario: oidc login with incorrect credentials
    Given I am on the login page
    When I login with user 'nonuser' using oidc
    Then I am not logged in using oidc

  Scenario: single oidc login step
    Given I am logged in as 'admin'

  Scenario: oidc logout
    Given I am logged in as 'admin'
    When I log out
    Then I am redirected to the login page
