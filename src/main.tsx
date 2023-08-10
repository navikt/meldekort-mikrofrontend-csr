import React from "react";
import ReactDOM from "react-dom/client";
import Mikrofrontend from "./Mikrofrontend";
import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(
  <React.StrictMode>
    <main>
      <Mikrofrontend />
    </main>
  </React.StrictMode>
);
