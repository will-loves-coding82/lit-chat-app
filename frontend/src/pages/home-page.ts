import { Task } from "@lit/task";
import { css, html, LitElement, TemplateResult } from "lit";
import { customElement } from "lit/decorators.js";
import { getUsersCount } from "../api/users";
import '../components/icons/profile';
import '../components/chip';

@customElement('home-page')
export class HomePage extends LitElement {

  private _usersTask = new Task(this, {
    task: async() => {
      const res = await getUsersCount()
      if (res.error) {
        throw res.error
      }

      console.log(res.count)
      return res.count
    }
  })

  connectedCallback(): void {
    super.connectedCallback()
    this._usersTask.run()
  }
  
  static styles = css`
    header {
      padding: 12rem 0;
      text-align: center;
    }

    header h1 {
      font-size: 4rem;
      color: var(--color-);
      line-height: 3rem;
      font-weight: 500;
    }

    #icon-wrapper {
      width: 16px;
      height: 16px;
    }

    p#subtitle {
      color: var(--color-default);
      max-width: 300px;
      margin: auto;
      line-height: 1.5rem;
    }
  `
  render() {
    return html`
      <header>
        ${this._usersTask.render({
          complete: (count) => html`
            <chip-component variant="soft" color="success">
              <profile-icon slot="icon"></profile-icon>
              <p slot="label">${count} users</p>
            </chip-component>
          `
        })}
        <h1 id="title">Lit Chat App</h1>
        <p id="subtitle">A messaging app proudly built with Lit web components.</p>
      </header>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'home-page': HomePage
  }
}