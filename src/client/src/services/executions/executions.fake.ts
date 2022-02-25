import { Observable, race, timer } from "rxjs"
import { map, mapTo, tap } from "rxjs/operators"
import {
  ExecuteTradeRequest,
  ExecutionService,
  Trade,
  TradeStatus,
} from "../../generated/TradingGateway"
import { fakeTrades$ } from "../trades/trades.fake"
import {
  DELAYED_CURRENCY,
  EXECUTION_TIMEOUT_VALUE,
  REJECTED_CURRENCY,
} from "./constants"

let id = 1

export const executeTrade: typeof ExecutionService.executeTrade = (
  input: ExecuteTradeRequest,
) => {
  const newTrade: Trade = {
    ...input,
    // @ts-ignore
    tradeId: id++,
    status:
      input.currencyPair === REJECTED_CURRENCY
        ? TradeStatus.Rejected
        : TradeStatus.Done,
    valueDate: new Date().toString(),
    tradeDate: new Date().toString(),
  }

  const execution$: Observable<Trade> = timer(
    input.currencyPair === DELAYED_CURRENCY ? 4_000 : Math.random() * 2_000,
  ).pipe(mapTo(newTrade))

  const timeout$: Observable<Trade> = timer(EXECUTION_TIMEOUT_VALUE).pipe(
    mapTo({
      ...newTrade,
      status: TradeStatus.Rejected,
    }),
  )

  return race([execution$, timeout$]).pipe(
    map((trade) => ({ trade })),
    tap((response) => {
      fakeTrades$.next(response.trade)
    }),
  )
}
