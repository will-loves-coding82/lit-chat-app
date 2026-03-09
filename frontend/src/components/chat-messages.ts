import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { Message } from '../types.js';

@customElement('chat-messages')
export class ChatMessages extends LitElement {
  static styles = css`
    :host {
      display: block;
      overflow-y: auto;
      flex: 1;
      padding: 1rem;
    }
    .message {
      margin-bottom: 0.75rem;
    }
    .username {
      font-weight: bold;
      margin-right: 0.5rem;
    }
    .time {
      font-size: 0.75rem;
      color: #888;
      margin-left: 0.5rem;
    }
  `;

  @property({ type: Array }) messages: Message[] = [];

  render() {
    return html`
      ${this.messages.map(
        (msg) => html`
          <div class="message">
            <span class="username">${msg.username}</span>
            <span class="content">${msg.content}</span>
            <span class="time">${new Date(msg.created_at).toLocaleTimeString()}</span>
          </div>
        `
      )}
    `;
  }
}
