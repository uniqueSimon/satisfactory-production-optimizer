import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App.tsx";
import './index.css'

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <div style={{ padding: 5, backgroundColor: "grey", borderRadius: 8 }}>
      <App />
    </div>
  </React.StrictMode>
);
