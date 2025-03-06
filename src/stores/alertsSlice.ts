import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { v4 as uuid } from "uuid";

export type AlertStyle = "error" | "success" | "warning" | "info" | "none";

export interface AlertOptions {
  html?: boolean;
  closable?: boolean;
  timeout?: number | false;
  style?: AlertStyle;
}

const defaultOptions: Required<AlertOptions> = {
  closable: true,
  html: false,
  timeout: 3000,
  style: "info",
};

export interface Alert extends AlertOptions {
  id: string;
  message: string;
}

interface AlertsState {
  items: Alert[];
}

const initialState: AlertsState = {
  items: [],
};

const alertsSlice = createSlice({
  name: "alerts",
  initialState,
  reducers: {
    notify: {
        reducer(state, action: PayloadAction<Alert>) {
          state.items.push(action.payload);
        },
        prepare(message: string, style: AlertStyle, options?: AlertOptions) {
            return {
                payload: {
                    id: uuid(), // Id generowane tylko tutaj
                    message,
                    ...Object.assign({}, defaultOptions, { style }, options),
                },
            };
        },
    },

    remove: (state, action: PayloadAction<string>) => {
        state.items = state.items.filter(alert => alert.id !== action.payload);
    },
  },
});

// Aliasy do `notify`, które od razu zwracają gotowe obiekty akcji
export const success = (message: string, options?: AlertOptions) =>
    alertsSlice.actions.notify(message, "success", options);
  
export const error = (message: string, options?: AlertOptions) =>
    alertsSlice.actions.notify(message, "error", options);
  
export const warning = (message: string, options?: AlertOptions) =>
    alertsSlice.actions.notify(message, "warning", options);
  
export const info = (message: string, options?: AlertOptions) =>
    alertsSlice.actions.notify(message, "info", options);
  
export const { notify, remove } = alertsSlice.actions;
export default alertsSlice.reducer;
