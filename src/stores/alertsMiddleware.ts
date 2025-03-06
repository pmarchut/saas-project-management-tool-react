import { Middleware } from "@reduxjs/toolkit";
import { notify, remove } from "./alertsSlice";

export const alertsMiddleware: Middleware = (store) => (next) => (action) => {
  if (notify.match(action)) {
    const { timeout, id } = action.payload;

    if (timeout !== false) {
      setTimeout(() => {
        store.dispatch(remove(id));
      }, timeout);
    }
  }

  return next(action);
};
