import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";


export type LinkColor = "default" | "primary" | "destructive" | "success"

@customElement("link-component")
export class Link extends LitElement {

  @property() color: LinkColor = "default"
  @property() href: string = "/"

  private static readonly colorMap: Record<LinkColor, string> = {
    default: 'var(--color-foreground-primary)',
    primary: 'var(--color-primary)',
    success: 'var(--color-success)',
    destructive: 'var(--color-error)'
  }

  private get linkStyles() {
    const c = Link.colorMap[this.color]
    return { color: c }
  }

  static styles = css`
    a {
      display: inline-flex;
      font-size: var(--font-size-md);
      text-decoration: none;
      width: fit-content;
      height: fit-content;
    }
  `

  render() {
    return html`
      <a href=${this.href} style=${styleMap(this.linkStyles)}>
        <slot class="label" name="label"></slot>
        <slot class="icon" name="icon"></slot>
      </a>
    `
  }
}