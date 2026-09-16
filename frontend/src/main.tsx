// frontend/src/main.tsx, full file
import "./theme.css";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ThemeStage } from "./ThemeStage";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeStage>
      <App />
    </ThemeStage>
  </React.StrictMode>
);