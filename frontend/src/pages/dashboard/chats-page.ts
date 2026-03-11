import { css, html, LitElement, PropertyValues } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import "@carbon/web-components/es/components/search/search.js";
import { Task } from "@lit/task";
import { searchUsers } from "../../api/users";
import { IncomingMessage, Chat, User, SenderMessage, MESSAGE_TYPES, MessageType } from "../../api/types";
import { getAllsChatsForUser, getChatMessages, getChatSummary, getOrCreateChat } from "../../api/chats";
import { consume } from "@lit/context";
import { authContext, AuthContext } from "../../context/authContext";
import { Message } from "../../types";
import '../../components/icons/message-chat-circle';
import '@carbon/web-components/es/components/form/form.js';
import '@carbon/web-components/es/components/stack/stack.js';
import '@carbon/web-components/es/components/text-input/text-input.js';
import { classMap } from "lit/directives/class-map.js";

// https://pyk.sh/cookbooks/typescript/how-to-debounce-a-function
function debounce(func: (...args: any[]) => any, wait: number) {
  let timeout: number | undefined;

  return function (this: any, ...args: any[]) {
    const context = this;
    clearTimeout(timeout);
    timeout = window.setTimeout(() => {
      func.apply(context, args);
    }, wait);
  };
}

@customElement('chats-page')
export class ChatsPage extends LitElement {
  @consume({ context: authContext, subscribe: true })
  @state() auth!: AuthContext;
  @property() activeChatId: string | undefined;  // driven by dashboard-router

  @state() selectedRecipient: User | undefined = undefined
  @state() chatsForUser: Array<Chat> = []
  @state() searchMatches: Array<User> = []
  @state() isSearchFocused = false;

  @query("#chats-list") chatsList!: HTMLOListElement
  @query("#search-matches-list") searchMatchesList!: HTMLOListElement

  private getChatsForUserTask = new Task(this, {
    task: async ([userId]) => {
      if (!userId) throw new Error("User ID undefined");
      const res = await getAllsChatsForUser(userId);
      if (res.error) {
        if (res.error.status == 401) {
          this.dispatchUnauthorized(res.error.message)
        }
        throw res.error;
      }
      return res.chats;
    },
    onComplete: (chats) => { this.chatsForUser = chats },
    onError: (error) => { console.log(error) },
    args: () => [this.auth.user?.id]
  })

  private getOrCreateChatTask = new Task(this, {
    task: async ([userId, recipientId]: readonly [number, number]) => {
      if (!userId || !recipientId) throw new Error("User ID or recipient ID is undefined");
      const res = await getOrCreateChat(userId, recipientId);
      if (res.error) {
        if (res.error.status == 401) this.dispatchUnauthorized(res.error.message);
        throw res.error;
      }
      return res.chat?.id;
    },
    onComplete: (chatId) => {
      window.history.pushState({}, '', `/dashboard/chats/${chatId}`);
      window.dispatchEvent(new PopStateEvent('popstate'));
    },
    onError: (error) => { console.error(error) }
  })

  private searchTask = new Task(this, {
    task: async ([query]: readonly [string]) => {
      const res = await searchUsers(query);
      if (res.error) {
        if (res.error.status == 401) this.dispatchUnauthorized(res.error.message);
        throw res.error;
      }
      return res.matches;
    },
    onComplete: (matches) => { this.searchMatches = matches },
    onError: (error) => { console.error(error) }
  })

  private dispatchUnauthorized(message: string) {
    this.dispatchEvent(new CustomEvent('unauthorized', {
      detail: { message },
      bubbles: true,
      composed: true
    }))
  }

  onSearchFocus() {
    this.isSearchFocused = true;
    this.searchMatchesList.style.display = "block"
    this.chatsList.style.display = "none"
  }

  onSearchBlur() {
    this.isSearchFocused = false;
    this.searchMatchesList.style.display = "none"
    this.chatsList.style.display = "block"
  }

  _handleSelectRecipient(recipient: User) {
    this.onSearchBlur();
    if (this.auth.user?.id !== undefined) {
      this.selectedRecipient = recipient
      this.getOrCreateChatTask.run([this.auth.user.id, recipient.id]);
    }
  }

  private handleSearch = debounce((value: string) => {
    if (value.length === 0) {
      this.searchMatches = [];
      this.onSearchBlur();
      return;
    }
    this.onSearchFocus();
    this.searchTask.run([value]);
  }, 1000)

