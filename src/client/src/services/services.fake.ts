import {
  HydraServiceDefinition,
  PermissionControl,
  SubscriptionHandler,
} from "../hydra-fake"
import { getAnalytics } from "./analytics/analytics.fake"
import { getCcyPairs } from "./currencyPairs/currencyPairs.fake"
import { executeTrade } from "./executions/executions.fake"
import { getPriceHistory, getPriceUpdates } from "./prices/prices.fake"
import { getTradeStream } from "./trades/trades.fake"

export const services: HydraServiceDefinition[] = [
  {
    destination: {
      method: "getCcyPairs",
      service: "ReferenceDataService",
    },
    handler: getCcyPairs as SubscriptionHandler,
    permission: PermissionControl.Unauthenticated,
  },
  {
    destination: {
      method: "getTradeStream",
      service: "BlotterService",
    },
    handler: getTradeStream as SubscriptionHandler,
    permission: PermissionControl.Unauthenticated,
  },
  {
    destination: {
      method: "getPriceHistory",
      service: "PricingService",
    },
    handler: getPriceHistory as SubscriptionHandler,
    permission: PermissionControl.Unauthenticated,
  },
  {
    destination: {
      method: "getPriceUpdates",
      service: "PricingService",
    },
    handler: getPriceUpdates as SubscriptionHandler,
    permission: PermissionControl.Unauthenticated,
  },
  {
    destination: {
      method: "getAnalytics",
      service: "AnalyticsService",
    },
    handler: getAnalytics as SubscriptionHandler,
    permission: PermissionControl.Unauthenticated,
  },
  {
    destination: {
      method: "executeTrade",
      service: "ExecutionService",
    },
    handler: executeTrade as SubscriptionHandler,
    permission: PermissionControl.Unauthenticated,
  },
]
