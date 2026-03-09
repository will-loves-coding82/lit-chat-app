import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

@customElement('chat-input')
export class ChatInput extends LitElement {
  static styles = css`
    :host {
      display: flex;
      gap: 0.5rem;
      padding: 1rem;
      border-top: 1px solid #ddd;
    }
    input {
      flex: 1;
      padding: 0.5rem;
      font-size: 1rem;
      border: 1px solid #ccc;
      border-radius: 4px;
    }
    button {
      padding: 0.5rem 1rem;
      font-size: 1rem;
      cursor: pointer;
      border: none;
      border-radius: 4px;
      background: #0066cc;
      color: white;
    }
    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `;

  @property({ type: String }) username = '';
  @state() private content = '';

  private handleSubmit(e: Event) {
    e.preventDefault();
    const trimmed = this.content.trim();
    if (!trimmed || !this.username.trim()) return;
    this.dispatchEvent(new CustomEvent('send-message', { detail: trimmed, bubbles: true, composed: true }));
    this.content = '';
  }

  render() {
    return html`
      <form @submit=${this.handleSubmit} style="display:contents">
        <input
          type="text"
          placeholder="Type a message..."
          .value=${this.content}
          @input=${(e: Event) => (this.content = (e.target as HTMLInputElement).value)}
        />
        <button type="submit" ?disabled=${!this.content.trim() || !this.username.trim()}>
          Send
        </button>
      </form>
    `;
  }
}
