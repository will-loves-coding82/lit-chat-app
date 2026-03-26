import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import '@carbon/web-components/es/components/form/form.js';
import '@carbon/web-components/es/components/stack/stack.js';
import '@carbon/web-components/es/components/text-input/text-input.js';
import '../components/button';
import { Task } from '@lit/task';
import { login } from '../api/auth';
import { consume } from '@lit/context';
import { authContext, AuthContext } from '../context/authContext';

@customElement('login-page')
export class LogIn extends LitElement {
  @state() private _email = ""
  @state() private _password = ""
  @state() private _errorMessage = ""
  
  @consume({ context: authContext, subscribe: true })
  @state() auth!: AuthContext;
  
  private _logInTask = new Task(this, {
    task: async() => {
      if (this._password.length == 0 || this._email.length == 0) {
        this._errorMessage = "Email or password cannot be empty"
        return
      }
      const res = await login(this._email, this._password)
      if (res.error) {
        throw res.error
      }
      return res
    },
    onComplete: (res)=> {
      if (!!res) {
        this.auth.setAuth({
          isAuthenticated: true,
          user: res.user,
          token: res.token
        })
        window.location.href = "/dashboard/chats"
      }
    },
    onError: (error) => {
      console.log("Login failed: ", error)
      this._errorMessage = (error as Error).message || "Login failed. Please try again."
      this.auth.setAuth({
        user: null,
        isAuthenticated: false
      })
    }
  })

  private handleLogIn() {
    this._logInTask.run()
  }

  static styles = css`
   :host {
      display: flex;
      flex-direction: column;
      height: 100vh;
      max-width: 580px;
      margin: 0 auto;
      font-family: sans-serif;
    }

    header {
      padding: 12rem 0 2rem 0;
      text-align: center;
    }

    @media (max-width: 1240px) {
      header {
        padding-top: 4rem;
      }
      
      :host {
        padding: 1rem;
      }
    }

    .title {
      color: var(--color-foreground-primary);
      font-weight: 500;
    }

    #login-form {
      height: fit-content;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      background-color: var(--background-primary);
      padding: 2rem;
      border-radius: var(--radius-lg);
    }

    #login-form #email, #password {
      border-radius: var(--radius-lg) !important;
      margin: 0.5rem 0;
    }

    #error-message {
      color: #ef4444;
      font-size: var(--font-size-sm);
      margin-top: 0.75rem;
      text-align: center;
    }
  `;

  render() {
    return html`
      <header>
        <h1 class="title">Log into Lit Chat</h1>
      </header>

      <cds-form id="login-form">
          <cds-stack>
              <cds-text-input @input=${(e: Event) => this._email = (e.target as HTMLInputElement).value} id="email" label="Email" placeholder="email"></cds-text-input>
              <cds-text-input @input=${(e: Event) => this._password = (e.target as HTMLInputElement).value} id="password" showPasswordLabel="true" type="password" kind="secondary" label="Password" placeholder="password"></cds-text-input>
          </cds-stack>

          <span id="submit-button-wrapper" >
            <button-component @click=${this.handleLogIn} fullWidth style="margin-top: 1rem" variant="solid" color="primary" radius="sm" size="md"><p slot="label">log in</p></button-component>
          </span>
          ${this._errorMessage ? html`<p id="error-message">${this._errorMessage}</p>` : ''}
      </cds-form>
    `
  }
}