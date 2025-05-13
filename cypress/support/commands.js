// Login command
Cypress.Commands.add('login', (username, password) => {
    // Implementation here
  });
  
  // Mock API command
  Cypress.Commands.add('mockAllCountries', () => {
    cy.intercept('GET', 'https://restcountries.com/v3.1/all', { 
      fixture: 'countries.json' 
    }).as('getAllCountries');
  });
  
  // Additional custom commands