import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "sonner";
import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import ErrorBoundary from "./components/errors/ErrorBoundary.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <Toaster position="bottom-right" richColors closeButton={false} />
        <App />
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>,
);
