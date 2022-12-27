import { PopUpElement } from './abstract/PopUpElement'
import { createTemplateForCustomElement } from '../utils/node'
import { Colors } from './tokens/colors'

const templateHTML = `
  <style>
    :host {
      --app-pop-up-arrow-size: 4px;
      --app-pop-up-background-color: var(--app-color-background-secondary, ${Colors.BackgroundSecondary});
      --app-pop-up-box-shadow: none;
      --app-pop-up-color: var(--app-color-text-secondary, ${Colors.TextSecondary});
      --app-pop-up-padding: 4px 6px;
    }
  </style>
`

export class TooltipElement extends PopUpElement {
  public static get is () {
    return 'app-tooltip' as const
  }

  public static initializeTemplate (): HTMLTemplateElement {
    const baseTemplate = PopUpElement.initializeTemplate()
    const thisTemplate = createTemplateForCustomElement(templateHTML)
    baseTemplate.content.appendChild(thisTemplate.content.cloneNode(true))
    return baseTemplate
  }
}
