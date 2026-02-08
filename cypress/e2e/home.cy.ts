describe('Home Page', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should display the page title', () => {
    cy.get('h1').should('contain.text', 'Seat Map Generator')
  })

  it('should display the subtitle', () => {
    cy.get('p').should('contain.text', 'Create, edit, and embed interactive seat maps')
  })

  it('should have a CTA button that links to the editor', () => {
    cy.get('a').contains('Create New Map').should('have.attr', 'href', '/editor')
  })

  it('should navigate to the editor when CTA is clicked', () => {
    cy.get('a').contains('Create New Map').click()
    cy.url().should('include', '/editor')
  })

  it('should have correct meta title', () => {
    cy.title().should('eq', 'Seat Map Generator')
  })
})
