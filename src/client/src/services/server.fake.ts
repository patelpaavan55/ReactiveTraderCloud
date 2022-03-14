import { HydraHandler, WsFakeHost } from "../hydra-fake"
import { services } from "./services.fake"

const hydra = new HydraHandler()
services.forEach((svc) => hydra.subscribe(svc))
new WsFakeHost(hydra, 5555, "/json")
