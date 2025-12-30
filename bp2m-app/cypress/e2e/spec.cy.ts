describe('BPM App E2E Test', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should display the initial empty state', () => {
    cy.contains('Start tapping to measure BPM...').should('be.visible');
    cy.get('.stats-grid').should('not.exist');
    cy.get('.chart-card').should('not.exist');
  });

  it('should allow tapping and display stats and chart', () => {
    // Tap the button 3 times with 1-second intervals for a 60bpm reading
    cy.get('#tap-btn').click();
    cy.wait(1000);
    cy.get('#tap-btn').click();
    cy.wait(1000);
    cy.get('#tap-btn').click();


    // Check that stats are visible
    cy.get('.stats-grid').should('be.visible');

    // Check for each stat card and that it contains the expected value
    
    cy.get('.stat-card').contains('Average BPM').siblings('.stat-value').invoke('text').should('match', /^[\d\.]+ bpm$/);
    cy.get('.stat-card').contains('Filtered BPM').siblings('.stat-value').invoke('text').should('match', /^[\d\.]+ bpm$/);
    cy.get('.stat-card').contains('Interval').siblings('.stat-value').invoke('text').should('match', /^[\d]+ ms$/);
    cy.get('.stat-card').contains('Deviation').siblings('.stat-value').invoke('text').should('match', /^[\d]+ ms$/);

    // Check that the chart is visible
    cy.get('.chart-card').should('be.visible');
    cy.get('.chart-wrapper canvas').should('be.visible');

    // Check the header info
    cy.get('.chart-info').invoke('text').should('match', /^2 beat\(s\) over [\d\.]+s$/);
  });

  it('should reset the data when reset link is clicked', () => {
    // Tap a few times to generate data
    cy.get('#tap-btn').click();
    cy.wait(500);
    cy.get('#tap-btn').click();
    cy.get('.stats-grid').should('be.visible');

    // Click reset
    cy.get('.reset-link').click();

    // Verify it's back to the initial state
    cy.contains('Start tapping to measure BPM...').should('be.visible');
    cy.get('.stats-grid').should('not.exist');
    cy.get('.chart-card').should('not.exist');
  });

  it('should respond to spacebar presses', () => {
    // Press spacebar
    cy.get('body').type(' ');
    cy.wait(1000);
    cy.get('body').type(' ');

    // Check that stats are visible
    cy.get('.stats-grid').should('be.visible');
    cy.get('.chart-info').invoke('text').should('match', /^1 beat\(s\) over [\d\.]+s$/);
    cy.get('.stat-card').contains('Average BPM').siblings('.stat-value').invoke('text').should('match', /^[\d\.]+ bpm$/);
  });

  it('should toggle dark mode and persist preference', () => {
    cy.get('app-root').should('not.have.class', 'dark-mode');

    cy.get('.theme-toggle').click();
    cy.get('app-root').should('have.class', 'dark-mode');
    cy.window().then((win) => expect(win.localStorage.getItem('theme')).to.equal('dark'));

    cy.reload();
    cy.get('app-root').should('have.class', 'dark-mode');
    cy.window().then((win) => expect(win.localStorage.getItem('theme')).to.equal('dark'));
  });
});