import { CustomElement } from './abstract/CustomElement'
// import { AddButtonElement } from './AddButtonElement';
import { ContainerElement } from './ContainerElement'
import { ButtonElement } from './ButtonElement'
import { IconElement } from './IconElement'
import { TooltipElement } from './TooltipElement'
import { HighlightElement } from './HighlightElement'
// import { PopoverElement } from './PopoverElement';

declare global {
  interface HTMLElementTagNameMap {
    [IconElement.is]: IconElement
    [ButtonElement.is]: ButtonElement
    [HighlightElement.is]: HighlightElement
    [ContainerElement.is]: ContainerElement
    [TooltipElement.is]: TooltipElement
  }
}

const webComponents: ReadonlyArray<typeof CustomElement> = [
  IconElement,
  ButtonElement,
  HighlightElement,
  ContainerElement
]

const webComponentTags: readonly string[] = webComponents.map((component) => component.is)

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export async function defineAllRequiredWebComponents () {
  const allDefined = webComponents.map(async (webComponent) => await webComponent.define())
  return await Promise.all(allDefined)
}

/**
 * Check if element is a web component based on its tag name.
 *
 * @param {HTMLElement} element
 * @returns {boolean}
 */
export function isElementWebComponent (element: HTMLElement): boolean {
  return webComponentTags.includes(element.tagName.toLowerCase())
}
