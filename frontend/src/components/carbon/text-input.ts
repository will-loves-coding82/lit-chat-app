
import CDSTextInput from '@carbon/web-components/es/components/text-input/text-input.js';
import { css } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('my-dropdown')
class MyTextInput extends CDSTextInput {
  // Custom CSS to enforce `field-02` (light) style of the dropdown
  static styles = css`
    ${CDSTextInput.styles}
    .cds--list-box {
      background-color: white;
    }
  `;
}