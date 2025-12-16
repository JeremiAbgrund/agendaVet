describe('Contacto form', () => {
  it('submits a support request and shows it in history', () => {
    const unique = Date.now();
    const email = `cypress${unique}@example.com`;
    const message = `Mensaje de prueba desde Cypress ${unique}`;

    cy.visit('/contacto');

    cy.get('[formcontrolname="fullName"] input').type('Cypress Usuario');
    cy.get('[formcontrolname="email"] input').type(email);
    cy.get('[formcontrolname="phone"] input').type('+56900000000');

    // Select topic
    cy.get('mat-select[formcontrolname="topic"]').click();
    cy.get('mat-option').contains('Agendamiento').click();

    // Fill message
    cy.get('[formcontrolname="message"]').type(message);

    // Ensure toggle for CC is unchecked then check it
    cy.get('mat-slide-toggle[formcontrolname="ccCopy"]').click();

    cy.contains('Enviar solicitud').click();

    // Confirm toast and that history updated
    cy.contains('Hemos recibido tu solicitud', { timeout: 6000 }).should('exist');

    // The new request should appear in the history list
    cy.get('.history-card', { timeout: 6000 }).should('contain', message);
  });
});