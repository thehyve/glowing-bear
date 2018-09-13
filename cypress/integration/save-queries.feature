Feature: save query
  you should be able to save, restore, delete, export and import queries

  Scenario: Save query
    Given there are no queries saved
    Given I am on the data-selection tab
    When I use public study 'CATEGORICAL_VALUES ' as a constraint
    When I save the Query with name 'CatVal'
    Then the query 'CatVal' is saved

  Scenario: load query
    Given Query 'Query Vital Signs' is saved
    Given I am on the data-selection tab
    When I restore the query 'Query Vital Signs'
    Then there are '6' patients and '19' observations

  Scenario: load query
    Given Query 'Query Vital Signs' is saved
    Given I am on the data-selection tab
    When I delete the query 'Query Vital Signs'
    Then the query 'Query Vital Signs' is deleted
