// cypress/e2e/country-detail.cy.js
describe('Country Detail Tests', () => {
  beforeEach(() => {
    // Set up authenticated user state for tests that need it
    cy.setAuthenticatedUser('dilmi', '1');
    
    // Mock the country detail API response for USA
    cy.intercept('GET', 'https://restcountries.com/v3.1/alpha/USA', { fixture: 'usa-detail.json' }).as('getUSADetail');
    
    // Mock border countries (These will be called when loading border countries)
    cy.intercept('GET', 'https://restcountries.com/v3.1/alpha/CAN', {
      body: [{
        cca3: 'CAN',
        name: { common: 'Canada' },
        flags: { png: 'https://flagcdn.com/w320/ca.png' }
      }]
    }).as('getCanadaDetail');
    
    cy.intercept('GET', 'https://restcountries.com/v3.1/alpha/MEX', {
      body: [{
        cca3: 'MEX',
        name: { common: 'Mexico' },
        flags: { png: 'https://flagcdn.com/w320/mx.png' }
      }]
    }).as('getMexicoDetail');
  });

  // it('should navigate to country detail page and display country information', () => {
  //   // Mock API response for all countries
  //   cy.intercept('GET', 'https://restcountries.com/v3.1/all', { fixture: 'countries.json' }).as('getAllCountries');
    
  //   // Visit the homepage
  //   cy.visit('/');
    
  //   // Wait for countries to load
  //   cy.wait('@getAllCountries');
    
  //   // Click on USA country card to navigate to detail page
  //   cy.contains('United States').click();
    
  //   // Wait for the country detail to load
  //   cy.wait('@getUSADetail');
    
  //   // Verify country name is displayed
  //   cy.contains('United States').should('be.visible');
    
  //   // Check for essential country details
  //   cy.contains('Capital').should('be.visible');
  //   cy.contains('Washington D.C.').should('be.visible');
    
  //   cy.contains('Population').should('be.visible');
  //   cy.contains('331,002,651').should('be.visible');
    
  //   cy.contains('Region').should('be.visible');
  //   cy.contains('Americas').should('be.visible');
    
  //   // Verify flag is displayed
  //   cy.get('img[alt="Flag of United States"]').should('be.visible');
    
  //   // Check for border countries
  //   cy.contains('Canada').should('be.visible');
  //   cy.contains('Mexico').should('be.visible');
  // });

  it('should navigate back to homepage from country detail page', () => {
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
  });

  it('should display country details including currencies and languages', () => {
    // Visit country detail page directly
    cy.visit('/country/USA');
    
    // Wait for the country detail API call to complete
    cy.wait('@getUSADetail');
    
    // Verify detailed information is displayed
    cy.contains('Currencies').should('be.visible');
    cy.contains('United States Dollar').should('be.visible');
    cy.contains('$').should('be.visible');
    
    cy.contains('Languages').should('be.visible');
    cy.contains('English').should('be.visible');
    
    // Verify top-level domain
    cy.contains('Top Level Domain').should('be.visible');
    cy.contains('.us').should('be.visible');
  });

  it('should navigate to a border country when clicked', () => {
    // Setup mock for Canada detail
    cy.intercept('GET', 'https://restcountries.com/v3.1/alpha/CAN', { fixture: 'canada-search.json' }).as('getCanadaDetail');
    
    // Visit USA country detail page
    cy.visit('/country/USA');
    cy.wait('@getUSADetail');
    
    // Find and click on Canada in the border countries section
    cy.contains('Canada').click();
    
    // Wait for Canada's details to load
    cy.wait('@getCanadaDetail');
    
    // Verify we're on Canada's detail page
    cy.url().should('include', '/country/CAN');
    cy.contains('Canada').should('be.visible');
    cy.contains('Ottawa').should('be.visible');
  });

  it('should format population numbers with commas correctly', () => {
    cy.visit('/country/USA');
    cy.wait('@getUSADetail');
    
    // Check that population is formatted correctly
    cy.contains('331,002,651').should('be.visible');
  });

 

  it('should display additional country information in the insights section', () => {
    cy.visit('/country/USA');
    cy.wait('@getUSADetail');
    
    // Check for the country insights section
    cy.contains('Country Insights').should('be.visible');
    
    // Check for additional information sections
    cy.contains('Area').should('be.visible');
    cy.contains('9,372,610').should('be.visible');
    
    // Check for timezones
    cy.contains('Timezones').should('be.visible');
    // Just check for one timezone to avoid fixture limitations
    cy.contains('UTC').should('be.visible');
  });

  it('should handle special UI elements and styles correctly', () => {
    cy.visit('/country/USA');
    cy.wait('@getUSADetail');
    
    // Check that the region badge is displayed
    cy.contains('Americas').should('be.visible');
    
    // Check that region-specific styling is applied
    // We can check for the existence of region-specific style classes
    // But since class names can change, we'll just verify the visual info
    cy.get('img[alt="Flag of United States"]').should('be.visible')
      .and('have.attr', 'src')
      .and('include', 'us.svg');
    
    // Check for visual elements like info boxes
    cy.get('.bg-white').should('exist');
    
    // Check for navigation elements
    cy.contains('Back to Countries').should('be.visible');
  });
   it('should toggle favorite status when logged in', () => {
    // Mock API call for toggling favorites
    cy.intercept('POST', 'http://localhost:5000/api/favorites', {
      statusCode: 200,
      body: { favoriteCountries: ['USA'] }
    }).as('addFavorite');
    
    cy.intercept('DELETE', 'http://localhost:5000/api/favorites/USA', {
      statusCode: 200,
      body: { favoriteCountries: [] }
    }).as('removeFavorite');
    
    // Visit country detail page
    cy.visit('/country/USA');
    cy.wait('@getUSADetail');
    
    // Find and click favorite button
    cy.contains('Add to Favorites').click();
    cy.wait('@addFavorite');
    
    // Verify button text changed
    cy.contains('Remove Favorite').should('be.visible');
    
    // Click again to toggle off
    cy.contains('Remove Favorite').click();
    cy.wait('@removeFavorite');
    
    // Verify button text changed back
    cy.contains('Add to Favorites').should('be.visible');
  });
});