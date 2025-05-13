// cypress/e2e/country-detail.cy.js
describe('Country Detail Tests', () => {
    it('should navigate to country detail page and display country information', () => {
      // Mock API response for all countries
      cy.intercept('GET', 'https://restcountries.com/v3.1/all', { fixture: 'countries.json' }).as('getAllCountries');
      
      // Visit the homepage
      cy.visit('/');
      
      // Wait for countries to load
      cy.wait('@getAllCountries');
      
      // Mock the country detail API response
      cy.intercept('GET', 'https://restcountries.com/v3.1/alpha/USA', { fixture: 'usa-detail.json' }).as('getUSADetail');
      
      // Click on USA country card to navigate to detail page
      cy.contains('United States').click();
      
      // Wait for the country detail to load
      cy.wait('@getUSADetail');
      
      // Verify country name is displayed
      cy.contains('United States').should('be.visible');
      
      // Check for essential country details
      cy.contains('Capital').should('be.visible');
      cy.contains('Washington D.C.').should('be.visible');
      
      cy.contains('Population').should('be.visible');
      cy.contains('331,002,651').should('be.visible');
      
      cy.contains('Region').should('be.visible');
      cy.contains('Americas').should('be.visible');
      
      // Verify flag is displayed
      cy.get('img[alt="Flag of United States"]').should('be.visible');
      
      // Verify border countries section
      cy.contains('Neighboring Countries').should('be.visible');
      cy.contains('Canada').should('be.visible');
      cy.contains('Mexico').should('be.visible');
    });
  
    it('should navigate back to homepage from country detail page', () => {
      // Mock necessary API responses
      cy.intercept('GET', 'https://restcountries.com/v3.1/alpha/USA', { fixture: 'usa-detail.json' }).as('getUSADetail');
      cy.intercept('GET', 'https://restcountries.com/v3.1/all', { fixture: 'countries.json' }).as('getAllCountries');
      
      // Visit the country detail page directly
      cy.visit('/country/USA');
      
      // Wait for the country detail to load
      cy.wait('@getUSADetail');
      
      // Click the back button
      cy.contains('Back to Countries').click();
      
      // Wait for the countries to load on the homepage
      cy.wait('@getAllCountries');
      
      // Verify we're back on the homepage
      cy.contains('Discover the World').should('be.visible');
      cy.url().should('eq', Cypress.config().baseUrl + '/');
    });
  
    it('should show error message when country cannot be found', () => {
      // Mock a 404 response for a non-existent country
      cy.intercept('GET', 'https://restcountries.com/v3.1/alpha/FAKE', {
        statusCode: 404,
        body: { message: 'Country not found' }
      }).as('getFakeCountry');
      
      // Visit the non-existent country page
      cy.visit('/country/FAKE');
      
      // Wait for the API call to complete
      cy.wait('@getFakeCountry');
      
      // Verify error message is displayed using data-testid attributes
      cy.get('[data-testid="error-title"]').should('be.visible');
      cy.get('[data-testid="error-title"]').should('contain', 'Oops! Something went wrong');
      cy.get('[data-testid="error-message"]').should('be.visible');
      cy.get('[data-testid="error-message"]').should('contain', 'Country not found');
      
      // Verify go back button is available
      cy.get('[data-testid="go-back-button"]').should('be.visible');
      cy.get('[data-testid="go-back-button"]').should('contain', 'Go Back to Home');
    });
  });