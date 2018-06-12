# Created by barteldklasens at 4/10/18
Feature: Login
  To look at any data a user must be logged in.

  Scenario: login with correct credentials
    Given I am on the login page
    When I login with user 'admin'
    Then I am logged in

  Scenario: login with correct credentials
    Given I am on the login page
    When I login with user 'nonuser'
    Then I am not logged in

  Scenario: single login step
    Given I am logged in as 'admin'
