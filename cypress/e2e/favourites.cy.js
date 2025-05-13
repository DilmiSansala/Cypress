// cypress/e2e/favorites.cy.js
describe('Favorites Tests', () => {
    beforeEach(() => {
      // Set up authenticated user state
      cy.setAuthenticatedUser('dilmi', '1');
      
      // Mock API responses
      cy.mockAllCountries();
      cy.mockFavorites(['USA', 'FRA']);
    });
  
    it('should display favorites button when user is logged in', () => {
      // Visit the homepage
      cy.visit('/');
      
      // Wait for countries to load
      cy.wait('@getAllCountries');
  
      // Verify the favorites button is visible
      cy.contains('button', 'My Favorites').should('be.visible');
    });
  
    it('should filter to show only favorite countries when favorites button is clicked', () => {
      // Visit the homepage
      cy.visit('/');
      
      // Wait for countries to load
      cy.wait('@getAllCountries');
      
      // Click the favorites button
      cy.contains('button', 'My Favorites').click();
      
      // Verify only favorite countries are displayed
      cy.get('[data-testid="country-card"]').should('have.length', 2);
      cy.verifyCountryCard('United States');
      cy.verifyCountryCard('France');
      cy.contains('Canada').should('not.exist');
      
      // Verify the button text has changed
      cy.contains('button', 'All Countries').should('be.visible');
    });
  
    it('should add a country to favorites', () => {
      // Mock the API response for adding to favorites
      cy.intercept('POST', 'http://localhost:5000/api/favorites', {
        statusCode: 200,
        body: {
          favoriteCountries: ['USA', 'FRA', 'CAN']
        }
      }).as('addFavorite');
      
      // Visit the homepage
      cy.visit('/');
      
      // Wait for countries to load
      cy.wait('@getAllCountries');
      
      // Find Canada's card and click favorite button
      cy.contains('[data-testid="country-name"]', 'Canada')
        .closest('[data-testid="country-card"]')
        .find('button')
        .contains('Add to Favorites')
        .click();
      
      // Wait for the API call to complete
      cy.wait('@addFavorite');
      
      // Verify the button text has changed
      cy.contains('[data-testid="country-name"]', 'Canada')
        .closest('[data-testid="country-card"]')
        .contains('Remove Favorite')
        .should('be.visible');
    });
  
    it('should remove a country from favorites', () => {
      // Mock the API response for removing from favorites
      cy.intercept('DELETE', 'http://localhost:5000/api/favorites/USA', {
        statusCode: 200,
        body: {
          favoriteCountries: ['FRA']
        }
      }).as('removeFavorite');
      
      // Visit the homepage
      cy.visit('/');
      
      // Wait for countries to load
      cy.wait('@getAllCountries');
      
      // Find USA's card and click favorite button to remove it
      cy.contains('[data-testid="country-name"]', 'United States')
        .closest('[data-testid="country-card"]')
        .find('button')
        .contains('Remove Favorite')
        .click();
      
      // Wait for the API call to complete
      cy.wait('@removeFavorite');
      
      // Verify the button text has changed
      cy.contains('[data-testid="country-name"]', 'United States')
        .closest('[data-testid="country-card"]')
        .contains('Add to Favorites')
        .should('be.visible');
    });
  
    it('should show favorites section on country detail page when user is logged in', () => {
      // Mock the country detail API response
      cy.mockCountryByCode('USA', 'usa-detail.json');
      
      // Visit the country detail page
      cy.visit('/country/USA');
      
      // Wait for the country detail to load
      cy.wait('@getCountryUSA');
      
      // Verify favorite button is displayed
      cy.contains('button', 'Remove from Favorites').should('be.visible');
      
      // Toggle favorite
      cy.contains('button', 'Remove from Favorites').click();
      
      // Verify button text changes
      cy.contains('button', 'Add to Favorites').should('be.visible');
    });
  });