    static styles = css`
  :host {
      display: flex;
      box-sizing: border-box;
      overflow-y: hidden;
      height: 100vh;  /* adjust 50px to match your header height */
    }

    aside#chats-tab  {
      height: 100%;
      padding: 5rem 1rem;
      width: 420px;
      background-color: var(--background-primary);
      border-right: 1px solid var(--color-default);
    }

    aside#chats-tab h1 {
      color: var(--color-foreground-primary);
      /* overflow-y: scroll; */
    }

    ol#search-matches-list {
      list-style: none;
      padding: 0;
      height: 100%;
    }

    ol#search-matches-list li.match-item {
      display: flex;
      flex-direction: column;
      height: fit-content;
      padding: 0.5rem;
      box-sizing: border-box;
      border-radius: var(--radius-sm);
      width: 100%;
      overflow-y: auto;
    }

    ol#search-matches-list li.match-item:hover {
      background-color: var(--background-secondary);
      cursor: pointer;
    }

    ol#search-matches-list li.match-item p {
      margin: 4px;
    }

    ol#search-matches-list p.match-email {
      font-size: var(--font-size-sm);
      color: var(--color-default);
    }

    ol#chats-list {
      list-style: none;
      padding: 0;
      overflow-y: auto;
    }

    ol#chats-list .chat-list-item {
      padding: 0.5rem 1rem;
      box-sizing: border-box;
      border-radius: var(--radius-md);
    }

    ol#chats-list .chat-list-item:hover {
      cursor: pointer;
      background-color: var(--background-secondary);
    }

    section#chat-message-container {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    #empty-state-wrapper {
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    #empty-state-wrapper #icon {
      height: 40px;
    }
  `

  render() {
    return html`
      <aside id="chats-tab">
        <cds-search
          id="search"
          @input=${(e: Event) => this.handleSearch((e.target as HTMLInputElement).value)}
          size="lg"
          close-button-label-text="Clear search input"
          label-text="Search"
          placeholder="Find people"
          type="text"
        ></cds-search>

        <ol id="chats-list">
          ${this.getChatsForUserTask.render({
            complete: (chats) => Array.from(chats).map((chat) => html`
              <li class="chat-list-item" 
                style=${this.activeChatId == chat.id.toString() ? "background-color: var(--background-secondary)" : "transparent"}
                @click=${() => {
                  window.history.pushState({}, '', `/dashboard/chats/${chat.id}`);
                  window.dispatchEvent(new PopStateEvent('popstate'));
                }}
              >
                <p>${chat.recipient.first_name} ${chat.recipient.last_name}</p>
              </li>
            `),
            error: (e) => html`<p>Failed to load chats</p>`
          })}
        </ol>

        <ol id="search-matches-list">
          ${this.searchTask.render({
            pending: () => html`<p>loading...</p>`,
            complete: () => this.searchMatches.length === 0
              ? html`<p>no results found</p>`
              : this.searchMatches.map((match) => html`
                  <li class="match-item" @click=${() => this._handleSelectRecipient(match)} id=${match.id}>
                    <p class="match-name">${match.first_name} ${match.last_name}</p>
                    <p class="match-email">${match.email}</p>
                  </li>
                `)
          })}
        </ol>
      </aside>

      <section id="chat-message-container">
        ${this.activeChatId !== undefined
          ? html`<chat-message-window .chatId=${this.activeChatId} .userId=${this.auth.user?.id?.toString() ?? ""}></chat-message-window>`
          : html`
              <span id="empty-state-wrapper">
                <message-chat-circle-icon id="icon"></message-chat-circle-icon>
                <p>Send a message to start chatting</p>
              </span>
            `
        }
      </section>
    `
  }
}

@customElement("chat-message-window")
export class ChatMessageWindow extends LitElement {
  @property({type: String}) chatId: string = ""
  @property({type: String}) userId: string = ""

  @consume({ context: authContext, subscribe: true })
  @state() auth!: AuthContext;

  @state() typingTimeout: ReturnType<typeof setTimeout> | null = null;
  @state() private input = ""
  @state() private messages: IncomingMessage[] = []
  @state() private recipientStatusMessage: IncomingMessage | null = null;
  @state() private recipientJoined: boolean = false

  @query("#messages-list") messagesListElement!: HTMLOListElement
  @query("#message-input") messageInputElement!: HTMLOListElement
  @state() typingUsers: Set<string> = new Set();

  private ws: WebSocket | null = null;

