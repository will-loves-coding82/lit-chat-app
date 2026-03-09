import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";

export type ButtonSize = "sm" | "md" | "lg"
export type ButtonRadius = "sm" | "md" | "lg" | "xl" | "full"
export type ButtonColor = "default" | "primary" | "destructive" | "success"
export type ButtonVariant = "solid" | "soft" | "outline" | "ghost"


@customElement("button-component")
export class Button extends LitElement {
  
  // The reflect property allows us to map the presence of the variable to a true value
  @property({ type: Boolean, reflect: true}) fullWidth: boolean = false
  @property({ type: String }) size: ButtonSize = "md"
  @property({ type: String}) radius: ButtonRadius = "md"
    
  @property({ type: String }) color: ButtonColor = "default"
  @property({ type: String }) variant: ButtonVariant = "solid"
  @property({ attribute: false }) onPress?: () => void

  private static readonly colorMap: Record<ButtonColor, string> = {
    default: 'var(--color-default)',
    primary: 'var(--color-primary)',
    success: 'var(--color-success)',
    destructive: 'var(--color-error)',
  }

  private static readonly sizeMap: Record<ButtonSize, { padding: string, fontSize: string }> = {
    sm: { padding: '10px 20px', fontSize: 'var(--font-size-sm)' },
    md: { padding: '10px 24px', fontSize: 'var(--font-size-base)' },
    lg: { padding: '12px 24px', fontSize: 'var(--font-size-lg)' },
  }

  private static readonly radiusMap: Record<ButtonRadius, { borderRadius: string}> = {
    sm: { borderRadius: "var(--radius-sm)" },
    md: { borderRadius: "var(--radius-md)" },
    lg: { borderRadius: "var(--radius-lg)" },
    xl: { borderRadius: "var(--radius-xl)" },
    full: { borderRadius: "var(--radius-full)" },
  }

  private get buttonStyles() {
    const color = Button.colorMap[this.color]
    const size = Button.sizeMap[this.size]
    const radius = Button.radiusMap[this.radius]
    const fullWidth = this.fullWidth ? { width: "100%"} : { width: "fit-content" }
    const mergedStyles = {...size, ...radius, ...fullWidth}

    switch (this.variant) {
      case 'solid': return { background: color, color: 'white', border: color, ...mergedStyles};
      case 'soft': return { background: `color-mix(in srgb, ${color} 20%, transparent)`, color: color, border: `1px solid ${color}`, ...mergedStyles};
      case 'outline': return { background: 'transparent', color: color, border: `1px solid ${color}`, ...mergedStyles};
      case 'ghost': return { background: 'transparent', border: 'none', color: color, ...size, ...radius, ...fullWidth };
    }
  }

  private handleClick = () => {
    this.onPress?.()
  }

  static styles = css`
   :host {
      display: inline-flex;
      width: fit-content;
    }

    :host([fullWidth]) {
      width: 100%;
    }


    button:hover {
      cursor: pointer;
      opacity: 0.8;
      transition: all 0.2s ease
    }

    button:active {
      transform: scale(0.95);
    }

    ::slotted(*) {
      margin: 0;
    }
  `
  render() {
    return html`
      <button @click =${this.handleClick} style=${styleMap(this.buttonStyles)}>
        <slot class="label" name="label"></slot>
      </button>
    `
  }
}