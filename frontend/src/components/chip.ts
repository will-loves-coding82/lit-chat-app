import { css, html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";

export type ChipVariant =  "soft" | "solid" | "outline"
export type ChipColor = "default" | "primary" | "success" | "warning" | "error"

@customElement('chip-component')
export class Chip extends LitElement {

  @property({type: String}) color: ChipColor = "default"
  @property({type: String}) variant: ChipVariant = "soft"

  private static readonly colorMap: Record<ChipColor, string> = {
    default: 'var(--color-default)',
    primary: 'var(--color-primary)',
    success: 'var(--color-success)',
    warning: 'var(--color-warning)',
    error:   'var(--color-error)',
  };

  private get chipStyles() {
    const c = Chip.colorMap[this.color];
    switch (this.variant) {
      case 'solid':   return { background: c, color: 'white', border: `1px solid ${c}` };
      case 'soft':    return { background: `color-mix(in srgb, ${c} 20%, transparent)`, color: c, border: `1px solid ${c}` };
      case 'outline': return { background: 'transparent', color: c, border: `1px solid ${c}` };
    }
  }

  static styles = css`
    :host {
      display: inline-flex;
    }

    div {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 10px;
      border-radius: 16px;
      font-size: 0.875rem;
    }

    .icon {
      display: inline-flex;
      align-items: center;
      width: 12px;
      height: 12px;
    }

    .label {
      font-size: var(--font-size-sm);
    }

    /* Targets any element passed into a slot and resets its margin */
    ::slotted(*) {
      margin: 0;
    }
  `

  render() {
    return html`
      <div style=${styleMap(this.chipStyles)}>
        <slot class="icon" name="icon"></slot>
        <slot class="label" name="label"></slot>
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'chip-component': Chip
  }
}