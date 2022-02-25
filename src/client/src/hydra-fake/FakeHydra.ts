import {
  Connection,
  ProtocolHandler,
  ServiceDefinition,
} from "@fakehost/exchange"
import { Observable, Subscription } from "rxjs"

type IncomingMessageType = "NEXT" | "COMPLETED" | "CANCEL"
type OutgoingMessageType = "NEXT" | "COMPLETED" | "ERROR"

export type SubscriptionHandler = (input: unknown) => Observable<unknown>

export type IncomingHydraMessage = {
  correlationId: string
  kind: IncomingMessageType
  method: string
  service: string
  payload: unknown
}

type OutgoingHydraMessage = {
  correlationId: string
  kind: OutgoingMessageType
  method: string
  service: string
  payload?: unknown
}

const isDebug = process.env.DEBUG === "true"

const log = (...args: any[]) => {
  isDebug && console.log(...args)
}

export type ConnectionListener = (
  connection: Connection,
  hydra: HydraHandler,
) => void

// Using JSON.stringify() with any BigInt value will raise a TypeError,
// as BigInt values aren't serialized in JSON by default.
// @ts-ignore
if (typeof BigInt.prototype.toJSON === "undefined") {
  // eslint-disable-next-line no-extend-native
  // @ts-ignore
  BigInt.prototype.toJSON = function () {
    return this.toString()
  }
}

const requestLog = new Array<{
  ts: number
  connection: Connection
  message: IncomingHydraMessage
}>()

export enum PermissionControl {
  Authenticated = "Authenticated",
  AuthenticationEndpoint = "AuthenticationEndpoint",
  Unauthenticated = "Unauthenticated",
}

export const DEFAULT_AUTHENTICATION_REQUIREMENT =
  PermissionControl.Authenticated

export type HydraServiceDefinition = ServiceDefinition<
  Pick<IncomingHydraMessage, "method" | "service">
> & {
  permission?: PermissionControl
}
export class HydraHandler
  implements ProtocolHandler<IncomingHydraMessage, OutgoingHydraMessage>
{
  private connectionListeners: ConnectionListener[] = []
  private subscriptions = new Map<string, Subscription>()
  private authenticatedConnections = new Set<string>()
  private methodHandlers = new Map<
    string,
    {
      service: string
      method: string
      permission: PermissionControl
      handler: SubscriptionHandler
      error$?: Observable<unknown>
    }
  >()

  serialize(message: OutgoingHydraMessage): string {
    return JSON.stringify(message)
  }
  deserialize(buffer: Buffer | string): IncomingHydraMessage {
    const message =
      typeof buffer === "string"
        ? buffer
        : new TextDecoder("utf-8").decode(buffer)
    log("deserialising", message)
    return JSON.parse(message) as IncomingHydraMessage
  }

  registerConnectionListener(handler: ConnectionListener) {
    this.connectionListeners.push(handler)
  }

  onConnection(connection: Connection) {
    log("New connection")
    this.connectionListeners.forEach((listener) => listener(connection, this))
  }

  onMessage(connection: Connection, message: IncomingHydraMessage): void {
    log("incoming:", message)

    if (ExchangeControls.captureRequests) {
      requestLog.unshift({
        ts: Date.now(),
        connection,
        message,
      })
    }

    switch (message.kind) {
      case "COMPLETED":
        // Client request to terminate the stream. Based on correlationId
        if (!this.subscriptions.has(message.correlationId)) {
          // The request/response is also a completed message...
          return this.onNext(connection, message)
        }
        this.subscriptions.get(message.correlationId)!.unsubscribe()

        break
      case "NEXT":
        this.onNext(connection, message)
        break
      case "CANCEL":
        this.subscriptions.get(message.correlationId)?.unsubscribe()
        break
      default:
        console.warn("Unhandled message", message)
    }
  }

  private onNext(connection: Connection, message: IncomingHydraMessage) {
    const handler = this.methodHandlers.get(this.getName(message))
    if (!handler) {
      console.error("No handler for:", this.getName(message))
      return
    }

    if (handler.permission === PermissionControl.Authenticated) {
      // is authenticated?
      if (!this.authenticatedConnections.has(connection.id)) {
        console.warn("Connection denied. Not authenticated.")
        connection.write(
          this.serialize({
            correlationId: message.correlationId,
            service: message.service,
            method: message.method,
            kind: "ERROR",
            payload: "ErrorNotification/permissionDenied",
          }),
        )
      }
    }

    const response$ = handler.handler(message.payload)
    const subscription = response$.subscribe(
      (payload: unknown) => {
        if (handler.permission === PermissionControl.AuthenticationEndpoint) {
          // Bit hacky, but intercept subscription on the AuthenticationEndpoint that signifies
          // the connection is authenticated correctly
          log("Connection authenticated")
          this.authenticatedConnections.add(connection.id)
        }
        const response: OutgoingHydraMessage = {
          correlationId: message.correlationId,
          service: handler.service,
          method: handler.method,
          kind: "NEXT",
          payload,
        }
        connection.write(this.serialize(response))
      },
      (error: unknown) => {
        log(`Error ${message.correlationId} to ${this.getName(message)}`)
        log("Error", error)
        connection.write(
          this.serialize({
            correlationId: message.correlationId,
            service: message.service,
            method: message.method,
            kind: "ERROR",
            payload: error,
          }),
        )
      },
      () => {
        log(`Closed ${message.correlationId} to ${this.getName(message)}`)
        connection.write(
          this.serialize({
            correlationId: message.correlationId,
            service: message.service,
            method: message.method,
            kind: "COMPLETED",
          }),
        )
      },
    )
    this.subscriptions.set(message.correlationId, subscription)
  }

  private getName({
    method,
    service,
  }: Pick<IncomingHydraMessage, "method" | "service">) {
    return `${service}.${method}`
  }

  subscribe({
    destination,
    handler,
    permission = DEFAULT_AUTHENTICATION_REQUIREMENT,
  }: HydraServiceDefinition) {
    const { method, service } = destination
    this.methodHandlers.set(this.getName({ method, service }), {
      service,
      method,
      permission,
      handler: handler as SubscriptionHandler,
    })
  }
}

export const ExchangeControls = {
  captureRequests: false,
  getRequestLog: () => requestLog,
}
