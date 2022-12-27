import { NodeWebLinkProvider } from './lib/WebLinkProvider'
import { defineAllRequiredWebComponents } from './web-components/components'
import { QueryParamPresenceWatcher } from './lib/QueryParamPresenceWatcher'
import {
  iframeCommunicator,
  isInsideIFrame
} from './lib/IFrameCommunicator'
import { configurationManager, PublicSDKConfiguration } from './lib/ConfigurationManager'
import { LivePreview } from './lib/LivePreviewUtils'

class WebLinkSDK {
  public readonly nodeWebLink: NodeWebLinkProvider
  private readonly queryParamPresenceWatcher: QueryParamPresenceWatcher

  constructor (configurationObj?: Partial<PublicSDKConfiguration>) {
    this.queryParamPresenceWatcher = new QueryParamPresenceWatcher()
    this.nodeWebLink = new NodeWebLinkProvider()
    configurationManager.update(configurationObj)

    void this.init()
  }

  public init = async (): Promise<void> => {
    await defineAllRequiredWebComponents()
    // Only initilize IFrameCommunicator inside IFrame
    if (isInsideIFrame()) {
      this.initializeIFrameCommunication()
    } else {
      if (!configurationManager.disableWeblink) {
        this.queryParamPresenceWatcher.watch(configurationManager.queryParam, this.nodeWebLink.toggle)
      }
    }
  }

  public destroy = (): void => {
    this.queryParamPresenceWatcher.unwatchAll()
    this.nodeWebLink.destroy()
    iframeCommunicator.destroy()
  }

  private initializeIFrameCommunication (): void {
    iframeCommunicator.initialize()

    // Setup all message listener
    iframeCommunicator.subscribe('refresh', this.handleIFrameRefreshMessage)
    iframeCommunicator.subscribe('toggle-weblink', ({ isEnabled }) => this.nodeWebLink.toggle(isEnabled))
  }

  private handleIFrameRefreshMessage (): void {
    const hasCustomRefreshHandler = configurationManager.customRefreshHandler > 0
    if (!hasCustomRefreshHandler) {
      window.location.reload()
    }
  }
}

class WebLink {
  private static instance: WebLink
  private sdk: WebLinkSDK | null = null

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  public static init (configuration?: Partial<PublicSDKConfiguration>) {
    if (!WebLink.instance) {
      WebLink.instance = new WebLink()
    }

    if (WebLink.instance.sdk == null) {
      WebLink.instance.sdk = new WebLinkSDK(configuration)
    }

    return WebLink.instance
  }

  public destroy = (): void => {
    this.sdk?.destroy()
    this.sdk = null
  }

  public setConfiguration (configuration: Partial<PublicSDKConfiguration>): void {
    configurationManager.update(configuration)
  }

  /**
   * Live preview utility functions
   */
  public get livePreviewUtils (): LivePreview {
    return new LivePreview()
  }
}

export default WebLink
