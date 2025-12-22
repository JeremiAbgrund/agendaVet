describe('Login E2E', () => {
  it('uses demo credentials and logs in', () => {
    cy.visit('/');
    // ensure redirected to login
    cy.url().should('include', '/login');
    // click 'Usar demo' to fill demo credentials
    cy.get('[data-cy="login-use-demo"]').click();
    // click ingresar
    cy.get('[data-cy="login-submit"]').click();
    // after successful login, we expect to land on /home
    cy.url({ timeout: 10000 }).should('include', '/home');
    // check for a known element on home page
    cy.contains('h1', /Hoy tienes/i).should('exist');
  });
});
