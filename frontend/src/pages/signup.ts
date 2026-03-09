import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import '@carbon/web-components/es/components/form/form.js';
import '@carbon/web-components/es/components/stack/stack.js';
import '@carbon/web-components/es/components/text-input/text-input.js';
import '../components/button';
import { signup } from '../api/auth';
import { Task } from '@lit/task';
import { consume } from '@lit/context';
import { authContext, AuthContext } from '../context/authContext';

@customElement('signup-page')
export class SignUp extends LitElement {

  @state() private _first_name = ""
  @state() private _last_name = ""
  @state() private _email = ""
  @state() private _password = ""

  @consume({ context: authContext, subscribe: true })
  @state() auth!: AuthContext;
  
  private _signUpTask = new Task(this, {
    task: async() => {
      const res = await signup(this._first_name, this._last_name, this._email, this._password)
      if (res.error) {
        throw res.error
      }
      return res
    },
    onComplete: (res)=> {
      if (!!res) {
        console.log('Signup successful:', res.user);
        this.auth = {
          ...this.auth,
          isAuthenticated: true,
          token: res.token
        }
        window.location.href = "/chats"
      }
    },
    onError: () => {
      console.log("sign up failed")
      this.auth = {
        ...this.auth,
        isAuthenticated: false
      }
    }
  })

  private handleSignUp() {
    this._signUpTask.run()
  }

  private handlePasswordChange() {
    const password = this.shadowRoot?.querySelector<HTMLInputElement>("#password")
    const confirmPassword = this.shadowRoot?.querySelector<HTMLInputElement>("#confirm-password")

    if (password && confirmPassword) {
      const passwordValue = password.value
      const confirmPasswordValue = confirmPassword.value

      if (passwordValue != confirmPasswordValue) {
        confirmPassword.setAttribute('invalid', '')
        confirmPassword.setAttribute('invalid-text', 'passwords do not match')
      }
      else {
        confirmPassword.removeAttribute('invalid')
        confirmPassword.removeAttribute('invalid-text')
        this._password = passwordValue
      }
    }
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

    #signup-form {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      background-color: var(--background-primary);
      padding: 2rem;
      border-radius: var(--radius-lg);

    }
    #signup-form cds-text-input {
      border-radius: var(--radius-lg) !important;
      margin: 0.5rem 0;
    }
  `;

  render() {
    return html`
      <header>
        <h1 class="title">Create an account</h1>
      </header>

      <p>${this._first_name}</p>
      <p>${this._last_name}</p>
      <p>${this._email}</p>
            <p>${this._password}</p>
      <cds-form id="signup-form">
          <cds-stack gap="16">
              <cds-text-input @input=${(e: Event) => this._first_name = (e.target as HTMLInputElement).value} id="first-name" label="First Name" placeholder="last name"></cds-text-input>
              <cds-text-input @input=${(e: Event) => this._last_name = (e.target as HTMLInputElement).value} id="last-name" label="Last name" placeholder="first name"></cds-text-input>
              <cds-text-input @input=${(e: Event) => this._email = (e.target as HTMLInputElement).value} id="email" label="Email" placeholder="email"></cds-text-input>
              <cds-text-input @input=${this.handlePasswordChange} id="password" type="password" kind="secondary" label="Password" placeholder="password"></cds-text-input>
              <cds-text-input @input=${this.handlePasswordChange} id="confirm-password" type="password" kind="secondary" label="Confirm Password" placeholder="confirm password" invalidText=''></cds-text-input>
          </cds-stack>

          <span id="submit-button-wrapper" >
            <button-component @click=${this.handleSignUp} fullWidth style="margin-top: 1rem" variant="solid" color="primary" radius="sm" size="md" slot="label"><p slot="label">sign up</p></button-component>
          </span>
      </cds-form>
    `
  }
}