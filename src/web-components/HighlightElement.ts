import {
  getHighlightTypeForElement,
  HighlightType
} from '../utils/customElements'
import { createTemplateForCustomElement } from '../utils/node'
import { parseEditButtonDataAttributes } from '../utils/dataAttributes'
import { iframeCommunicator, isInsideIFrame } from '../lib/IFrameCommunicator'
import { ButtonType, ButtonElement } from './ButtonElement'
import { IconName } from './IconElement'
import {
  ElementPositionOffset,
  PositionedElement
} from './abstract/PositionedElement'
import { Colors } from './tokens/colors'
import { Shadows } from './tokens/shadows'
import { BaseZIndex } from './constants/zIndex'

const templateHTML = `
  <style>
    :host,
    :host * {
      box-sizing: border-box;
    }
    
    :host {
      display: block;
      position: absolute;
      pointer-events: none;
      touch-action: none;
      min-height: 40px;
      min-width: 40px;
      width: 100%;
      height: 100%;
      border: 4px dashed !important;
      border-color: var(--app-color-primary-transparent, ${Colors.PrimaryTransparent}) !important;
      border-radius: 5px;
      box-shadow: var(--app-shadow-inner, ${Shadows.Inner})
    }
    
    :host([hidden]) {
      display: none;
    }
    
    :host(:hover),
    :host([selected]) {
      border-color: var(--app-color-primary, ${Colors.Primary}) !important;
      z-index: calc(var(--app-z-index, ${BaseZIndex}) + 10);
    }
    
    :host(:focus) {
      outline: none;
    }

    :host([selected]) .app-highlight__toolbar,
    :host(:hover) .app-highlight__toolbar {
      visibility: visible;
    }
    
    .app-highlight__toolbar {
      visibility: hidden;
      position: absolute;
      top: 0;
      right: 0;
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
      pointer-events: all;
      touch-action: auto;
      min-height: 40px;
      max-height: 40px;
      border-radius: 8px;
      background-color: var(--app-color-background-default, ${Colors.BackgroundDefault});
      z-index: var(--app-z-index, ${BaseZIndex});
      padding: 8px;
      box-shadow: var(--app-shadow-default, ${Shadows.Default});
    }
    
    .app-highlight__toolbar:hover {
      z-index: calc(var(--app-z-index, ${BaseZIndex}) + 10);
    }
    
    .app-highlight__toolbar-button + .app-highlight__toolbar-button {
      margin-left: 4px;
    }
  </style>
  <div id="app-toolbar" class="app-highlight__toolbar">
    <app-button 
      id="app-edit" 
      class="app-highlight__toolbar-button"
      type="${ButtonType.Quinary}"
      tooltip-position="${ElementPositionOffset.BottomEnd}"
    >
      <app-icon icon-name="${IconName.Edit}" />
    </app-button>
  </div>
`

export class HighlightElement extends PositionedElement {
  public static get is () {
    return 'app-highlight' as const
  }

  public get type (): HighlightType {
    return getHighlightTypeForElement(this.targetRef)
  }

  public get selected (): boolean {
    return this.hasAttribute('selected')
  }

  public set selected (value: boolean) {
    this.updateAttribute('selected', value)
  }

  private readonly editButtonRef: ButtonElement

  constructor () {
    super()

    this.editButtonRef = this.shadowRoot?.querySelector(
      '#app-edit'
    ) as ButtonElement
  }

  public static initializeTemplate (): HTMLTemplateElement {
    return createTemplateForCustomElement(templateHTML)
  }

  private static getEditButtonTooltip (type: HighlightType): string {
    switch (type) {
      case HighlightType.Element:
        return 'Edit element'

      case HighlightType.ContentComponent:
        return 'Edit component'

      case HighlightType.ContentItem:
        return 'Edit item'

      default:
        return 'Edit'
    }
  }

  public connectedCallback (): void {
    super.connectedCallback()

    this.editButtonRef.addEventListener('click', this.handleEditButtonClick)
  }

  public disconnectedCallback (): void {
    super.connectedCallback()

    this.editButtonRef.removeEventListener('click', this.handleEditButtonClick)
    this.unregisterTargetNodeListeners()
  }

  public attachTo = (node: HTMLElement): void => {
    this.unregisterTargetNodeListeners()

    super.attachTo(node)

    const type = this.type
    this.hidden = type === HighlightType.None
    // this.editButtonRef.tooltipMessage =
    //   HighlightElement.getEditButtonTooltip(type)

    if (this.targetRef) {
      this.targetRef.addEventListener(
        'mousemove',
        this.handleTargetNodeMouseEnter
      )
      this.targetRef.addEventListener(
        'mouseleave',
        this.handleTargetNodeMouseLeave
      )
      this.editButtonRef.addEventListener('click', this.handleEditButtonClick)
    }
  }

  public adjustPosition = (): void => {
    if (!this.targetRef || !this.offsetParent) {
      return
    }

    const offsetParentRect = this.offsetParent.getBoundingClientRect()
    const targetRect = this.targetRef.getBoundingClientRect()

    this.style.top = `${targetRect.top - offsetParentRect.top}px`
    this.style.left = `${targetRect.left - offsetParentRect.left}px`

    this.style.width = `${targetRect.width}px`
    this.style.height = `${targetRect.height}px`
  }

  private readonly unregisterTargetNodeListeners = (): void => {
    if (this.targetRef) {
      this.targetRef.removeEventListener(
        'mousemove',
        this.handleTargetNodeMouseEnter
      )
      this.targetRef.removeEventListener(
        'mouseleave',
        this.handleTargetNodeMouseLeave
      )
      this.editButtonRef.removeEventListener('click', this.handleEditButtonClick)
    }
  }

  private readonly handleTargetNodeMouseEnter = (): void => {
    this.selected = true
  }

  private readonly handleTargetNodeMouseLeave = (): void => {
    this.selected = false
  }

  private readonly handleEditButtonClick = (event: MouseEvent): void => {
    event.preventDefault()
    event.stopPropagation()

    if (!this.targetRef) return

    const dataAttributes = parseEditButtonDataAttributes(this.targetRef)
    if (dataAttributes.contentId && dataAttributes.projectId) {
      if (!isInsideIFrame()) {
        const url = `https://app.nimvio.com/content-management/structure/edit/${dataAttributes.contentId}?project_id=${dataAttributes.projectId}`
        window.open(url, '_blank')?.focus()
      } else {
        iframeCommunicator.sendMessage('open-content', { contentId: dataAttributes.contentId, projectId: dataAttributes.projectId })
      }
    }
  }
}
