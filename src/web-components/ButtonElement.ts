import { IconName } from './IconElement'
// import { assert } from '../utils/assert';
import { CustomElementWithTooltip } from './abstract/CustomElementWithTooltip'
import { createTemplateForCustomElement } from '../utils/node'
import { Colors } from './tokens/colors'
import { Shadows } from './tokens/shadows'

export enum ButtonType {
  Primary = 'primary',
  Quinary = 'quinary',
}

const templateHTML = `
  <style>
    :host,
    :host * {
      box-sizing: border-box;
    }
    
    :host {
      display: block;
    }
    
    :host([hidden]) {
      display: none;
    }
    
    :host(:focus) {
      outline: none;
    }

    .app-button {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      border: none;
      cursor: pointer;
      z-index: 999;
    }
    
    .app-button:focus {
      outline: none;
    }
    
    :host([disabled]) .app-button {
      cursor: not-allowed;
    }
    
    .app-button__content,
    :host([loading]) .app-button__loader {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    
    .app-button__loader,
    :host([loading]) .app-button__content {
      display: none;
    }
    
    :host([type=${ButtonType.Primary}]) .app-button {
      --app-icon-width: 18px;
      --app-icon-height: 18px;
      min-width: 40px;
      max-width: 40px;
      min-height: 40px;
      max-height: 40px;
      border-radius: 5000px;
      box-shadow: var(--app-shadow-primary, ${Shadows.Primary});
      background-color: var(--app-color-primary, ${Colors.Primary});
      color: var(--app-color-text-secondary, ${Colors.TextSecondary});
      fill: var(--app-color-text-secondary, ${Colors.TextSecondary});
    }
    
    :host([type=${ButtonType.Primary}]:not([disabled])) .app-button:hover,
    :host([type=${ButtonType.Primary}]:not([disabled])) .app-button:active {
      background-color: var(--app-color-primary-hover, ${Colors.PrimaryHover});
    }
    
    :host([type=${ButtonType.Primary}][disabled]) .app-button {
      background-color: var(--app-color-background-default-disabled, ${Colors.BackgroundDefaultDisabled});
      color: var(--app-color-text-default-disabled, ${Colors.TextDefaultDisabled});
      fill: var(--app-color-text-default-disabled, ${Colors.TextDefaultDisabled});
      box-shadow: none;
    }
    
    :host([type=${ButtonType.Primary}][loading]) .app-button {
      color: var(--app-color-primary, ${Colors.Primary});
      fill: var(--app-color-primary, ${Colors.Primary});
      box-shadow: none;
    }
    
    :host([type=${ButtonType.Quinary}]) .app-button {
      --app-icon-width: 16px;
      --app-icon-height: 16px;
      border-radius: 5px;
      padding: 0;
      min-height: 24px;
      min-width: 24px;
      max-height: 24px;
      max-width: 24px;
      color: var(--app-color-text-default, ${Colors.TextDefault});
      fill: var(--app-color-text-default, ${Colors.TextDefault});
      background-color: var(--app-color-background-default, ${Colors.BackgroundDefault});
    }
    
    :host([type=${ButtonType.Quinary}][disabled]) .app-button {
      color: var(--app-color-text-default-disabled, ${Colors.TextDefaultDisabled});
      fill: var(--app-color-text-default-disabled, ${Colors.TextDefaultDisabled});
    }
    
    :host([type=${ButtonType.Quinary}]:not([disabled])) .app-button:hover {
      background-color: var(--app-color-background-default-hover, ${Colors.BackgroundDefaultHover});
    }
    
    :host([type=${ButtonType.Quinary}]:not([disabled])) .app-button:active {
      background-color: var(--app-color-background-default-selected, ${Colors.BackgroundDefaultSelected});
    }
  </style>
  <button class="app-button">
    <div class="app-button__content">
      <slot></slot>
    </div>
    <app-icon icon-name="${IconName.Spinner}" class="app-button__loader" />
  </button>
`

export class ButtonElement extends CustomElementWithTooltip {
  public static get is () {
    return 'app-button' as const
  }

  public static get observedAttributes (): string[] {
    const base = CustomElementWithTooltip.observedAttributes
    return [...base, 'loading']
  }

  public get loading (): boolean {
    return this.hasAttribute('loading')
  }

  public set loading (value: boolean) {
    this.updateAttribute('loading', value)
  }

  public get disabled (): boolean {
    return this.hasAttribute('disabled')
  }

  public set disabled (value: boolean) {
    this.updateAttribute('disabled', value)
  }

  private readonly buttonRef: HTMLButtonElement

  constructor () {
    super()

    // assert(this.shadowRoot, 'Shadow root must be always accessible in "open" mode.');
    // @ts-expect-error
    this.buttonRef = this.shadowRoot.querySelector('button') as HTMLButtonElement
  }

  public static initializeTemplate (): HTMLTemplateElement {
    return createTemplateForCustomElement(templateHTML)
  }

  public connectedCallback (): void {
    super.connectedCallback()
    this.addEventListener('click', this.handleClick, { capture: true })
  }

  public disconnectedCallback (): void {
    super.disconnectedCallback()
    this.removeEventListener('click', this.handleClick, { capture: true })
  }

  public attributeChangedCallback (attributeName: string, _oldValue: string | null, newValue: string | null): void {
    super.attributeChangedCallback(attributeName, _oldValue, newValue)

    if (attributeName === 'loading') {
      const value = Boolean(newValue)
      this.disabled = value
      this.tooltipDisabled = value
    }
  }

  private readonly handleClick = (event: MouseEvent): void => {
    // make sure the disabled button does not trigger events
    if (this.disabled) {
      event.preventDefault()
      event.stopPropagation()
      event.stopImmediatePropagation()
    }
  }
}
