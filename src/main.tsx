import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import "./i18n/index";
import "./index.css";

console.log(
  "%c ALTO LÁ! 🛑",
  "color: #ef4444; font-size: 50px; font-weight: bold; text-shadow: 2px 2px 0 #000;",
);
console.log(
  '%cEsta é uma funcionalidade de browser voltada para programadores. Se alguém te disse para copiares e colares algo aqui para ativar um "hack" de moedas ou para "desbloquear todos os países", trata-se de um esquema e vai corromper o teu save.',
  "color: #cbd5e1; font-size: 16px;",
);

const root = document.getElementById("root");
if (!root) {
  throw new Error("[main] Root element #root not found in the document.");
}

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
