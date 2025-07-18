import React from "react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import { DashboardProvider } from "./context/DashboardContext.jsx";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
  <DashboardProvider>
      <App />
  </DashboardProvider>
  </BrowserRouter>
);
