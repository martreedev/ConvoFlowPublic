import React from "react";
import ReactDOMClient from "react-dom/client";
import { QueryClientProvider, QueryClient } from "react-query";
import App from "./App.jsx";
const queryClient = new QueryClient();
ReactDOMClient.createRoot(document.getElementById("root")).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);
