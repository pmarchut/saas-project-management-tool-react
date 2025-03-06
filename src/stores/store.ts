import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authUserSlice";
import alertsReducer from "./alertsSlice";
import { alertsMiddleware } from "./alertsMiddleware";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    alerts: alertsReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(alertsMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
