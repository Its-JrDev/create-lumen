import { configureStore } from "@reduxjs/toolkit";
import counterReducer from "@/features/home/store/counterSlice";

export const store = configureStore({
  reducer: {
    counter: counterReducer,
  },
});
