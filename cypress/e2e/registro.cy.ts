describe('Registro flow', () => {
  it('creates an account and redirects to login', () => {
    const unique = Date.now();
    const email = `test${unique}@example.com`;

    cy.visit('/registro');

    cy.get('[formcontrolname="ownerName"] input').type('Cypress Tester');
    cy.get('[formcontrolname="email"] input').type(email);
    cy.get('[formcontrolname="password"] input').type('password1');
    cy.get('[formcontrolname="clinic"] input').type('Clinica Cypress');
    cy.get('[formcontrolname="phone"] input').type('+56912345678');

    // Accept terms by clicking the label
    cy.contains('Acepto el uso de mis datos').click();

    cy.contains('Crear cuenta').click();

    // After submit, should navigate to login and show toast
    cy.url({ timeout: 8000 }).should('include', '/login');
    cy.contains('Cuenta creada', { timeout: 6000 }).should('exist');

    // session key saved in localStorage
    cy.window().then(win => {
      const raw = win.localStorage.getItem('agendavet_session');
      expect(raw).to.be.a('string');
      const session = JSON.parse(raw || '{}');
      expect(session.email).to.equal(email);
    });
  });
});