import { consume } from "@lit/context";
import { css, html, LitElement } from "lit";
import { customElement, state } from "lit/decorators.js";
import { AuthContext, authContext } from "../../context/authContext";
import './chats-page';

@customElement('dashboard-router')
export class DashboardRouter extends LitElement {
  @consume({ context: authContext, subscribe: true })
  @state() auth!: AuthContext;
  @state() _activeChatId: string | undefined;

  static styles = css`
    nav {
      position: fixed;
      width: 100%;
      box-sizing: border-box;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      padding: 0.2rem 1rem;
      margin: auto;
      background-color: var(--background-primary);
      border-bottom: 1px solid var(--color-default);
      z-index: 1000;
    }
    
    nav > span#auth-btn-group {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    nav a {
      text-decoration: none;
      font-size: 0.8rem;
      color: black;
    }
  `
  connectedCallback() {
    super.connectedCallback();
    this._onRouteChange();
    window.addEventListener('popstate', this._onRouteChange);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('popstate', this._onRouteChange);
  }

  private _onRouteChange = () => {
    const match = window.location.pathname.match(/\/chats\/(.+)/);
    this._activeChatId = match?.[1];
  }

  private _unauthorizedListener = (e: CustomEvent) => {
    window.location.href = "/login"
  }

  render() {
    return html`
      <nav>
        <link-component href="/" color="default">
          <p slot="label">Home</p>
        </link-component>
        <span id="auth-btn-group">
          <p style="color: black;">${this.auth.user?.first_name}</p>
          <button-component variant="solid" color="primary" size="md" slot="label"><p slot="label">log out</p></button-component>
        </span>
      </nav>

      <main @unauthorized=${this._unauthorizedListener as EventListener}>
        <chats-page .activeChatId=${this._activeChatId}></chats-page>
      </main>
    `
  }
}
