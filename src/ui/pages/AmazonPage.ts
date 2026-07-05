/**
 * ============================================================================
 * 📁 AmazonPage.ts — Page Object for Amazon.in
 * ============================================================================
 *
 * PURPOSE:
 * Encapsulates ALL interactions with Amazon.in for searching products
 * and adding items to the cart.
 * ============================================================================
 */

import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class AmazonPage extends BasePage {
  // ═══════════════════════════════════════════════════════════════════
  // 📍 LOCATORS
  // ═══════════════════════════════════════════════════════════════════

  /** The search input box */
  readonly searchBox: Locator;

  /** The search submit button */
  readonly searchButton: Locator;

  /** The cart icon/link */
  readonly cartLink: Locator;

  /** The cart count badge */
  readonly cartCount: Locator;

  constructor(page: Page) {
    super(page, 'AmazonPage');

    this.searchBox = page.locator('#twotabsearchtextbox');
    this.searchButton = page.locator('#nav-search-submit-button');
    this.cartLink = page.locator('#nav-cart');
    this.cartCount = page.locator('#nav-cart-count');
  }

  // ═══════════════════════════════════════════════════════════════════
  // 🎬 ACTIONS
  // ═══════════════════════════════════════════════════════════════════

  /**
   * Navigates to Amazon.in homepage.
   */
  async navigate(): Promise<void> {
    this.log.step('Navigating to Amazon.in');
    await this.page.goto('https://www.amazon.in', {
      waitUntil: 'load',
      timeout: 45000,
    });
    // Wait for the search box to be available as a sign the page is ready
    await this.searchBox.waitFor({ state: 'visible', timeout: 30000 });
    this.log.info('✅ Amazon.in homepage loaded.');
  }

  /**
   * Searches for a product using the search bar.
   * @param searchTerm - The term to search for
   */
  async searchProduct(searchTerm: string): Promise<void> {
    this.log.step(`Searching for: "${searchTerm}"`);
    await this.searchBox.waitFor({ state: 'visible', timeout: 30000 });
    await this.searchBox.click();
    await this.searchBox.fill(searchTerm);
    await this.searchButton.click();
    // Wait for search results to load
    await this.page.waitForLoadState('load', { timeout: 30000 });
    this.log.info(`✅ Search completed for "${searchTerm}".`);
  }

  /**
   * Clicks on the first product in search results.
   * Opens the product in a new tab and switches to it.
   */
  async clickFirstProduct(): Promise<Page> {
    this.log.step('Clicking on the first product in search results');

    // Wait for search results container to appear
    await this.page.waitForSelector('[data-component-type="s-search-result"]', {
      state: 'attached',
      timeout: 30000,
    });
    this.log.info('Search results loaded.');

    // Amazon.in product title links use class 'a-link-normal s-line-clamp-2' (not inside h2)
    const firstProductLink = this.page.locator(
      '[data-component-type="s-search-result"] a.a-link-normal.s-line-clamp-2'
    ).first();

    try {
      await firstProductLink.waitFor({ state: 'visible', timeout: 15000 });
    } catch {
      // Fallback: try any product link with /dp/ in href
      this.log.info('Primary selector failed, trying fallback...');
      const fallbackLink = this.page.locator(
        '[data-component-type="s-search-result"] a.a-link-normal[href*="/dp/"]'
      ).first();
      await fallbackLink.waitFor({ state: 'visible', timeout: 15000 });
      const href = await fallbackLink.getAttribute('href');
      if (href) {
        const productUrl = href.startsWith('http') ? href : `https://www.amazon.in${href}`;
        await this.page.goto(productUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
        this.log.info('✅ First product page opened via fallback.');
        return this.page;
      }
    }

    // Get the product URL and navigate directly to avoid new tab issues
    const href = await firstProductLink.getAttribute('href');
    if (href) {
      const productUrl = href.startsWith('http') ? href : `https://www.amazon.in${href}`;
      await this.page.goto(productUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    } else {
      await firstProductLink.click();
      await this.page.waitForLoadState('domcontentloaded');
    }

    this.log.info('✅ First product page opened.');
    return this.page;
  }

  /**
   * Adds the current product to cart on the product detail page.
   * @param productPage - The product detail page
   */
  async addToCart(productPage: Page): Promise<void> {
    this.log.step('Adding product to cart');

    const addToCartButton = productPage.locator('#add-to-cart-button');
    
    try {
      await addToCartButton.waitFor({ state: 'visible', timeout: 15000 });
      await addToCartButton.click();
    } catch {
      // Some products may have a different add to cart button
      this.log.info('Primary add-to-cart button not found, trying alternatives...');
      const altButton = productPage.locator('#add-to-cart-button-ubb, input[name="submit.add-to-cart"], #submit\\.add-to-cart');
      await altButton.first().waitFor({ state: 'visible', timeout: 10000 });
      await altButton.first().click();
    }

    // Wait for cart confirmation or page update
    await productPage.waitForLoadState('domcontentloaded');
    // Give some time for the cart to update
    await productPage.waitForTimeout(3000);
    this.log.info('✅ Product added to cart.');
  }

  // ═══════════════════════════════════════════════════════════════════
  // ✅ VERIFICATIONS
  // ═══════════════════════════════════════════════════════════════════

  /**
   * Verifies the cart count is greater than 0.
   * @param page - The page to check the cart count on
   */
  async verifyCartUpdated(page: Page): Promise<void> {
    this.log.step('Verifying cart count is updated');
    const cartCountLocator = page.locator('#nav-cart-count');
    await cartCountLocator.waitFor({ state: 'visible', timeout: 15000 });
    const countText = await cartCountLocator.textContent();
    const count = parseInt(countText || '0', 10);
    expect(count).toBeGreaterThan(0);
    this.log.info(`✅ Cart count is ${count} — cart updated successfully.`);
  }
}
