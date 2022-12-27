import { EventManager } from './EventManager'
import { IFrameMessageFrom, IFrameMessagePayload, IFrameMessageTypeDataMap, IFrameReceivedMessageCallbackMap, IFrameReceivedMessagePayload } from './IFrameCommunicatorType'

export function isInsideIFrame (): boolean {
  return window.self !== window.top
}

/**
 * Handle communication between IFrame inside the Nimvio page via postMessage API
 */
class IFrameCommunicator {
  private readonly _subscribers: EventManager<IFrameReceivedMessageCallbackMap> = new EventManager<IFrameReceivedMessageCallbackMap>()

  public subscribe<T extends keyof IFrameReceivedMessageCallbackMap>(eventType: T, callback: IFrameReceivedMessageCallbackMap[T]): void {
    this._subscribers.on(eventType, callback)
  }

  public unsubscribe<T extends keyof IFrameReceivedMessageCallbackMap>(eventType: T, callback: IFrameReceivedMessageCallbackMap[T]): void {
    this._subscribers.off(eventType, callback)
  }

  public destroy (): void {
    this._subscribers.removeAllListeners()
    window.removeEventListener('message', this.onMessage, true)
  }

  private onMessage (event: MessageEvent): void {
    if (!event.data) return
    const eventData = event.data as IFrameReceivedMessagePayload<any>
    if (eventData.from === IFrameMessageFrom.received) {
      this._subscribers.emit(eventData.type, eventData.data)
    }
  };

  public initialize (): void {
    if (typeof window === 'undefined') {
      return
    }
    // Send initial message
    this.sendMessage('init')
    window.addEventListener('message', this.onMessage.bind(this), true)
  }

  public sendMessage<T extends keyof IFrameMessageTypeDataMap> (type: T, data?: IFrameMessageTypeDataMap[T]): void {
    if (isInsideIFrame()) {
      const message: IFrameMessagePayload<T> = {
        type,
        data,
        from: IFrameMessageFrom.send
      }
      window.parent.postMessage(message, '*')
    }
  }
}

export const iframeCommunicator = new IFrameCommunicator()
