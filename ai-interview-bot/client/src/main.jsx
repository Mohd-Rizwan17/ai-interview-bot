import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import AppRoutes from "./routes/AppRoutes.jsx";
import { store } from "./store/index.js";
import "./index.css";
import ServerWakeGate from "./components/ServerWakeGate.jsx";

createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <ServerWakeGate>
      <AppRoutes />
    </ServerWakeGate>
  </Provider>,
);
