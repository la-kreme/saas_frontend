import React from 'react';
import { createRoot } from 'react-dom/client';
import WidgetApp from './WidgetApp';
import styles from './index.css?inline'; // Vite injectera le CSS en string

class LakremeWidget extends HTMLElement {
  connectedCallback() {
    // Éviter de ré-attacher le root si le composant est déplacé
    if (this.shadowRoot) return;

    const shadow = this.attachShadow({ mode: 'open' });
    const restaurantId = this.getAttribute('restaurant-id');
    const lang = this.getAttribute('lang') || 'fr';

    if (!restaurantId) {
      shadow.innerHTML = `<div style="color:red;padding:20px;">Erreur : attribut restaurant-id manquant sur &lt;lakreme-widget&gt;</div>`;
      return;
    }

    // Injecter les styles dans le Shadow DOM
    const styleEl = document.createElement('style');
    styleEl.textContent = styles;
    shadow.appendChild(styleEl);

    // Div racine
    const mountPoint = document.createElement('div');
    shadow.appendChild(mountPoint);

    // Initialiser React
    const root = createRoot(mountPoint);
    root.render(<WidgetApp restaurantId={restaurantId} lang={lang} />);
  }
}

// Enregistrer le custom element
if (!customElements.get('lakreme-widget')) {
  customElements.define('lakreme-widget', LakremeWidget);
}
