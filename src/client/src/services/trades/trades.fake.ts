import { BlotterService, Trade, TradeUpdates } from "@/generated/TradingGateway"
import { Subject } from "rxjs"
import { scan, startWith } from "rxjs/operators"

export const fakeTrades$ = new Subject<Trade>()

const fakeTradeStream: TradeUpdates = {
  updates: [],
  isStateOfTheWorld: true,
  isStale: false,
}

export const getTradeStream: typeof BlotterService.getTradeStream = () => {
  return fakeTrades$.pipe(
    scan((acc, value) => {
      acc.updates.push(value)
      acc.isStateOfTheWorld = false
      return acc
    }, fakeTradeStream),
    startWith(fakeTradeStream),
  )
}
