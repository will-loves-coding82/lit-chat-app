import { css, html, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { Router } from '@lit-labs/router';
import './login';
import './signup';
import './home-page'
import '../components/button'
import '../components/link'
import '../pages/dashboard/dashboard-router'
import { provide } from '@lit/context';
import { AuthContext, authContext } from '../context/authContext';
import { User } from '../api/types';

@customElement('root-router')
export class RootRouter extends LitElement {
  @provide({ context: authContext })

  // Create a reactive property to update and propogate context updates
  @property({attribute: false}) auth: AuthContext = {
    user: null,
    isAuthenticated: false,
    token: null,
    setAuth: (newAuth) => {
      this.auth = { ...this.auth, ...newAuth, setAuth: this.auth.setAuth };
    }
  };

  private router = new Router(this, [
    { path: '/', render: () => html`<home-page></home-page>` },
    { path: '/login', render: () => html`<login-page></login-page>` },
    { path: '/signup', render: () => html`<signup-page></signup-page>` },
    { path: '/dashboard/*', render: () => html`<dashboard-router></dashboard-router>` }
  ]);

  connectedCallback() {
    super.connectedCallback();
    this.router.hostConnected();
    this.checkAuth()
    window.removeEventListener('storage', this.handleStorageChange)
  }

  disconnectedCallback() {
    this.router.hostDisconnected();
    super.disconnectedCallback();
    window.removeEventListener('storage', this.handleStorageChange)
  }

  // If the token happened to be deleted, navigate to home
  private handleStorageChange = (e: StorageEvent) => {
    if (e.key === 'token' && !e.newValue) {
      window.location.href = '/'
    }
  }

  // This will always rerun on refresh and page navigation
  checkAuth() {
    const token = localStorage.getItem("token")
    const user = localStorage.getItem("user")
    this.auth.setAuth({
      ...this.auth,
      isAuthenticated: !!token,
      user: JSON.parse(user ?? "") as User,
      token: token
    })
  }

  static styles = css`
    :host {
      font-family: --apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-seri;
    }

    nav {
      position: fixed;
      width: 100%;
      box-sizing: border-box;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      padding: 0.2rem 10rem;
      margin: auto;
      background-color: var(--background-primary);
      border-bottom: 1px solid var(--color-default);
    }

    @media (max-width: 1240px) {
      nav {
        padding: 0.2rem 1rem;
      }
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

  protected render() {
    return html`
        <nav>
          <link-component href="/" color="default">
            <p slot="label">Home</p>
          </link-component>
          <span id="auth-btn-group">
            ${this.auth.isAuthenticated ?
              html`
                <link-component href="/dashboard/chats" style=${this.router.link().split("/")[-1] === "chats" ? "visibility:hidden;" : "display: block"}>
                  <button-component variant="solid" color="primary" size="md" slot="label"><p slot="label">chats</p></button-component>
                </link-component>
              `
              :
              html`
              <link-component href="/login" sty->
                <button-component variant="solid" color="primary" size="md" slot="label"><p slot="label">login</p></button-component>
              </link-component>
              <link-component href="/signup">
                <button-component variant="outline" color="primary" size="md" slot="label"><p slot="label">sign up</p></button-component>
              </link-component>
              `
           }
          </span>
        </nav>

      <main style="height: 100vh; margin: 0 auto;">
        ${this.router.outlet()}
      </main>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'root-router': RootRouter;
  }
}