  private _getMessagesTask = new Task(this, {
    task: async([chatId]) => {
      if (!chatId) throw new Error("chatId is not defined");
      const res = await getChatMessages(chatId)
      if (res.error) {
        if (res.error.status == 401) this.dispatchUnauthorized(res.error.message);
        throw res.error;
      }
      this.messages = res.messages
    },
    onComplete: () => {this.scrollToBottom()},
    args: () => [this.chatId]
  })

  private _getChatDataTask = new Task(this, {
    task: async ([chatId]) => {
      const res = await getChatSummary(chatId);
      if (res.error) {
        if (res.error.status == 401) this.dispatchUnauthorized(res.error.message);
        throw res.error;
      }
      return res;
    },
    onError: (error) => { console.error(error) },
    args: () => [this.chatId]
  })


  private dispatchUnauthorized(message: string) {
    this.dispatchEvent(new CustomEvent('unauthorized', {
      detail: { message },
      bubbles: true,
      composed: true
    }))
  }

  updated(changedProperties: Map<string, unknown>) {
    if (changedProperties.has("chatId")) {
      console.log("chatId changed")
      this.recipientJoined = false
      this.closeWebSocket()
      this.messages = [];
      this.recipientStatusMessage = null;
      this.connectWs()
    }
  }

  private closeWebSocket() {
    if (this.ws){
      this.ws.onclose = null;
      this.ws?.close()
      this.ws = null;
    }
  }

  private connectWs() {
    const protocol = location.protocol === 'https:' ? 'wss' : 'ws';
    this.ws = new WebSocket(`${protocol}://${location.host}/ws`);

    this.ws.onopen = () => { 
      const joinMessage : SenderMessage = {
        type: MESSAGE_TYPES.USER_JOINED,
        sender_id: Number(this.userId),
        sender_name: this.auth.user?.first_name + " " + this.auth.user?.last_name,
        chat_id: Number(this.chatId),
        content: ""
      }
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws!.send(JSON.stringify(joinMessage))
      }
    };
    
    this.ws.onclose = () => {
      setTimeout(() => this.connectWs(), 3000);
    };
    
