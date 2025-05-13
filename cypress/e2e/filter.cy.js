// cypress/e2e/filter.cy.js
describe('Filter Tests', () => {
  beforeEach(() => {
    // Visit the homepage before each test
    cy.visit('/');
    
    // Mock API response for all countries
    cy.intercept('GET', 'https://restcountries.com/v3.1/all', { fixture: 'countries.json' }).as('getAllCountries');
  });

  it('should filter countries by region', () => {
    // Mock the response for filtered countries
    cy.intercept('GET', 'https://restcountries.com/v3.1/region/Europe', { fixture: 'europe-countries.json' }).as('getEuropeCountries');
    
    // Wait for the initial countries to load
    cy.wait('@getAllCountries');
    
    // Select Europe from the dropdown
    cy.get('select').select('Europe');
    
    // Wait for the filtered countries to load
    cy.wait('@getEuropeCountries');
    
    // Verify that only European countries are displayed
    cy.get('[data-testid="country-card"]').each(($card) => {
      cy.wrap($card).find('[data-region="Europe"]').should('exist');
    });
    
    // Verify that a known European country is displayed
    cy.contains('France').should('be.visible');
    
    // Verify that a non-European country is not displayed
    cy.contains('United States').should('not.exist');
  });

  it('should reset filters when "All" is selected', () => {
    // Wait for the initial countries to load
    cy.wait('@getAllCountries');
    
    // First filter by Europe
    cy.intercept('GET', 'https://restcountries.com/v3.1/region/Europe', { fixture: 'europe-countries.json' }).as('getEuropeCountries');
    cy.get('select').select('Europe');
    cy.wait('@getEuropeCountries');
    
    // Then reset by selecting "All"
    cy.intercept('GET', 'https://restcountries.com/v3.1/all', { fixture: 'countries.json' }).as('resetCountries');
    cy.get('select').select('All');
    cy.wait('@resetCountries');
    
    // Verify that countries from different regions are displayed
    cy.contains('United States').should('be.visible');
    cy.contains('France').should('be.visible');
  });

  it('should handle empty region results gracefully', () => {
    // Mock an empty region response
    cy.intercept('GET', 'https://restcountries.com/v3.1/region/EmptyRegion', {
      statusCode: 404,
      body: []
    }).as('emptyRegion');
    
    // Wait for the initial countries to load
    cy.wait('@getAllCountries');
    
    // Simulate selecting a region with no countries
    cy.get('select').invoke('val', 'EmptyRegion').trigger('change');
    
    // Wait for the API call to complete
    cy.wait('@emptyRegion');
    
    // Verify empty state is displayed
    cy.contains('No countries found').should('be.visible');
  });
});