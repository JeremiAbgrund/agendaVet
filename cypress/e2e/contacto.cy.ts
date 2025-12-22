describe('Contacto form', () => {
  it('submits a support request and shows it in history', () => {
    cy.viewport(1280, 800);
    const unique = Date.now();
    const email = `cypress${unique}@example.com`;
    const message = `Mensaje de prueba desde Cypress ${unique}`;

    // Pre-sembrar sesión para pasar el AuthGuard
    cy.visit('/', {
      onBeforeLoad: win => {
        win.localStorage.setItem(
          'agendavet_session',
          JSON.stringify({ email: 'demo@agendavet.cl', timestamp: new Date().toISOString() })
        );
      }
    });
    cy.visit('/contacto');

    const typeIon = (sel: string, value: string) =>
      cy.get(sel, { includeShadowDom: true }).find('input').type(value, { force: true });

    typeIon('ion-input[data-cy="contact-fullname"]', 'Cypress Usuario');
    typeIon('ion-input[data-cy="contact-email"]', email);
    typeIon('ion-input[data-cy="contact-phone"]', '+56900000000');

    // Select topic
    cy.get('[data-cy="contact-topic"]').scrollIntoView().click({ force: true });
    cy.get('mat-option').contains('Agendamiento').click({ force: true });

    // Fill message
    cy.get('[data-cy="contact-message"]').type(message);

    // Ensure toggle for CC is unchecked then check it
    cy.get('[data-cy="contact-ccCopy"]').click();

    cy.get('[data-cy="contact-submit"]').click();

    // Confirm toast and that history updated
    cy.contains('Hemos recibido tu solicitud', { timeout: 6000 }).should('exist');

    // The new request should appear in the history list
    cy.get('.history-card', { timeout: 6000 }).should('contain', message);
  });
});
