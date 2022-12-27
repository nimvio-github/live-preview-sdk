type RouteChangeCallback = (currentRoute: string) => void

export class RouteChangeWatcher {
  private static readonly WatchTimeoutMs = 1000

  private previousValue: string = ''
  private readonly timers: Map<string, number> = new Map()

  public watch = (onChange: RouteChangeCallback): void => {
    const currentRoute = window.location.pathname.endsWith('/')
      ? window.location.pathname.slice(0, -1)
      : window.location.pathname
    const timerId = this.timers.get(currentRoute)

    if (timerId) {
      clearTimeout(timerId)
    }

    const hasChanged = this.previousValue !== currentRoute

    if (hasChanged) {
      this.previousValue = currentRoute
      onChange(currentRoute)
    }

    const newTimerId = window.setTimeout(
      () => this.watch(onChange),
      RouteChangeWatcher.WatchTimeoutMs
    )

    this.timers.set(currentRoute, newTimerId)
  }

  public unwatchAll = (): void => {
    this.timers.forEach((timerId: number) => {
      clearTimeout(timerId)
    })

    this.timers.clear()
  }
}
