module.exports = function(url) {
    beforeEach(function() {
        cy.visit(url);
    });

    it('Should replace the iframe with a div, preserving id attribute.', function() {
        cy.get('#roo')
            .should('have.id', 'roo')
            .and('have.prop', 'tagName' )
            .should('eq', 'DIV');
    });

    it('Should have only one div on the page', function() {
        cy.get('div')
            .should('have.length', 1);
    });
}