import UAParser from 'ua-parser-js'
import { LitElement, css, html } from 'lit';

export class SimpleGreeting extends LitElement {
    name: string;

    static properties = {
        name: {},
    };

    // Define scoped styles right with your component, in plain CSS
    static styles = css`
    :host {
      color: blue;
    }
  `;

    constructor() {
        super();
        const ua = new UAParser(navigator.userAgent);

        // Declare reactive properties
        this.name = ua.getBrowser().name || 'World';
    }

    // Render the UI as a function of component state
    render() {
        return html`<p>Hello, ${this.name}!</p>`;
    }
}

customElements.define('simple-greeting', SimpleGreeting);