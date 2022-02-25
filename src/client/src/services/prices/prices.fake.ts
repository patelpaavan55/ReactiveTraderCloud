import { PriceTick, PricingService } from "@/generated/TradingGateway"
import { Observable, of } from "rxjs"

function* makePriceGenerator(
  symbol: string,
): Generator<PriceTick, PriceTick, PriceTick> {
  let mid = Math.trunc(Math.random() * 1_000_000) / 100_000
  while (true) {
    const now = new Date()
    const price: PriceTick = {
      ask: mid + 0.0002,
      mid,
      bid: mid - 0.0002,
      // @ts-ignore
      creationTimestamp: now.getTime(),
      symbol,
      valueDate: [now.getFullYear(), now.getMonth() + 1, now.getDate()]
        .map((x) => x.toString().padStart(2, "0"))
        .join("-"),
    }
    yield price
    mid = mid * (1 + (Math.random() > 0.5 ? 0.0001 : -0.0001))
  }
}

let generators: { [key: string]: Generator<PriceTick, PriceTick, PriceTick> } =
  {}

function getPriceGenerator(symbol: string) {
  if (!generators[symbol]) {
    generators[symbol] = makePriceGenerator(symbol)
  }
  return generators[symbol]
}

export const getPriceHistory: typeof PricingService.getPriceHistory = ({
  symbol,
}) => {
  const priceGenerator = getPriceGenerator(symbol)
  let prices: PriceTick[] = []
  for (let i = 0; i < 50; i++) {
    prices.push(priceGenerator.next().value)
  }
  return of({ prices })
}

export const getPriceUpdates: typeof PricingService.getPriceUpdates = ({
  symbol,
}) => {
  return new Observable<PriceTick>((observer) => {
    const priceGenerator = getPriceGenerator(symbol)
    let token: any = 0

    const scheduleNextPrice = () => {
      token = setTimeout(() => {
        let price: PriceTick

        if (pricingServiceControls.staticPrice) {
          price = pricingServiceControls.staticPrice
        } else {
          price = priceGenerator.next().value
        }

        observer.next(price)
        scheduleNextPrice()
      }, Math.max(150, Math.random() * 1000))
    }

    scheduleNextPrice()

    return () => {
      clearTimeout(token)
    }
  })
}

export const pricingServiceControls: {
  staticPrice?: PriceTick
} = {
  staticPrice: undefined,
}
