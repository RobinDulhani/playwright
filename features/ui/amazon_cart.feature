@ui
Feature: Amazon Cart
  As a user on Amazon.in
  I want to search for gym clothes and add items to my cart
  So that I can purchase them later

  @smoke
  Scenario: Search for gym clothes and add first item to cart
    Given I am on the Amazon India homepage
    When I search for "gym clothes men" on Amazon
    And I add the first product to the cart
    Then the cart count should be updated
