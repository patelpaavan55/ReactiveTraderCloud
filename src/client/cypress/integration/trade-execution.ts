import { format } from "date-fns"
import { InlineFakeHost, HydraHandler } from "../../src/hydra-fake"
import { services } from "../../src/services/services.fake"
import { pricingServiceControls } from "../../src/services/prices/prices.fake"

const startFakeEnv = () => {
  // Setup configuration for websocket endpoint
  // Cypress.on("window:before:load", async (win) => {
  //   window.localStorage.setItem("feature-hydra-use-json", "true");
  //   window.configOverrides = window.configOverrides || {};
  //   window.configOverrides.backendUrl = "http://localhost:5555";
  // });

  console.log("Starting fake env")

  const hydra = new HydraHandler()
  console.log("hydra", hydra)
  services.forEach((svc) => hydra.subscribe(svc))
  console.log("services", services)
  const host = new InlineFakeHost(hydra, "http://localhost:5555/json")
  console.log("host", host)

  return {
    dispose: () => host.dispose(),
    host,
  }
}

const getTile = (symbol: string) => cy.get(`[data-testid="tile-${symbol}"]`)

const directionMap = {
  BUY: "bought",
  SELL: "sold",
}

const executeTrade = (symbol: string, direction: "BUY" | "SELL") =>
  it("Should show executing loader", () => {
    getTile(symbol).contains(direction).click()
    getTile(symbol).contains("Executing")
  })

const tradeResponse = (
  symbol: string,
  direction: "BUY" | "SELL",
  base: string,
  notional: string,
  rate: number,
) =>
  it("Should show successful trade response details", () => {
    getTile(symbol).contains(
      `You ${directionMap[direction]} ${base} ${notional} at a rate of ${rate}`,
    )
    // TODO - Assert on trade id, rate, price and spot when we mock the api
  })

const closeTradeReponse = (
  symbol: string,
  direction: "BUY" | "SELL",
  base: string,
  notional: string,
) =>
  it("Should close execution response", () => {
    getTile(symbol).contains("Close").click()
    getTile(symbol).should(
      "not.contain",
      `You ${directionMap[direction]} ${base} ${notional}`,
    )
  })

