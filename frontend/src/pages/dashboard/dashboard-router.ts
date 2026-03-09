import { consume, provide } from "@lit/context";
import { css, html, LitElement } from "lit";
import { customElement, state } from "lit/decorators.js";
import { AuthContext, authContext } from "../../context/authContext";
import { Routes } from "@lit-labs/router";
import './messages-page';

@customElement('dashboard-router')
export class DashboardRouter extends LitElement {

  @consume({ context: authContext, subscribe: true })
  @state() private auth!: AuthContext;
  
  private router = new Routes(this, [
    { path: 'chats', render: () => html`<chats-page></chats-page>` },
  ]);

  static styles = css`
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
      border-bottom: 1px solid rgb(195, 195, 195);
    }
    
    nav > span#auth-btn-group {
      display: flex;
      align-items: center;
      gap: 16px;
    }
  `
  render() {
    return html`
      <nav>
      <link-component href="/" color="default">
        <p slot="label">Home</p>
      </link-component>
      <span id="auth-btn-group">
          <button-component variant="solid" color="primary" size="md" slot="label"><p slot="label">log out</p></button-component>
        </link-component>
      </span>
      </nav>
      ${this.router.outlet()}
    `
  }
}
