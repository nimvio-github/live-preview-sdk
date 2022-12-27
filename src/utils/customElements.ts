import { DataAttribute, MetadataAttribute, DisableableFeature } from './dataAttributes'

export enum HighlightType {
  None = '',
  Element = 'element',
  ContentComponent = 'content-component',
  ContentItem = 'content-item',
}

const DisabledHighlightFeatureSelector = `[${MetadataAttribute.DisableFeatures}*="${DisableableFeature.Highlight}"]`
const ElementSelector = `*[${DataAttribute.ContentId}]:not(${DisabledHighlightFeatureSelector})`

/**
 * Find all descendant HTML elements that could be augmented (have highlights or add buttons near them).
 *
 * @param {HTMLElement | Document} node
 * @returns {NodeListOf<HTMLElement>}
 */
export function getAugmentableDescendants (
  node: HTMLElement | Document
): NodeListOf<HTMLElement> {
  return node.querySelectorAll(ElementSelector)
}

/**
 * Checks if HTML element could be augmented (have highlights or add buttons near them).
 *
 * @param {HTMLElement | null} element
 * @returns {boolean}
 */
export function isElementAugmentable (element: HTMLElement | null): boolean {
  return shouldElementHaveHighlight(element)
}

/**
 * Check if node should have highlights based on its data-attributes.
 *
 * @param {HTMLElement | null} element
 * @returns {boolean}
 */
export function shouldElementHaveHighlight (element: HTMLElement | null): boolean {
  const highlightType = getHighlightTypeForElement(element)

  switch (highlightType) {
    case HighlightType.None:
      return false
    case HighlightType.Element:
      return true
    case HighlightType.ContentItem:
    case HighlightType.ContentComponent:
    default: {
      // const configurationManager = ConfigurationManager.getInstance();
      // return configurationManager.isInsideWebSpotlightPreviewIFrame;
      return true
    }
  }
}

/**
 * Get HighlightType based on the HTML element data-attributes.
 *
 * @param {HTMLElement | null} element
 * @returns {HighlightType}
 */
export function getHighlightTypeForElement (element: HTMLElement | null): HighlightType {
  if (!element || isFeatureDisabledForElement(element, DisableableFeature.Highlight)) {
    return HighlightType.None
  }

  // treat node as element if it has element codename attribute
  if (element.hasAttribute(DataAttribute.ContentId)) {
    return HighlightType.Element
  }
  // // else treat node as content component if it has component id attribute
  // else if (element.hasAttribute(DataAttribute.)) {
  //   return HighlightType.ContentComponent
  //   // else treat node as content item if it has item id attribute
  // } else if (element.hasAttribute(DataAttribute.ItemId)) {
  //   return HighlightType.ContentItem
  // }

  return HighlightType.None
}

function isFeatureDisabledForElement (element: HTMLElement, feature: DisableableFeature): boolean {
  const attribute = element.getAttribute(MetadataAttribute.DisableFeatures)
  return attribute?.toLowerCase().includes(feature) ?? false
}
