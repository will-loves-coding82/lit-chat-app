import { consume } from "@lit/context";
import { css, html, LitElement, PropertyValues } from "lit";
import { customElement, query, state } from "lit/decorators.js";
import { AuthContext, authContext } from "../../context/authContext";
import './chats-page';
import '@carbon/web-components/es/components/modal/modal-body.js';
import '@carbon/web-components/es/components/modal/modal-header.js';
import '@carbon/web-components/es/components/modal/modal.js';
import '@carbon/web-components/es/components/modal/modal-footer-button.js';

@customElement('dashboard-router')
export class DashboardRouter extends LitElement {
  @consume({ context: authContext, subscribe: true })
  @state() auth!: AuthContext;
  @state() private activeChatId: string | undefined;
  @query("#unauthorized-modal") unauthorizedModal! : HTMLElement;
  
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

    #unauthorized-modal {
      z-index: 2000;
      overflow: hidden;
    }

     #unauthorized-modal-header {
      padding: 1rem;
     }
  `
  connectedCallback() {
    super.connectedCallback();
    this.onRouteChange();
    window.addEventListener('popstate', this.onRouteChange);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('popstate', this.onRouteChange);
  }

  private handleLogout = () => {
    localStorage.removeItem("token");
    this.unauthorizedModal.setAttribute("open", "");
  }

  private onRouteChange = () => {
    const match = window.location.pathname.match(/\/chats\/(.+)/);
    this.activeChatId = match?.[1];
  }

  private unauthorizedListener = (e: CustomEvent) => {
    this.unauthorizedModal.setAttribute("open", "")
  }



  render() {
    return html`
      <cds-modal id="unauthorized-modal" aria-label="" prevent-close-on-click-outside="" >
        <cds-modal-header id="unauthorized-modal-header">
          <cds-modal-heading>You are unauthorized. Please log in.</cds-modal-heading>
        </cds-modal-header>
        <cds-modal-footer>
          <cds-modal-footer-button @click=${()=> window.location.href = "/login"} kind="secondary" data-modal-close="">log in</cds-modal-footer-button>
      </cds-modal-footer>
      </cds-modal>
      <nav>
        <link-component href="/" color="default">
          <p slot="label">Home</p>
        </link-component>
        <span id="auth-btn-group">
          <p style="color: black;">${this.auth.user?.first_name}</p>
          <button-component @click=${this.handleLogout} variant="solid" color="primary" size="md" slot="label"><p slot="label">log out</p></button-component>
        </span>
      </nav>

      <main @unauthorized=${this.unauthorizedListener as EventListener}>
        <chats-page .activeChatId=${this.activeChatId}></chats-page>
      </main>
    `
  }
}
