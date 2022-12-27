// Place to put all the configurations for the SDK

export interface PublicSDKConfiguration {
  /**
   * Query parameter required that should be present in the URL to enable the SDK.
   *
   * Example:
   * queryParam => 'preview', when user access the page with additional parameter preview like https://something.com/some-page?preview it will show the highlighted element
   */
  readonly queryParam: string
  readonly disableWeblink: boolean
}

export interface PrivateSDKConfiguration {
  /**
   * Track the amount of customRefreshHandler. Used to determine whether need to use the default handler or not
   */
  readonly customRefreshHandler: number
}

type SDKConfiguration = PublicSDKConfiguration & PrivateSDKConfiguration

const defaultConfiguration: SDKConfiguration = {
  queryParam: 'preview',
  disableWeblink: false,
  customRefreshHandler: 0
}

export class ConfigurationManager {
  private configuration: SDKConfiguration

  constructor () {
    this.configuration = defaultConfiguration
  }

  public get queryParam (): string {
    return this.configuration.queryParam
  }

  public get disableWeblink (): boolean {
    return this.configuration.disableWeblink
  }

  public get customRefreshHandler (): number {
    return this.configuration.customRefreshHandler
  }

  public update (configuration: Partial<SDKConfiguration> = {}): void {
    this.configuration = { ...this.configuration, ...configuration }
  }
}

export const configurationManager = new ConfigurationManager()
