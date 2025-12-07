// This is the Cypress support file
//
// You can add custom commands here or configure Cypress
// See https://on.cypress.io/configuration

// Example custom command
Cypress.Commands.add('login', (username, password) => {
  cy.visit('/login');
  cy.get('#username').type(username);
  cy.get('#password').type(password);
  cy.get('form').submit();
});