describe("Trade Execution", async () => {
  const { host } = await startFakeEnv()
  const symbol = "EURUSD"

  const loadLiveRates = () => {
    // cy.visit("https://web.dev.reactivetrader.com/")
    cy.visit("http://localhost:1917", {
      onBeforeLoad: (win) => {
        const originalWs = win.WebSocket
        ;(win as any).WebSocket = function (url: string, protocols: any) {
          console.log("url", url)
          if (url === "ws://localhost:1917/") {
            // This is webpack live reload
            return new originalWs(url, protocols)
          }
          return new host.Websocket(url, protocols)
        }
      },
    })
    cy.contains("Live Rates")
  }

  before(loadLiveRates)

  it("Should show spot date", () => {
    // TODO - Date should come from api mock
    getTile(symbol).contains(
      `SPT (${format(new Date(), "dd MMM").toUpperCase()})`,
    )
  })

  it("Should show bid and ask price", () => {
    // TODO - Assert on prices when we mock the api
    expect(true).to.equal(true)
  })

  it("Should tick price", () => {
    getTile(symbol)
      .find('[direction="Sell"]')
      .then(($button) => {
        const val = $button.text().replace("SELL", "")
        getTile(symbol)
          .find('[direction="Sell"]')
          .should(($button) => {
            const newVal = $button.text().replace("SELL", "")
            expect(newVal).not.to.eq(val)
          })
      })
  })

  it("Should format notional input", () => {
    getTile(symbol).find("input").type("500000").should("have.value", "500,000")
  })

  it("Should reset notional", () => {
    cy.get(`[data-testid="notional-reset-${symbol}"]`).click()
    getTile(symbol).find("input").should("have.value", "1,000,000")
  })

  describe.only("When executing a trade", () => {
    beforeEach(() => {
      pricingServiceControls.staticPrice = {
        ask: 1.1,
        bid: 1.08,
        mid: 1.09,
        symbol,
        // @ts-ignore
        creationTimestamp: new Date(),
        valueDate: new Date().toString(),
      }
    })

    executeTrade(symbol, "BUY")
    tradeResponse(symbol, "BUY", "EUR", "1,000,000", 1.1)
    closeTradeReponse(symbol, "BUY", "EUR", "1,000,000")
  })

  describe("When symbol can not be traded", () => {
    const symbol = "GBPJPY"

    executeTrade(symbol, "BUY")

    it("Should show rejected trade response details", () => {
      getTile(symbol).contains("Your trade has been rejected")
    })

    it("Should close execution response", () => {
      getTile(symbol).contains("Close").click()
      getTile(symbol).should("not.contain", "Your trade has been rejected")
    })
  })

  describe("When execution takes a long time", () => {
    const symbol = "EURJPY"

    executeTrade(symbol, "BUY")

    it("Should show a warning message after 3 seconds", () => {
      // TODO - cypress default timeout means this assertion is successful but we should be able to test the timeout explicitly
      // cy.clock()
      // cy.tick(3000)
      // getTile(symbol).contains('Trade execution taking longer than expected', { timeout: 1 })
      getTile(symbol).contains("Trade execution taking longer than expected")
    })

    tradeResponse(symbol, "BUY", "EUR", "1,000,000", 0)
    closeTradeReponse(symbol, "BUY", "EUR", "1,000,000")
  })

  describe("When executing a trade over limit", () => {
    it("Should show RFQ initiation", () => {
      getTile(symbol)
        .find("input")
        .type("11000000")
        .should("have.value", "11,000,000")
      getTile(symbol).contains("Initiate RFQ")
    })

    it("Should disable buy and sell buttons", () => {
      getTile(symbol).contains("BUY").should("be.disabled")
      getTile(symbol).contains("SELL").should("be.disabled")
    })

    describe("When reset button is clicked", () => {
      it("Should not show RFQ initiation", () => {
        cy.get(`[data-testid="notional-reset-${symbol}"]`).click()
        getTile(symbol).should("not.have.text", "Initiate RFQ")
      })

      it("Should reset notional to 1,000,000", () => {
        getTile(symbol).find("input").should("have.value", "1,000,000")
      })

      it("Should re-enable buy and sell buttons", () => {
        getTile(symbol).contains("BUY").should("not.be.disabled")
        getTile(symbol).contains("SELL").should("not.be.disabled")
      })
    })
  })

  describe("RFQ", () => {
    const symbol = "NZDUSD"

    it("Should have disabled bid and ask buttons", () => {
      getTile(symbol).contains("BUY").should("be.disabled")
      getTile(symbol).contains("SELL").should("be.disabled")
    })

    describe("When RFQ is initiated", () => {
      it("Should show awaiting price", () => {
        getTile(symbol).contains("Initiate RFQ").click()
        getTile(symbol).contains("Awaiting Price")
      })

      it("Should show cancel button", () => {
        getTile(symbol).contains("Cancel RFQ")
        getTile(symbol).should("not.contain", "Initiate RFQ")
      })

      it("Should enable bid and ask buttons with price", () => {
        getTile(symbol).contains("BUY").should("not.be.disabled")
        getTile(symbol).contains("SELL").should("not.be.disabled")
        // TODO - Assert on prices
      })

      it("Should show reject button", () => {
        getTile(symbol).contains("Reject")
        getTile(symbol).should("not.contain", "Cancel RFQ")
      })

      describe("When trade is executed", () => {
        executeTrade(symbol, "BUY")
        tradeResponse(symbol, "BUY", "NZD", "10,000,000", 0)
        closeTradeReponse(symbol, "BUY", "NZD", "10,000,000")
      })
    })

    describe("When RFQ is cancelled", () => {
      it("Should show initiate RFQ button", () => {
        getTile(symbol).contains("Initiate RFQ").click()
        getTile(symbol).contains("Cancel RFQ").click()
        getTile(symbol).contains("Initiate RFQ")
        getTile(symbol).should("not.contain", "Cancel RFQ")
      })
    })

    describe("When RFQ is rejected", () => {
      it("Should show Requote button", () => {
        getTile(symbol).contains("Initiate RFQ").click()
        getTile(symbol).contains("Reject").click()
        getTile(symbol).contains("Requote")
        getTile(symbol).should("not.contain", "Reject")
      })

      it("Should show initiate RFQ button", () => {
        getTile(symbol).should("not.contain", "Requote")
        getTile(symbol).contains("Initiate RFQ")
      })
    })
  })
})

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

  describe("Price ticking", () => {
    ;[
      "EURUSD",
      "USDJPY",
      "GBPUSD",
      "GBPJPY",
      "EURJPY",
      "AUDUSD",
      "NZDUSD",
      "EURCAD",
      "EURAUD",
    ].forEach((symbol) =>
      it(`Should tick ${symbol} price`, () => {
        getTile(symbol)
          .find('[direction="Sell"]')
          .then(($button) => {
            const val = $button.text().replace("SELL", "")
            getTile(symbol)
              .find('[direction="Sell"]')
              .should(($button) => {
                const newVal = $button.text().replace("SELL", "")
                expect(newVal).not.to.eq(val)
              })
          })
      }),
    )
  })
})
