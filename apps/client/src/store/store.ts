import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { persistReducer, persistStore, FLUSH, PAUSE, PERSIST, PURGE, REGISTER, REHYDRATE } from "redux-persist";

import { baseApi } from "./api";
import authReducer from "./slices/auth-slice";
import cartReducer from "./slices/cart-slice";
import inventoryReducer from "./slices/inventory-slice";
import salesReducer from "./slices/sales-slice";
import storage from "./storage";

const authPersistConfig = {
  key: "auth",
  storage,
  whitelist: ["session"]
};

const cartPersistConfig = {
  key: "cart",
  storage,
  whitelist: ["items"]
};

const rootReducer = combineReducers({
  [baseApi.reducerPath]: baseApi.reducer,
  auth: persistReducer(authPersistConfig, authReducer),
  cart: persistReducer(cartPersistConfig, cartReducer),
  inventory: inventoryReducer,
  sales: salesReducer
});

export function makeStore() {
  const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER]
        }
      }).concat(baseApi.middleware)
  });

  setupListeners(store.dispatch);

  return store;
}

export function makePersistor(store: AppStore) {
  return persistStore(store);
}

export type RootState = ReturnType<typeof rootReducer>;
export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = AppStore["dispatch"];
export type AppPersistor = ReturnType<typeof makePersistor>;
