describe('smoke test', () => {
  it('reacts to user clicks', () => {
    cy.visit('http://localhost:4200')

    cy.get('#avg-value').should('have.text', 'Avg: -');
    cy.get('#avg-sd-value').should('have.text', 'Avg (3 SD): -');
    cy.get('#internval-value').should('have.text', 'Interv Avg: -');
    cy.get('#sd-value').should('have.text', 'Standard Deviation (SD): -');

    cy.get('#tap-btn').click()
    cy.wait(1000)
    cy.get('#tap-btn').click()
    cy.wait(1000)
    cy.get('#tap-btn').click()

    cy.get('#avg-value').invoke('text').should('match', /^Avg: [\d\.]+ bpm$/)
    cy.get('#avg-sd-value').invoke('text').should('match', /^Avg \(3 SD\): [\d\.]+ bpm$/)
    cy.get('#internval-value').invoke('text').should('match', /^Interv Avg: [\d]+ ms$/)
    cy.get('#sd-value').invoke('text').should('match', /^Standard Deviation \(SD\): [\d]+ ms$/)

    cy.wait(1000)

    cy.get('#reset-link').click()

    cy.get('#avg-value').should('have.text', 'Avg: -');
    cy.get('#avg-sd-value').should('have.text', 'Avg (3 SD): -');
    cy.get('#internval-value').should('have.text', 'Interv Avg: -');
    cy.get('#sd-value').should('have.text', 'Standard Deviation (SD): -');

  })
})