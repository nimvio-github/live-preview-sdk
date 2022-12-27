import { configurationManager } from './ConfigurationManager'
import { iframeCommunicator } from './IFrameCommunicator'
import { IFrameReceivedMessageCallbackMap } from './IFrameCommunicatorType'

export class LivePreview {
  /**
   * Live Preview Utility function to handle content changes inside the Nimvio Content Editor or Website Management
   * @param callback Callback function that will be called when there are changes from the Nimvio Content Editor. Only when the app is rendered inside the Nimvio's IFrame
   * @returns An object with a destroy method to unsubscribe and remove all listeners. Should be called when the app is unmounted
   */
  public onPreviewContentChange<T> (callback: IFrameReceivedMessageCallbackMap<T>['change']): { destroy: () => void } {
    iframeCommunicator.subscribe('change', callback)
    return {
      destroy: () => iframeCommunicator.unsubscribe('change', callback)
    }
  }

  /**
   * Live Preview Utility function to handle refresh on IFrame inside the Nimvio Content Editor or Website Management
   * @param callback Callback function that will be called when the user clicked refresh button on top of the IFrame. The default action will be reloading the page
   * @returns An object with a destroy method to unsubscribe and remove all listeners. Should be called when the app is unmounted
   */
  public onIFrameRefresh (callback: IFrameReceivedMessageCallbackMap['refresh']): { destroy: () => void } {
    iframeCommunicator.subscribe('refresh', callback)
    configurationManager.update({ customRefreshHandler: configurationManager.customRefreshHandler + 1 })
    return {
      destroy: (): void => {
        iframeCommunicator.unsubscribe('refresh', callback)
        configurationManager.update({ customRefreshHandler: configurationManager.customRefreshHandler - 1 })
      }
    }
  }

  /**
   * Live Preview Utility function to handle content being opened inside the Nimvio Content Editor or Website Management via the content tree
   * @param callback Callback function that will be called when the content being opened inside the Nimvio Content Editor via content tree
   * @returns An object with a destroy method to unsubscribe and remove all listeners. Should be called when the app is unmounted
   */
  public onOpenPreviewContent<T> (callback: IFrameReceivedMessageCallbackMap<T>['open-content']): { destroy: () => void } {
    iframeCommunicator.subscribe('open-content', callback)
    return {
      destroy: () => iframeCommunicator.unsubscribe('open-content', callback)
    }
  }
}
