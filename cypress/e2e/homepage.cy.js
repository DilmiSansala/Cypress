// cypress/e2e/homepage.cy.js
describe('Homepage Tests', () => {
    beforeEach(() => {
      // Visit the homepage before each test
      cy.visit('/');
      
      // Mock API response for countries
      cy.intercept('GET', 'https://restcountries.com/v3.1/all', { fixture: 'countries.json' }).as('getAllCountries');
    });
  
    it('should load the homepage successfully', () => {
      // Verify navbar and main elements are visible
      cy.get('header').should('be.visible');
      cy.contains('h1', 'Discover the World').should('be.visible');
      
      // Wait for the API call to complete
      cy.wait('@getAllCountries');
      
      // Verify countries are displayed
      cy.get('[data-testid="country-card"]').should('have.length.greaterThan', 0);
    });
  
    it('should search for a country and display results', () => {
      // Mock search results for "Canada"
      cy.intercept('GET', 'https://restcountries.com/v3.1/name/Canada', { fixture: 'canada-search.json' }).as('searchCanada');
      
      // Type in the search box and submit
      cy.get('input[placeholder="Search for a country..."]').type('Canada');
      cy.contains('button', 'Search').click();
      
      // Wait for the search API call to complete
      cy.wait('@searchCanada');
      
      // Verify that only Canada appears in the results
      cy.get('[data-testid="country-card"]').should('have.length', 1);
      cy.contains('h2', 'Canada').should('be.visible');
      cy.contains('United States').should('not.exist');
    });
  
    it('should handle empty search results gracefully', () => {
      // Mock search with no results
      cy.intercept('GET', 'https://restcountries.com/v3.1/name/NonExistentCountry', {
        statusCode: 404,
        body: { message: 'Not Found' }
      }).as('invalidSearch');
      
      // Type in the search box and submit
      cy.get('input[placeholder="Search for a country..."]').type('NonExistentCountry');
      cy.contains('button', 'Search').click();
      
      // Wait for the search API call to complete
      cy.wait('@invalidSearch');
      
      // Verify no results message is displayed
      cy.contains('No countries found').should('be.visible');
    });
  });