import {
  ADDED_CURRENCY_PAIR_UPDATE,
  CurrencyPairUpdates,
  ReferenceDataService,
} from "../../generated/TradingGateway"
import { of } from "rxjs"

const fakeCurrencyPairUpdates: CurrencyPairUpdates = {
  updates: [
    {
      type: ADDED_CURRENCY_PAIR_UPDATE,
      payload: { symbol: "EURUSD", ratePrecision: 5, pipsPosition: 4 },
    },
    {
      type: ADDED_CURRENCY_PAIR_UPDATE,
      payload: { symbol: "USDJPY", ratePrecision: 3, pipsPosition: 2 },
    },
    {
      type: ADDED_CURRENCY_PAIR_UPDATE,
      payload: { symbol: "GBPUSD", ratePrecision: 5, pipsPosition: 4 },
    },
    {
      type: ADDED_CURRENCY_PAIR_UPDATE,
      payload: { symbol: "GBPJPY", ratePrecision: 3, pipsPosition: 2 },
    },
    {
      type: ADDED_CURRENCY_PAIR_UPDATE,
      payload: { symbol: "EURJPY", ratePrecision: 3, pipsPosition: 2 },
    },
    {
      type: ADDED_CURRENCY_PAIR_UPDATE,
      payload: { symbol: "AUDUSD", ratePrecision: 5, pipsPosition: 4 },
    },
    {
      type: ADDED_CURRENCY_PAIR_UPDATE,
      payload: { symbol: "NZDUSD", ratePrecision: 5, pipsPosition: 4 },
    },
    {
      type: ADDED_CURRENCY_PAIR_UPDATE,
      payload: { symbol: "EURCAD", ratePrecision: 5, pipsPosition: 4 },
    },
    {
      type: ADDED_CURRENCY_PAIR_UPDATE,
      payload: { symbol: "EURAUD", ratePrecision: 5, pipsPosition: 4 },
    },
  ],
  isStateOfTheWorld: true,
  isStale: false,
}

export const getCcyPairs: typeof ReferenceDataService.getCcyPairs = () => {
  return of(fakeCurrencyPairUpdates)
}
