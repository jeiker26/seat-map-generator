describe('Embed Page', () => {
  describe('Loading State', () => {
    it('should show loading state initially', () => {
      cy.intercept('GET', '**/api/maps/*', {
        delay: 2000,
        statusCode: 200,
        body: { success: true, data: {} },
      }).as('getMap')

      cy.visit('/embed/test-map-001')
      cy.contains('Loading...').should('be.visible')
    })
  })

  describe('Error State', () => {
    it('should show error when map is not found', () => {
      cy.intercept('GET', '**/api/maps/*', {
        statusCode: 404,
        body: { success: false, error: 'Not found' },
      }).as('getMapNotFound')

      cy.visit('/embed/non-existent-map')
      cy.wait('@getMapNotFound')
      cy.contains('Map not found').should('be.visible')
    })

    it('should show error when API fails', () => {
      cy.intercept('GET', '**/api/maps/*', {
        statusCode: 500,
        body: { success: false, error: 'Internal server error' },
      }).as('getMapError')

      cy.visit('/embed/test-map-001')
      cy.wait('@getMapError')
      cy.get('div').should('contain.text', 'Map not found')
    })
  })

  describe('Successful Load', () => {
    beforeEach(() => {
      cy.fixture('seatmap.json').then((seatMapData) => {
        cy.intercept('GET', '**/api/maps/test-map-001', {
          statusCode: 200,
          body: { success: true, data: seatMapData },
        }).as('getMap')
      })

      cy.visit('/embed/test-map-001')
      cy.wait('@getMap')
    })

    it('should display the seat map title', () => {
      cy.title().should('eq', 'Test Venue - Seat Map')
    })

    it('should render the canvas', () => {
      // Konva canvas is dynamically loaded, allow extra time
      cy.get('.konvajs-content', { timeout: 15000 }).should('exist')
    })

    it('should have noindex meta tag', () => {
      cy.get('meta[name="robots"]').should('have.attr', 'content', 'noindex')
    })
  })

  describe('Edit Map Page - Loading', () => {
    it('should show loading state for edit page', () => {
      cy.intercept('GET', '**/api/maps/*', {
        delay: 2000,
        statusCode: 200,
        body: { success: true, data: {} },
      }).as('getMapEdit')

      cy.visit('/editor/test-map-001')
      cy.contains('Loading...').should('be.visible')
    })

    it('should show error and create new map button on edit page when map not found', () => {
      cy.intercept('GET', '**/api/maps/*', {
        statusCode: 404,
        body: { success: false, error: 'Not found' },
      }).as('getMapNotFound')

      cy.visit('/editor/test-map-001')
      cy.wait('@getMapNotFound')
      cy.contains('Map not found').should('be.visible')
      cy.get('button').contains('Create New Map').should('be.visible')
    })

    it('should navigate to new editor when Create New Map is clicked on error page', () => {
      cy.intercept('GET', '**/api/maps/*', {
        statusCode: 404,
        body: { success: false, error: 'Not found' },
      }).as('getMapNotFound')

      cy.visit('/editor/test-map-001')
      cy.wait('@getMapNotFound')
      cy.get('button').contains('Create New Map').click()
      cy.url().should('include', '/editor')
    })

    it('should load editor with map data when API succeeds', () => {
      cy.fixture('seatmap.json').then((seatMapData) => {
        cy.intercept('GET', '**/api/maps/test-map-001', {
          statusCode: 200,
          body: { success: true, data: seatMapData },
        }).as('getMap')
      })

      cy.visit('/editor/test-map-001')
      cy.wait('@getMap')
      cy.title().should('eq', 'Edit Map - Seat Map Generator')
      cy.get('button').contains('Select').should('be.visible')
    })
  })
})
