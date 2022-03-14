describe("Live Rates", () => {
  before(() => {
    cy.visit("http://localhost:1917")
  })

  it("Should show loader", () => {
    cy.get('[data-testid="live-rates-loader"]')
  })

  it("Should show all currency pairs", () => {
    cy.contains("Live Rates")
    cy.get('[data-testid^="tile-"]').should("have.length", 9)
  })

  it("Should show tiles in analytics view", () => {
    cy.get('[data-testid="toggleButton"]').should(
      "have.attr",
      "data-qa-id",
      "workspace-view-Analytics",
    )
    cy.get('[data-testid="historical-graph"]').should("have.length", 9)
  })

  describe("When toggle view button", () => {
    it("Should show tiles in normal view", () => {
      cy.get('[data-testid="toggleButton"]')
        .click()
        .should("have.attr", "data-qa-id", "workspace-view-Normal")
      cy.get('[data-testid="historical-graph"]').should("have.length", 0)
    })
  })

  describe("Currency navigation", () => {
    ;["EUR", "USD", "GBP", "AUD", "NZD"].forEach((currency) => {
      describe(`When ${currency} is selected`, () => {
        before(() => {
          cy.get(`[data-testid="menuButton-${currency}"]`).click()
        })

        it(`Should show only ${currency} pairs`, () => {
          cy.get('[data-testid^="tile-"]').each((tile) => {
            expect(tile.text()).to.contain(currency)
          })
        })
      })
    })

    describe(`When ALL is selected`, () => {
      before(() => {
        cy.get(`[data-testid="menuButton-Symbol(all)"]`).click()
      })

      it("Should show all currency pairs", () => {
        cy.get('[data-testid^="tile-"]').should("have.length", 9)
      })
    })
  })
})
