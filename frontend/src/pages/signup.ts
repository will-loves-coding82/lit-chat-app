import { LitElement, html, css } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
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

  @query("#password") passwordInput!: HTMLInputElement
  @query("#confirm-password") confirmPasswordInput!: HTMLInputElement

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
      if (!!res.user) {
        console.log('Signup successful:', res.user);
        this.auth.setAuth({
          isAuthenticated: true,
          user: res.user,
          token: res.token
        })
        window.location.href = "/dashboard/chats"
      }
    },
    onError: () => {
      console.log("sign up failed")
      this.auth.setAuth({
        user: null,
        isAuthenticated: false
      })
    }
  })

  private handleSignUp() {
    this._signUpTask.run()
  }

  private handlePasswordChange() {
    if (this.passwordInput && this.confirmPasswordInput) {
      const passwordValue = this.passwordInput.value
      const confirmPasswordValue = this.confirmPasswordInput.value

      if (passwordValue != confirmPasswordValue) {
        this.confirmPasswordInput.setAttribute('invalid', '')
        this.confirmPasswordInput.setAttribute('invalid-text', 'passwords do not match')
      }
      else {
        this.confirmPasswordInput.removeAttribute('invalid')
        this.confirmPasswordInput.removeAttribute('invalid-text')
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