    this.ws.onmessage = (event: MessageEvent) => {
      const { type, message } = JSON.parse(event.data as string) as { type: MessageType, message: IncomingMessage };

      switch(message.type) {
        case "user_joined":
          console.log("Other recipient joined")
          this.recipientJoined = true;
          return

        case "room_state":
          console.log("Room state", message.members)
          if (message.members) {
            message.members.forEach(memberId => {
              if(String(memberId) != this.userId) {
                this.recipientJoined = true
              }
            })
          }
          return
        
        case "user_left":
          if (String(message.sender_id) !== this.userId) {
            this.recipientJoined = false;
          }
          return

        case "message":
          if (this.recipientStatusMessage) {
            this.messages = [...this.messages.slice(0, -1)]
            this.recipientStatusMessage = null
          }
          this.messages = [...this.messages, message];
          this.scrollToBottom()
          return
      
        case "user_typing_start":
          if (!this.recipientStatusMessage) {
            this.recipientStatusMessage = message
            this.messages = [...this.messages, message]
          }
          this.scrollToBottom()
          return
        
        case "user_typing_stop":
          const lastMessage =  this.messages[this.messages.length - 1]
          if (lastMessage.type === "user_typing_start") {
            this.messages = [...this.messages.slice(0, -1)]
            this.recipientStatusMessage = null
          }
          this.scrollToBottom()
          return
      }
    };
  }

  protected firstUpdated(_changedProperties: PropertyValues): void {
    // const element = this.shadowRoot?.querySelector('#message-input');
    this.messageInputElement.addEventListener("keypress", (e) => {
      if (e.key == "Enter") {
        this.handleSend()
        return
      }

      const typingMessage : SenderMessage = {
        type: MESSAGE_TYPES.USER_TYPING_START,
        sender_id: Number(this.userId),
        sender_name: this.auth.user?.first_name + " " + this.auth.user?.last_name,
        chat_id: Number(this.chatId),
        content: ""
      }
      this.ws!.send(JSON.stringify(typingMessage))

      if (this.typingTimeout) {
        clearTimeout(this.typingTimeout)
      }

      this.typingTimeout = setTimeout(()=> {
        const typingMessage : SenderMessage = {
          type: MESSAGE_TYPES.USER_TYPING_STOP,
          sender_id: Number(this.userId),
          sender_name: this.auth.user?.first_name + " " + this.auth.user?.last_name,
          chat_id: Number(this.chatId),
          content: ""
        }
        this.ws!.send(JSON.stringify(typingMessage))
      }, 1500)
    })
  }

  connectedCallback() {
    super.connectedCallback();
    this.connectWs();
    this._getMessagesTask.run();
  }

  disconnectedCallback() {
    const leftMessage : SenderMessage = {
      type: MESSAGE_TYPES.USER_LEFT,
      sender_id: Number(this.userId),
      sender_name: this.auth.user?.first_name + " " + this.auth.user?.last_name,
      chat_id: Number(this.chatId),
      content: ""
    }
    this.ws!.send(JSON.stringify(leftMessage))
  }

  private async scrollToBottom() {
    // Wait for the DOM to rerender with new messages before scrolling
    await this.updateComplete
    this.messagesListElement?.scrollTo({
      top: this.messagesListElement.scrollHeight,
      behavior: 'smooth'
    });
}

  handleSend() {
    if (this.input == "") return
    const message : SenderMessage = {
        type: MESSAGE_TYPES.MESSAGE,
        sender_id: Number(this.userId),
        sender_name: this.auth.user!.first_name + " " + this.auth.user!.last_name,
        chat_id: Number(this.chatId),
        content: this.input
      }
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws!.send(JSON.stringify(message))
      }

      this.messageInputElement.setAttribute("value", "")
  }

  static styles = css`
    :host {
      padding-top: 4rem ;
      box-sizing: border-box;
      height: 100%;
      width: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    #recipient-description {
      color: var(--color-foreground-primary);
      border-bottom: 1px solid var(--color-default);
      height: 4rem;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 4px;
      padding: 0 1rem;
    }

    #recipient-description p#recipient-name {
      margin: 0;
      padding: 0;
      color: var(--color-foreground-primary);
    }

    #recipient-name-status-wrapper {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 4px;
      margin: 0;
      padding: 0;
    }

    #recipient-description p#recipient-email {
      font-size: var(--font-size-sm);
      color: var(--color-default);
      margin: 0;
    }

    ol#messages-list {
      height: 100%;
      width: 100%;
      overflow-y: auto;
      overflow-x: hidden;
      list-style: none;
      box-sizing: border-box;
      padding: 0rem 1rem;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .message-bubble {
      border-radius: 8px;
      padding: 0.5rem 1rem;
    }

    .status-message {
      background: none;
      font-size: var(--font-size-sm);
      color: var(--color-default);
      margin-top: 1rem;
    }

    .own-message {
      align-self: flex-end;
      width: fit-content;
      height: fit-content;
      background-color: var(--color-primary);
      color: white;
    }

    .recipient-message {
      width: fit-content;
      height: fit-content;
      padding: 8px;
      background-color: var(--background-secondary);
    }

    #send-message-form {
      width: 100%;
      padding: 1rem;
      box-sizing: border-box;
      gap: 2rem;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
    }

    #send-message-form #message-input {
      width: 100%;
    }

    .active-status-circle {
      height: 8px;
      width: 8px;
      border-radius: var(--radius-full);
      background-color: var(--color-success);
    }

  `

  render() {
    return html`
      <div id="recipient-description">
        ${this._getChatDataTask.render({
          complete: (summary) => {
            return summary.members
              .filter(m => String(m.id) !== this.userId)
              .map(recipient => html`
                <span id="recipient-name-status-wrapper">
                  <p id="recipient-name">${recipient.first_name} ${recipient.last_name}</p>
                    <div id="join-status-circle" class=${classMap({'active-status-circle': this.recipientJoined})}></div>
                </span>
                <p id="recipient-email">${recipient.email}</p>
              `)
          }
        })}
      </div>

      <ol id="messages-list">
          ${this.messages.map(message => {
            const isOwn = String(message.sender_id) === this.userId;
            const isRegularMessage = !message.type || message.type === "message";

            return html`
                <li class=${classMap({
                    'message-bubble': isRegularMessage,
                    'own-message': isOwn && isRegularMessage,
                    'recipient-message': !isOwn && isRegularMessage,
                    'status-message': !isRegularMessage
                  })}>
                  ${message.content}
                </li>  
              `
            }
          )}
      </ol>

      <form id="send-message-form">
        <cds-text-input @input=${(e: Event) => this.input = (e.target as HTMLInputElement).value} id="message-input" placeholder="type something"></cds-text-input>
        <button-component @click=${this.handleSend} variant="solid" color="primary" radius="sm" size="md"><p slot="label">send</p></button-component>
      </form>
    `
  }
}
