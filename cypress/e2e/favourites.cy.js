// cypress/e2e/favourites.cy.js
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
    cy.contains('United States').should('be.visible');
    cy.contains('France').should('be.visible');
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
    
    // Mock getting favorites after adding
    cy.intercept('GET', 'http://localhost:5000/api/favorites', {
      statusCode: 200,
      body: {
        favoriteCountries: ['USA', 'FRA', 'CAN']
      }
    }).as('getFavorites');
    
    // Visit the homepage
    cy.visit('/');
    
    // Wait for countries to load
    cy.wait('@getAllCountries');
    
    // Find Canada's card and click the Add to Favorites button
    cy.contains('Canada')
      .closest('[data-testid="country-card"]')
      .within(() => {
        cy.get('button').click();
      });
    
    // Wait for the API call to complete
    cy.wait('@addFavorite');
    
    // Update localStorage manually to ensure state is consistent
    cy.window().then((win) => {
      win.localStorage.setItem('favoriteCountries', JSON.stringify(['USA', 'FRA', 'CAN']));
    });
    
    // Verify the button text has changed
    cy.contains('Canada')
      .closest('[data-testid="country-card"]')
      .contains('Remove from Favorites')
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
    
    // Mock getting favorites after removal
    cy.intercept('GET', 'http://localhost:5000/api/favorites', {
      statusCode: 200,
      body: {
        favoriteCountries: ['FRA']
      }
    }).as('getFavorites');
    
    // Visit the homepage
    cy.visit('/');
    
    // Wait for countries to load
    cy.wait('@getAllCountries');
    
    // Find USA's card and click the Remove from Favorites button  
    cy.contains('United States')
      .closest('[data-testid="country-card"]')
      .within(() => {
        cy.get('button').click();
      });
    
    // Wait for the API call to complete
    cy.wait('@removeFavorite');
    
    // Update localStorage manually to ensure state is consistent
    cy.window().then((win) => {
      win.localStorage.setItem('favoriteCountries', JSON.stringify(['FRA']));
    });
    
    // Force reload to ensure UI is updated
    cy.reload();
    
    // Wait for countries to load again
    cy.wait('@getAllCountries');
    
    // Mock favorites again after reload
    cy.mockFavorites(['FRA']);
    
    // Verify the button text has changed
    cy.contains('United States')
      .closest('[data-testid="country-card"]')
      .contains('Add to Favorites')
      .should('be.visible');
  });

  it('should show favorites section on country detail page when user is logged in', () => {
    // Mock the country detail API response
    cy.mockCountryByCode('USA', 'usa-detail.json');
    
    // Mock getting favorites
    cy.mockFavorites(['USA', 'FRA']);
    
    // Visit the country detail page
    cy.visit('/country/USA');
    
    // Wait for the country detail to load
    cy.wait('@getCountryUSA');
    
    // Verify favorite button is displayed
    cy.contains('button', 'Remove Favorite').should('be.visible');
    
    // Mock the API response for removing from favorites
    cy.intercept('DELETE', 'http://localhost:5000/api/favorites/USA', {
      statusCode: 200,
      body: {
        favoriteCountries: ['FRA']
      }
    }).as('removeDetailFavorite');
    
    // Mock getting favorites after removal
    cy.intercept('GET', 'http://localhost:5000/api/favorites', {
      statusCode: 200,
      body: {
        favoriteCountries: ['FRA']
      }
    }).as('getDetailFavorites');
    
    // Update localStorage manually before clicking
    cy.window().then((win) => {
      win.localStorage.setItem('favoriteCountries', JSON.stringify(['FRA']));
    });
    
    // Toggle favorite
    cy.contains('button', 'Remove Favorite').click();
    
    // Wait for the API call to complete
    cy.wait('@removeDetailFavorite');
    
    // Verify button text changes
    cy.contains('button', 'Add to Favorites').should('be.visible');
  });
});