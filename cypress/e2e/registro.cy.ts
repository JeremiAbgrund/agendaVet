describe('Registro flow', () => {
  it('creates an account and redirects to login', () => {
    const unique = Date.now();
    const email = `test${unique}@example.com`;

    cy.visit('/registro');

    const typeIon = (sel: string, value: string) =>
      cy.get(sel, { includeShadowDom: true }).find('input').type(value);

    typeIon('ion-input[data-cy="registro-owner"]', 'Cypress Tester');
    typeIon('ion-input[data-cy="registro-email"]', email);
    typeIon('ion-input[data-cy="registro-password"]', 'password1');
    typeIon('ion-input[data-cy="registro-clinic"]', 'Clinica Cypress');
    typeIon('ion-input[data-cy="registro-phone"]', '+56912345678');

    // Accept terms by clicking the label
    cy.get('[data-cy="registro-terms"]').click({ force: true });

    cy.get('[data-cy="registro-submit"]').click();

    // After submit, should navigate to login (toast puede desaparecer rápido)
    cy.url({ timeout: 10000 }).should('include', '/login');

    // session key saved in localStorage
    cy.window().then(win => {
      const raw = win.localStorage.getItem('agendavet_session');
      expect(raw).to.be.a('string');
      const session = JSON.parse(raw || '{}');
      expect(session.email).to.equal(email);
    });
  });
});
