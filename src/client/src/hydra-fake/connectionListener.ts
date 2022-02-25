import { Connection } from "@fakehost/exchange"
import { Observable } from "rxjs"
import { v4 as uuid } from "uuid"
import { HydraHandler, IncomingHydraMessage } from "./FakeHydra"

export type ConnectionService = Pick<
  IncomingHydraMessage,
  "method" | "service"
> & {
  handler: () => Observable<unknown>
}

export const createConnectionListener =
  (definitions: ConnectionService[]) =>
  (connection: Connection, hydra: HydraHandler) => {
    const createEventStream = (service: string, method: string) => {
      const correlationId = uuid()
      return (event: unknown) => {
        const message = hydra.serialize({
          correlationId,
          kind: "NEXT",
          method,
          service,
          payload: event,
        })
        connection.write(message)
      }
    }

    definitions.forEach((definition) => {
      definition
        .handler()
        .subscribe(createEventStream(definition.service, definition.method))
    })
  }
