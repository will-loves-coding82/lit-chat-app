import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import '../../components/chat-messages';
import '../../components/chat-input';
import { Message } from '../../types.js';

@customElement('messages-page')
export class MessagesPage extends LitElement {
  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      height: 100vh;
      max-width: 720px;
      margin: 0 auto;
      font-family: sans-serif;
    }
    header {
      padding: 1rem;
      border-bottom: 1px solid #ddd;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    header h1 {
      margin: 0;
      font-size: 1.25rem;
      flex: 1;
    }
    header input {
      padding: 0.4rem 0.6rem;
      border: 1px solid #ccc;
      border-radius: 4px;
      font-size: 0.9rem;
    }
    .status {
      font-size: 0.75rem;
      color: #888;
    }
    .status.connected { color: #0a0; }
    .status.disconnected { color: #c00; }
  `;

  @state() private messages: Message[] = [];
  @state() private username = 'Anonymous';
  @state() private connected = false;

  private ws: WebSocket | null = null;

  connectedCallback() {
    super.connectedCallback();
    this.loadHistory();
    this.connectWs();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.ws?.close();
  }

  private async loadHistory() {
    try {
      const res = await fetch('/api/messages');
      this.messages = (await res.json()) as Message[];
    } catch (err) {
      console.error('Failed to load history', err);
    }
  }

  private connectWs() {
    const protocol = location.protocol === 'https:' ? 'wss' : 'ws';
    this.ws = new WebSocket(`${protocol}://${location.host}/ws`);

    this.ws.onopen = () => { this.connected = true; };
    this.ws.onclose = () => {
      this.connected = false;
      // Reconnect after 3 s
      setTimeout(() => this.connectWs(), 3000);
    };
    
    this.ws.onmessage = (event: MessageEvent) => {
      const parsed = JSON.parse(event.data as string) as { type: string; data: Message };
      if (parsed.type === 'message') {
        this.messages = [...this.messages, parsed.data];
      }
    };
  }

  private handleSend(e: CustomEvent<string>) {
    if (!this.connected || !this.ws) return;
    this.ws.send(JSON.stringify({ username: this.username, content: e.detail }));
  }

  render() {
    return html`
      <header>
        <h1>Lit Chat</h1>
        <input
          type="text"
          placeholder="Your name"
          .value=${this.username}
          @input=${(e: Event) => (this.username = (e.target as HTMLInputElement).value)}
        />
        <span class="status ${this.connected ? 'connected' : 'disconnected'}">
          ${this.connected ? 'Connected' : 'Disconnected'}
        </span>
      </header>

      <chat-messages .messages=${this.messages}></chat-messages>

      <chat-input
        .username=${this.username}
        @send-message=${this.handleSend}
      ></chat-input>
    `;
  }
}
