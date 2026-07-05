/**
 * ============================================================================
 * 📁 amazon_cart.steps.ts — Step Definitions for Amazon Cart Feature
 * ============================================================================
 *
 * PURPOSE:
 * Connects the English sentences in `features/ui/amazon_cart.feature` to
 * TypeScript code that automates Amazon.in search and add-to-cart flow.
 * ============================================================================
 */

import { Given, When, Then } from './ui.fixtures';
import { expect } from '@playwright/test';

// ═════════════════════════════════════════════════════════════════════════
// 📋 GIVEN Steps
// ═════════════════════════════════════════════════════════════════════════

Given('I am on the Amazon India homepage', async ({ amazonPage }) => {
  await amazonPage.navigate();
});

// ═════════════════════════════════════════════════════════════════════════
// 🎬 WHEN Steps
// ═════════════════════════════════════════════════════════════════════════

When('I search for {string} on Amazon', async ({ amazonPage }, searchTerm: string) => {
  await amazonPage.searchProduct(searchTerm);
});

When('I add the first product to the cart', async ({ amazonPage }) => {
  // Click the first product - navigates to product page
  await amazonPage.clickFirstProduct();

  // Add the product to cart on the product detail page
  await amazonPage.addToCart(amazonPage.page);
});

// ═════════════════════════════════════════════════════════════════════════
// ✅ THEN Steps
// ═════════════════════════════════════════════════════════════════════════

Then('the cart count should be updated', async ({ amazonPage }) => {
  await amazonPage.verifyCartUpdated(amazonPage.page);
});
