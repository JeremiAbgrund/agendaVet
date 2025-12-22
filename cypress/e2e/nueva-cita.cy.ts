describe('Nueva cita flow', () => {
  it('creates an appointment with species and optional breed', () => {
    const unique = Date.now();
    const petName = `Cypress Pet ${unique}`;
    const dateStr = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    cy.visit('/', {
      onBeforeLoad: win => {
        win.localStorage.setItem(
          'agendavet_session',
          JSON.stringify({ email: 'demo@agendavet.cl', timestamp: new Date().toISOString() })
        );
      }
    });

    cy.visit('/nueva-cita');

    const typeIon = (sel: string, value: string) =>
      cy.get(sel, { includeShadowDom: true }).find('input, textarea').type(value, { force: true });

    typeIon('[data-cy="nuevacita-pet"]', petName);
    typeIon('[data-cy="nuevacita-owner"]', 'Cypress Owner');
    typeIon('[data-cy="nuevacita-type"]', 'Control general');

    cy.get('[data-cy="nuevacita-breed"]', { includeShadowDom: true })
      .find('input')
      .type('Mestizo', { force: true });

    cy.get('[data-cy="nuevacita-date"]', { includeShadowDom: true })
      .find('input')
      .type(dateStr, { force: true });

    cy.get('[data-cy="nuevacita-time"]', { includeShadowDom: true })
      .find('input')
      .type('12:30', { force: true });

    cy.contains('ion-button', 'Guardar cita').click({ force: true });

    cy.url({ timeout: 10000 }).should('include', '/listado');
    cy.contains(petName).should('exist');
  });
});
