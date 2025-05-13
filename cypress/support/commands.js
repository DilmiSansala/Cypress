// cypress/support/commands.js

// Login custom command
Cypress.Commands.add('login', (username, password) => {
  cy.intercept('POST', 'http://localhost:5000/api/login', {
    statusCode: 200,
    body: {
      user: {
        id: '1',
        username: username
      },
      token: 'fake-jwt-token'
    }
  }).as('loginRequest');
  
  cy.visit('/login');
  cy.get('input[placeholder="Enter your username"]').type(username);
  cy.get('input[placeholder="Enter your password"]').type(password);
  cy.contains('button', 'Sign In').click();
  cy.wait('@loginRequest');
});

// Set authenticated user state
Cypress.Commands.add('setAuthenticatedUser', (username = 'dilmi', id = '1') => {
  cy.window().then((window) => {
    window.localStorage.setItem('token', 'fake-jwt-token');
    window.localStorage.setItem('user', JSON.stringify({ id, username }));
    window.localStorage.setItem('favoriteCountries', JSON.stringify(['USA', 'FRA']));
  });
});

// Mock all countries API
Cypress.Commands.add('mockAllCountries', () => {
  cy.intercept('GET', 'https://restcountries.com/v3.1/all', { 
    fixture: 'countries.json' 
  }).as('getAllCountries');
});

// Mock country by code
Cypress.Commands.add('mockCountryByCode', (code, fixture) => {
  cy.intercept('GET', `https://restcountries.com/v3.1/alpha/${code}`, { 
    fixture: fixture || 'usa-detail.json' 
  }).as(`getCountry${code}`);
});

// Mock favorites 
Cypress.Commands.add('mockFavorites', (favorites = ['USA', 'FRA']) => {
  cy.intercept('GET', 'http://localhost:5000/api/favorites', {
    statusCode: 200,
    body: { favoriteCountries: favorites }
  }).as('getFavorites');
});

// Verify country card
Cypress.Commands.add('verifyCountryCard', (countryName) => {
  cy.contains(countryName)
    .closest('[data-testid="country-card"]')
    .should('be.visible');
});