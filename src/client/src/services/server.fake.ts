import { HydraHandler, WsFakeHost } from "../hydra-fake"
import { pricingServiceControls } from "./prices/prices.fake"
import { services } from "./services.fake"

const hydra = new HydraHandler()
services.forEach((svc) => hydra.subscribe(svc))
new WsFakeHost(hydra, 5555, "/json")

pricingServiceControls.staticPrice = {
  ask: 1.1,
  bid: 1.08,
  mid: 1.09,
  symbol: "GBPJPY",
  // @ts-ignore
  creationTimestamp: new Date(),
  valueDate: new Date().toString(),
}
