// Import commands.js using ES2015 syntax:
import './commands';

// Hide fetch/XHR requests in the Cypress command log
const app = window.top;
if (!app.document.head.querySelector('[data-hide-network-requests]')) {
  const style = app.document.createElement('style');
  style.setAttribute('data-hide-network-requests', '');
  style.innerHTML = '.command-name-request, .command-name-xhr { display: none }';
  app.document.head.appendChild(style);
}