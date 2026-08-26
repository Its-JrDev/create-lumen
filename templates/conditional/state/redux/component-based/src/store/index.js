import { configureStore } from "@reduxjs/toolkit";
import counterReducer from "@/pages/Home/counterSlice";

export const store = configureStore({
  reducer: {
    counter: counterReducer,
  },
});
