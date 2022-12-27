import { isElementWebComponent } from '../web-components/components'
import { getAugmentableDescendants, isElementAugmentable } from '../utils/customElements'
import { WebLinkRenderer } from './WebLinkRenderer'

export class NodeWebLinkProvider {
  private readonly mutationObserver: MutationObserver
  private readonly intersectionObserver: IntersectionObserver
  public readonly renderer: WebLinkRenderer

  private enabled = false
  private renderingTimeoutId = 0
  private observedElements = new Set<HTMLElement>()
  private visibleElements = new Set<HTMLElement>()

  constructor () {
    this.mutationObserver = new MutationObserver(this.onDomMutation)
    this.intersectionObserver = new IntersectionObserver(this.onElementVisibilityChange)
    this.renderer = new WebLinkRenderer()
  }

  public toggle = (force?: boolean): void => {
    const shouldEnable = typeof force !== 'undefined' ? force : !this.enabled

    if (shouldEnable) {
      this.enable()
    } else {
      this.disable()
    }
  }

  public enable = (): void => {
    if (this.enabled) return

    this.startRenderingInterval()

    this.listenToGlobalEvents()
    this.observeDomMutations()
    this.enabled = true
  }

  public disable = (): void => {
    if (!this.enabled) return

    this.stopRenderingInterval()

    this.unlistenToGlobalEvents()
    this.disconnectObservers()
    this.renderer.clear()
    this.enabled = false
  }

  public destroy = (): void => {
    this.disable()
    this.renderer.destroy()
  }

  private readonly augmentVisibleElements = (): void => {
    requestAnimationFrame(() => {
      this.renderer.render(this.visibleElements, this.observedElements)
    })
  }

  /**
   * Start an interval rendering (1s) that will re-render highlights for all visible elements using `setTimeout`.
   * It helps to adjust highlights position even in situations that are currently not supported by
   * the SDK (e.g. element position change w/o animations, some infinite animations and other possible unhandled cases)
   * for better user experience.
   */
  private readonly startRenderingInterval = (): void => {
    this.augmentVisibleElements()
    this.renderingTimeoutId = window.setTimeout(this.startRenderingInterval, 1000)
  }

  private readonly stopRenderingInterval = (): void => {
    if (this.renderingTimeoutId) {
      window.clearTimeout(this.renderingTimeoutId)
      this.renderingTimeoutId = 0
    }
  }

  private readonly listenToGlobalEvents = (): void => {
    window.addEventListener('scroll', this.augmentVisibleElements, { capture: true })
    window.addEventListener('resize', this.augmentVisibleElements, { passive: true })

    window.addEventListener('animationend', this.augmentVisibleElements, { passive: true, capture: true })
    window.addEventListener('transitionend', this.augmentVisibleElements, { passive: true, capture: true })
  }

  private readonly unlistenToGlobalEvents = (): void => {
    window.removeEventListener('scroll', this.augmentVisibleElements, { capture: true })
    window.removeEventListener('resize', this.augmentVisibleElements)

    window.removeEventListener('animationend', this.augmentVisibleElements, { capture: true })
    window.removeEventListener('transitionend', this.augmentVisibleElements, { capture: true })
  }

  private readonly observeDomMutations = (): void => {
    if (this.enabled) return

    this.mutationObserver.observe(window.document.body, {
      childList: true,
      subtree: true
    })

    getAugmentableDescendants(document).forEach((element: Element) => {
      if (element instanceof HTMLElement) {
        this.observeElementVisibility(element)
      }
    })
  }

  private readonly disconnectObservers = (): void => {
    this.mutationObserver.disconnect()
    this.intersectionObserver.disconnect()

    this.observedElements.forEach((element: HTMLElement) => {
      this.unobserveElementVisibility(element)
    })

    this.observedElements = new Set<HTMLElement>()
    this.visibleElements = new Set<HTMLElement>()
  }

  private readonly observeElementVisibility = (element: HTMLElement): void => {
    if (this.observedElements.has(element)) return

    this.intersectionObserver.observe(element)
    this.observedElements.add(element)
  }

  private readonly unobserveElementVisibility = (element: HTMLElement): void => {
    if (!this.observedElements.has(element)) return

    this.intersectionObserver.unobserve(element)
    this.observedElements.delete(element)
    this.visibleElements.delete(element)
  }

  private readonly onDomMutation = (mutations: MutationRecord[]): void => {
    const relevantMutations = mutations.filter((mutation: MutationRecord) => {
      const isTypeRelevant = mutation.type === 'childList'
      const isTargetRelevant = mutation.target instanceof HTMLElement && !isElementWebComponent(mutation.target)

      if (!isTypeRelevant || !isTargetRelevant) {
        return false
      }

      const hasRelevantAddedNodes = Array.from(mutation.addedNodes).some(
        (node) => node instanceof HTMLElement && !isElementWebComponent(node)
      )
      const hasRelevantRemovedNodes = Array.from(mutation.removedNodes).some(
        (node) => node instanceof HTMLElement && !isElementWebComponent(node)
      )

      return hasRelevantAddedNodes || hasRelevantRemovedNodes
    })

    for (const mutation of relevantMutations) {
      mutation.addedNodes.forEach(node => {
        if (node instanceof HTMLElement) {
          if (isElementAugmentable(node)) {
            this.observeElementVisibility(node)
          }
          getAugmentableDescendants(node).forEach(element => {
            if (element instanceof HTMLElement) {
              this.observeElementVisibility(element)
            }
          })
        }
      })

      mutation.removedNodes.forEach(node => {
        if (node instanceof HTMLElement) {
          if (isElementAugmentable(node)) {
            this.unobserveElementVisibility(node)
          }
          getAugmentableDescendants(node).forEach(element => {
            if (element instanceof HTMLElement) {
              this.unobserveElementVisibility(element)
            }
          })
        }
      })
    }

    if (relevantMutations.length > 0) {
      this.augmentVisibleElements()
    }
  }

  private readonly onElementVisibilityChange = (entries: IntersectionObserverEntry[]): void => {
    const filteredEntries = entries.filter((entry: IntersectionObserverEntry) => entry.target instanceof HTMLElement)

    for (const entry of filteredEntries) {
      const target = entry.target as HTMLElement
      if (entry.isIntersecting) {
        this.visibleElements.add(target)
      } else {
        this.visibleElements.delete(target)
      }
    }

    if (filteredEntries.length > 0) {
      this.augmentVisibleElements()
    }
  }
}
