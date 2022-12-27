type EventMap = Record<string, (...args: any[]) => void>

/**
 * Reusable EventManager with PubSub pattern (can add multiple listener/subscriber)
 */
export class EventManager<Events extends EventMap> {
  private listeners = new Map<keyof Events, Set<Events[any]>>()

  public on = <E extends keyof Events>(event: E, listener: Events[E]): void => {
    const newListeners = this.listeners.get(event)?.add(listener) ?? new Set([listener])
    this.listeners.set(event, newListeners)
  }

  public off = <E extends keyof Events>(event: E, listener: Events[E]): void => {
    this.listeners.get(event)?.delete(listener)
  }

  public emit = <E extends keyof Events>(event: E, ...args: Parameters<Events[E]>): void => {
    const listeners = this.listeners.get(event)
    if ((listeners != null) && listeners.size > 0) {
      listeners.forEach((callback: Events[E]) => {
        // eslint-disable-next-line n/no-callback-literal
        callback(...args)
      })
    }
  }

  public removeAllListeners = (): void => {
    this.listeners = new Map<keyof Events, Set<Events[any]>>()
  }

  public hasEventListener = <E extends keyof Events>(event: E): boolean => {
    return this.listeners.has(event)
  }
}
