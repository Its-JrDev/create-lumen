import { Provider } from "react-redux";
import { store } from "@/stores";

export function StoreProvider({ children }) {
  return <Provider store={store}>{children}</Provider>;
}
