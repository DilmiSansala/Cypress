// cypress/e2e/auth.cy.js
describe('Authentication Tests', () => {
    beforeEach(() => {
      // Clear localStorage before each test
      cy.clearLocalStorage();
    });
  
    it('should allow a user to login with valid credentials', () => {
      // Mock the login API response
      cy.intercept('POST', 'http://localhost:5000/api/login', {
        statusCode: 200,
        body: {
          user: {
            id: '1',
            username: 'dilmi'
          },
          token: 'fake-jwt-token'
        }
      }).as('loginRequest');
      
      // Visit the login page
      cy.visit('/login');
      
      // Fill in the login form
      cy.get('input[placeholder="Enter your username"]').type('dilmi');
      cy.get('input[placeholder="Enter your password"]').type('password123');
      
      // Submit the form
      cy.contains('button', 'Sign In').click();
      
      // Wait for the login API call to complete
      cy.wait('@loginRequest');
      
      // Verify redirection to homepage
      cy.url().should('eq', Cypress.config().baseUrl + '/');
      
      // Verify user is logged in (username displayed in navbar)
      cy.contains('dilmi').should('be.visible');
      cy.contains('Logout').should('be.visible');
      
      // Verify localStorage has the token
      cy.window().then((window) => {
        expect(window.localStorage.getItem('token')).to.exist;
      });
    });
  
    it('should show error message with invalid credentials', () => {
      // Mock failed login API response
      cy.intercept('POST', 'http://localhost:5000/api/login', {
        statusCode: 401,
        body: {
          message: 'Invalid credentials'
        }
      }).as('failedLoginRequest');
      
      // Visit the login page
      cy.visit('/login');
      
      // Fill in the login form with invalid credentials
      cy.get('input[placeholder="Enter your username"]').type('wronguser');
      cy.get('input[placeholder="Enter your password"]').type('wrongpass');
      
      // Submit the form
      cy.contains('button', 'Sign In').click();
      
      // Wait for the login API call to complete
      cy.wait('@failedLoginRequest');
      
      // Verify error message is displayed
      cy.contains('Invalid credentials').should('be.visible');
      
      // Verify we're still on the login page
      cy.url().should('include', '/login');
      
      // Verify localStorage doesn't have the token
      cy.window().then((window) => {
        expect(window.localStorage.getItem('token')).to.be.null;
      });
    });
  
    it('should allow a user to register a new account', () => {
      // Mock the register API response
      cy.intercept('POST', 'http://localhost:5000/api/register', {
        statusCode: 201,
        body: {
          user: {
            id: '2',
            username: 'newuser'
          },
          token: 'new-fake-jwt-token'
        }
      }).as('registerRequest');
      
      // Visit the register page
      cy.visit('/register');
      
      // Fill in the registration form
      cy.get('input[placeholder="Choose a username"]').type('newuser');
      cy.get('input[placeholder="Create a password"]').type('password123');
      cy.get('input[placeholder="Confirm your password"]').type('password123');
      
      // Submit the form
      cy.contains('button', 'Register').click();
      
      // Wait for the register API call to complete
      cy.wait('@registerRequest');
      
      // Verify redirection to login page
      cy.url().should('include', '/login');
    });
  
    it('should allow a user to logout', () => {
      // Set up initial authenticated state
      cy.window().then((window) => {
        window.localStorage.setItem('token', 'fake-jwt-token');
        window.localStorage.setItem('user', JSON.stringify({ id: '1', username: 'dilmi' }));
      });
      
      // Visit the homepage as logged in user
      cy.visit('/');
      
      // Verify user is logged in
      cy.contains('dilmi').should('be.visible');
      
      // Click logout button
      cy.contains('button', 'Logout').click();
      
      // Verify user is logged out
      cy.contains('Login').should('be.visible');
      cy.contains('dilmi').should('not.exist');
      
      // Verify localStorage has been cleared
      cy.window().then((window) => {
        expect(window.localStorage.getItem('token')).to.be.null;
        expect(window.localStorage.getItem('user')).to.be.null;
      });
    });
  });